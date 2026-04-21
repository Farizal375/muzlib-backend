"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.googleSignIn = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_js_1 = require("@supabase/supabase-js");
const prisma = new client_1.PrismaClient();
// Supabase admin client — lazy initialization agar tidak crash saat ENV belum terisi
let _supabaseAdmin = null;
function getSupabaseAdmin() {
    if (_supabaseAdmin)
        return _supabaseAdmin;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || key === 'ISI_DENGAN_SERVICE_ROLE_KEY_ANDA') {
        throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env');
    }
    _supabaseAdmin = (0, supabase_js_1.createClient)(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    return _supabaseAdmin;
}
// Helper: generate JWT Express
function generateToken(payload) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('Sistem belum dikonfigurasi: JWT_SECRET tidak ditemukan');
    }
    return jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '1d' });
}
// ============================================================
// FUNGSI REGISTER (Email + Password)
// ============================================================
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Type Guarding & Validasi
        if (!email || !password || !name) {
            res.status(400).json({ success: false, message: 'Nama, Email, dan password wajib diisi' });
            return;
        }
        // Pengecekan email duplikat
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
            return;
        }
        // Hashing password dengan tingkat keamanan 10 salt rounds
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Pembuatan user baru di database
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan internal' });
        }
    }
};
exports.register = register;
// ============================================================
// FUNGSI LOGIN (Email + Password)
// ============================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
            return;
        }
        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
            return;
        }
        // User SSO tidak punya password — tolak login via password
        if (!user.password) {
            res.status(401).json({
                success: false,
                message: 'Akun ini terdaftar melalui Google. Silakan login dengan Google.'
            });
            return;
        }
        // Verifikasi kecocokan password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
            return;
        }
        // Susun payload token
        const payload = {
            id: user.id,
            email: user.email ?? '',
            role: user.role
        };
        const token = generateToken(payload);
        res.status(200).json({
            success: true,
            message: 'Login berhasil',
            token,
            data: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan internal' });
        }
    }
};
exports.login = login;
// ============================================================
// FUNGSI GOOGLE SIGN-IN (SSO — untuk Flutter)
// POST /api/auth/google-signin
// Body: { supabaseToken: string }  ← Supabase Access Token dari Flutter
// ============================================================
const googleSignIn = async (req, res) => {
    try {
        const { supabaseToken } = req.body;
        if (!supabaseToken) {
            res.status(400).json({ success: false, message: 'Supabase Token wajib disertakan' });
            return;
        }
        // 1. Verifikasi Supabase Token via Supabase JS client (cara resmi)
        const { data: { user: supabaseUser }, error: supabaseError } = await getSupabaseAdmin().auth.getUser(supabaseToken);
        if (supabaseError || !supabaseUser) {
            console.error('[googleSignIn] Supabase token error:', supabaseError?.message);
            res.status(401).json({
                success: false,
                message: 'Supabase Token tidak valid atau sudah kedaluwarsa'
            });
            return;
        }
        const email = supabaseUser.email;
        const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name;
        const picture = supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture;
        if (!email) {
            res.status(401).json({
                success: false,
                message: 'Gagal mengambil email dari Supabase Token'
            });
            return;
        }
        // 2. Cari atau buat user di database (upsert berdasarkan email)
        //    Gunakan findFirst + create/update secara terpisah untuk menghindari
        //    konflik tipe Prisma pada upsert dengan relasi nested (accounts.create)
        let user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, image: true, role: true },
        });
        if (user) {
            // User sudah ada — perbarui nama & foto
            user = await prisma.user.update({
                where: { email },
                data: {
                    ...(name !== undefined && { name }),
                    ...(picture !== undefined && { image: picture }),
                    emailVerified: new Date(),
                },
                select: { id: true, email: true, name: true, image: true, role: true },
            });
        }
        else {
            // User belum ada — buat baru beserta relasi Account Google
            user = await prisma.user.create({
                data: {
                    email,
                    name: name ?? null,
                    image: picture ?? null,
                    emailVerified: new Date(),
                    password: null,
                    role: 'USER',
                    accounts: {
                        create: {
                            type: 'oauth',
                            provider: 'google',
                            providerAccountId: supabaseUser.id,
                        },
                    },
                },
                select: { id: true, email: true, name: true, image: true, role: true },
            });
        }
        // 3. Generate JWT Express
        const payload = {
            id: user.id,
            email: user.email ?? '',
            role: user.role,
        };
        const token = generateToken(payload);
        // 4. Kembalikan token + data user
        res.status(200).json({
            success: true,
            message: 'Login dengan Google berhasil',
            token,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role,
            },
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan internal saat Google Sign-In' });
        }
    }
};
exports.googleSignIn = googleSignIn;
// ============================================================
// FUNGSI UPDATE PROFILE
// PUT /api/auth/profile
// Body: { name: string }
// ============================================================
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Akses ditolak' });
            return;
        }
        const { name } = req.body;
        if (!name || name.trim() === '') {
            res.status(400).json({ success: false, message: 'Nama tidak boleh kosong' });
            return;
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: name.trim() },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
            }
        });
        res.status(200).json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: updatedUser
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan internal saat update profil' });
        }
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=authController.js.map