// File: src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Definisikan bentuk Payload JWT yang sama dengan yang kita buat di Auth Controller
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}


export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Ambil token dari header Authorization (Format: "Bearer <token>")
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: "Akses ditolak: Token tidak ditemukan atau format salah" });
      return;
    }

    // Ekstrak hanya tokennya saja (hilangkan kata "Bearer ")
    const token: string = authHeader.split(' ')[1];

    // Validasi keberadaan secret key
    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("Sistem belum dikonfigurasi: JWT_SECRET tidak ditemukan");
    }

    // Verifikasi token (jika gagal, akan otomatis melempar error dan masuk ke catch)
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Sisipkan data payload ke dalam request object agar bisa dipakai di controller
    req.user = decoded;

    // Lanjutkan ke fungsi rute (controller) berikutnya
    next();

  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: "Akses ditolak: Token sudah kedaluwarsa" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: "Akses ditolak: Token tidak valid" });
    } else if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal saat verifikasi token" });
    }
  }
};

/**
 * Middleware untuk memastikan pengguna memiliki peran ADMIN
 * Harus diletakkan SETELAH verifyToken
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // Pengecekan keamanan ganda untuk memastikan req.user sudah ada (seharusnya sudah dijamin oleh verifyToken)
  if (!req.user) {
    res.status(401).json({ success: false, message: "Autentikasi diperlukan sebelum mengecek hak akses" });
    return;
  }

  // Cek apakah rolenya ADMIN
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: "Akses ditolak: Membutuhkan hak akses Administrator" });
    return;
  }

  // Lanjut jika lolos
  next();
};