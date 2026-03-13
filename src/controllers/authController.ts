import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 1. Definisikan tipe untuk Request Body secara eksplisit
interface AuthRequestBody {
  email?: string;
  password?: string;
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
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}


// FUNGSI REGISTER
export const register = async (
  req: Request<Record<string, never>, Record<string, never>, AuthRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Type Guarding & Validasi
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
      return;
    }

    // Pengecekan email duplikat
    const existingUser: User | null = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: "Email sudah terdaftar" });
      return;
    }

    // Hashing password dengan tingkat keamanan 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Pembuatan user baru di database
    const newUser: UserWithPassword = await prisma.user.create({
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

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};


// FUNGSI LOGIN

export const login = async (
  req: Request<Record<string, never>, Record<string, never>, AuthRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
      return;
    }

    // Cari user berdasarkan email
    const user: UserWithPassword | null = await prisma.user.findUnique({
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
    const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Kredensial tidak valid" });
      return;
    }

    // Validasi tipe untuk Environment Variable
    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("Sistem belum dikonfigurasi: JWT_SECRET tidak ditemukan");
    }

    // Susun data yang akan diselipkan ke dalam token (Payload)
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Buat token JWT yang berlaku selama 24 jam
    const token: string = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

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

  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};