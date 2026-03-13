// File: src/controllers/userController.ts
import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 1. Definisikan tipe untuk Request Params (URL Parameters)
interface UserParams {
  id: string;
}

// 2. Definisikan tipe untuk Request Body saat update role
interface UpdateRoleBody {
  role?: Role; 
}

// 3. Definisikan tipe untuk Create User
interface CreateUserBody {
  name?: string;
  email: string;
  password: string;
  role?: Role;
}

// 4. Definisikan tipe untuk Update User
interface UpdateUserBody {
  name?: string;
  email?: string;
  password?: string;
}

// 5. Definisikan tipe khusus untuk Data Update Prisma (Pengganti 'any')
interface PrismaUpdateData {
  name?: string | null;
  email?: string;
  password?: string;
}

// ---------------------------------------------------------
// GET /api/users - Mengambil semua data user (Kecuali Password)
// ---------------------------------------------------------
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: users });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};

// ---------------------------------------------------------
// POST /api/users - Membuat user baru (Admin Only)
// ---------------------------------------------------------
export const createUser = async (
  req: Request<Record<string, never>, Record<string, never>, CreateUserBody>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role = 'USER' } = req.body;

    // Validasi input
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
      return;
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: "Email sudah terdaftar" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: "User baru berhasil dibuat",
      data: newUser
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};

// ---------------------------------------------------------
// PUT /api/users/:id - Update user (Admin dapat update data user manapun)
// ---------------------------------------------------------
export const updateUser = async (
  req: Request<UserParams, Record<string, never>, UpdateUserBody>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Validasi ID
    if (!id) {
      res.status(400).json({ success: false, message: "ID User tidak valid" });
      return;
    }

    // Pastikan user ada
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      res.status(404).json({ success: false, message: "User tidak ditemukan" });
      return;
    }

    // Jika email baru, cek apakah sudah terpakai (dan bukan milik user ini)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        res.status(409).json({ success: false, message: "Email sudah terdaftar" });
        return;
      }
    }

    // PERBAIKAN: Menggunakan interface PrismaUpdateData alih-alih tipe 'any'
    const updateData: PrismaUpdateData = {};
    
    if (name !== undefined) updateData.name = name || null;
    if (email !== undefined) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: "User berhasil diperbarui",
      data: updatedUser
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};

// ---------------------------------------------------------
// PUT /api/users/:id/role - Mempromosikan / Menurunkan Role User
// ---------------------------------------------------------
export const updateUserRole = async (
  req: Request<UserParams, Record<string, never>, UpdateRoleBody>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Type Guarding & Validasi
    if (!id) {
      res.status(400).json({ success: false, message: "ID User tidak valid" });
      return;
    }

    if (!role || (role !== 'ADMIN' && role !== 'USER')) {
      res.status(400).json({ success: false, message: "Format role tidak valid (harus ADMIN atau USER)" });
      return;
    }

    // Pastikan user yang akan diupdate ada di database
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      res.status(404).json({ success: false, message: "User tidak ditemukan" });
      return;
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    res.status(200).json({ 
      success: true, 
      message: `Role berhasil diubah menjadi ${role}`, 
      data: updatedUser 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};

// ---------------------------------------------------------
// DELETE /api/users/:id - Menghapus User Permanen
// ---------------------------------------------------------
export const deleteUser = async (
  req: Request<UserParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: "ID User tidak valid" });
      return;
    }

    // Pastikan user ada sebelum dihapus
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      res.status(404).json({ success: false, message: "User tidak ditemukan" });
      return;
    }

    // Eksekusi penghapusan
    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({ 
      success: true, 
      message: "User beserta seluruh bookmarknya berhasil dihapus permanen" 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};