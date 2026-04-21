import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Supabase admin client — lazy initialization agar tidak crash saat ENV belum terisi
let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || key === 'ISI_DENGAN_SERVICE_ROLE_KEY_ANDA') {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env');
  }
  _supabaseAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return _supabaseAdmin;
}

// 1. Definisikan tipe untuk Request Body secara eksplisit
interface AuthRequestBody {
  email?: string;
  password?: string;
  name?: string;
}

// 2. Definisikan tipe untuk isi dari Token JWT
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// 3. Definisikan tipe untuk User dengan password
interface UserWithPassword {
  id: string;
  name: string | null;
  email: string | null;
  password: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// 4. Tipe untuk request body Google Sign-In (sekarang via Supabase)
interface GoogleSignInBody {
  supabaseToken?: string;
}

// Helper: generate JWT Express
function generateToken(payload: JwtPayload): string {
  const jwtSecret: string | undefined = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Sistem belum dikonfigurasi: JWT_SECRET tidak ditemukan');
  }
  return jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
}


// ============================================================
// FUNGSI REGISTER (Email + Password)
// ============================================================
export const register = async (
  req: Request<Record<string, never>, Record<string, never>, AuthRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Type Guarding & Validasi
    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: 'Nama, Email, dan password wajib diisi' });
      return;
    }

    // Pengecekan email duplikat
    const existingUser: User | null = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      return;
    }

    // Hashing password dengan tingkat keamanan 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Pembuatan user baru di database
    const newUser: UserWithPassword = await prisma.user.create({
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

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Terjadi kesalahan internal' });
    }
  }
};


// ============================================================
// FUNGSI LOGIN (Email + Password)
// ============================================================
export const login = async (
  req: Request<Record<string, never>, Record<string, never>, AuthRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
      return;
    }

    // Cari user berdasarkan email
    const user: UserWithPassword | null = await prisma.user.findUnique({
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
    const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Kredensial tidak valid' });
      return;
    }

    // Susun payload token
    const payload: JwtPayload = {
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

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Terjadi kesalahan internal' });
    }
  }
};


// ============================================================
// FUNGSI GOOGLE SIGN-IN (SSO — untuk Flutter)
// POST /api/auth/google-signin
// Body: { supabaseToken: string }  ← Supabase Access Token dari Flutter
// ============================================================
export const googleSignIn = async (
  req: Request<Record<string, never>, Record<string, never>, GoogleSignInBody>,
  res: Response
): Promise<void> => {
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
    } else {
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
    const payload: JwtPayload = {
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

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Terjadi kesalahan internal saat Google Sign-In' });
    }
  }
};

// ============================================================
// FUNGSI UPDATE PROFILE
// PUT /api/auth/profile
// Body: { name: string }
// ============================================================
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
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

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Terjadi kesalahan internal saat update profil' });
    }
  }
};