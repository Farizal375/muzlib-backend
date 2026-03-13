import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalBooks, totalBookmarks] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.bookmark.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalBookmarks
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