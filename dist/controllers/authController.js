"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
// FUNGSI REGISTER
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Type Guarding & Validasi
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
            return;
        }
        // Pengecekan email duplikat
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({ success: false, message: "Email sudah terdaftar" });
            return;
        }
        // Hashing password dengan tingkat keamanan 10 salt rounds
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Pembuatan user baru di database
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(201).json({
            success: true,
            message: "Registrasi berhasil",
            data: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else {
            res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
        }
    }
};
exports.register = register;
// FUNGSI LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
            return;
        }
        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(401).json({ success: false, message: "Kredensial tidak valid" });
            return;
        }
        // Verifikasi kecocokan password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: "Kredensial tidak valid" });
            return;
        }
        // Validasi tipe untuk Environment Variable
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("Sistem belum dikonfigurasi: JWT_SECRET tidak ditemukan");
        }
        // Susun data yang akan diselipkan ke dalam token (Payload)
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        // Buat token JWT yang berlaku selama 24 jam
        const token = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '1d' });
        res.status(200).json({
            success: true,
            message: "Login berhasil",
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
            res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
        }
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map