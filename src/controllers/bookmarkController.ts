// File: src/controllers/bookmarkController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface untuk Request Body saat menambah bookmark
interface BookmarkBody {
  bookId?: string;
}

// Interface untuk Request Params saat menghapus bookmark berdasarkan bookId
interface BookmarkParams {
  bookId: string;
}

// Interface untuk payload toggle dari Frontend (OpenLibrary metadata)
interface ToggleBookmarkBody {
  openLibraryId: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  publishYear?: number;
}


// GET /api/bookmarks - Melihat semua bookmark milik user yang sedang login

export const getMyBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user dijamin ada karena sudah melewati verifyToken
    const userId = req.user?.id; 

    if (!userId) {
      res.status(401).json({ success: false, message: "Akses ditolak: User ID tidak ditemukan" });
      return;
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: { 
        book: true // Langsung gabungkan (JOIN) dengan detail bukunya
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: bookmarks });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};

// POST /api/bookmarks - Menambahkan buku ke bookmark

export const addBookmark = async (
  req: Request<Record<string, never>, Record<string, never>, BookmarkBody>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { bookId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Akses ditolak" });
      return;
    }

    if (!bookId) {
      res.status(400).json({ success: false, message: "bookId wajib dikirimkan" });
      return;
    }

    // 1. Pastikan buku yang mau di-bookmark itu nyata (ada di DB)
    const bookExists = await prisma.book.findUnique({ where: { id: bookId } });
    if (!bookExists) {
      res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
      return;
    }

    // 2. Cek apakah sudah pernah di-bookmark sebelumnya (karena ada @@unique([userId, bookId]))
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_bookId: { userId, bookId }
      }
    });

    if (existingBookmark) {
      res.status(400).json({ success: false, message: "Buku ini sudah ada di daftar bookmark Anda" });
      return;
    }

    // 3. Tambahkan ke database
    const newBookmark = await prisma.bookmark.create({
      data: { userId, bookId }
    });

    res.status(201).json({ success: true, message: "Berhasil ditambahkan ke bookmark", data: newBookmark });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};


// DELETE /api/bookmarks/book/:bookId - Menghapus bookmark

export const removeBookmark = async (
  req: Request<BookmarkParams>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { bookId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Akses ditolak" });
      return;
    }

    if (!bookId) {
      res.status(400).json({ success: false, message: "ID Buku tidak valid" });
      return;
    }

    // Cek apakah bookmarknya memang ada
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_bookId: { userId, bookId }
      }
    });

    if (!existingBookmark) {
      res.status(404).json({ success: false, message: "Bookmark tidak ditemukan" });
      return;
    }

    // Eksekusi hapus
    await prisma.bookmark.delete({
      where: {
        userId_bookId: { userId, bookId }
      }
    });

    res.status(200).json({ success: true, message: "Berhasil dihapus dari bookmark" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};

// POST /api/bookmarks/toggle - Toggle (tambah / hapus) bookmark dari Frontend
// Menerima metadata OpenLibrary dan otomatis upsert Buku di DB lokal
export const toggleBookmark = async (
  req: Request<Record<string, never>, Record<string, never>, ToggleBookmarkBody>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { openLibraryId, title, author, coverUrl, description, publishYear } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Akses ditolak" });
      return;
    }

    if (!openLibraryId || !title || !author) {
      res.status(400).json({ success: false, message: "openLibraryId, title, dan author wajib dikirimkan" });
      return;
    }

    // Langkah 1: Upsert buku di database lokal berdasarkan openLibraryId
    // Jika belum ada, buat baru. Jika sudah ada, tidak mengubah apapun.
    const book = await prisma.book.upsert({
      where: { openLibraryId },
      update: {}, // Tidak update apapun jika sudah ada
      create: {
        openLibraryId,
        title,
        author,
        coverUrl: coverUrl || '',
        description: description || '',
        publishYear: publishYear ?? 0,
      },
    });

    // Langkah 2: Cek apakah user sudah pernah bookmark buku lokal ini
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_bookId: { userId, bookId: book.id }
      }
    });

    if (existingBookmark) {
      // Sudah ada → Hapus (Unfavorite / Toggle Off)
      await prisma.bookmark.delete({
        where: { userId_bookId: { userId, bookId: book.id } }
      });
      res.status(200).json({ success: true, isBookmarked: false, message: "Buku berhasil dihapus dari koleksi" });
    } else {
      // Belum ada → Tambahkan (Favorite / Toggle On)
      await prisma.bookmark.create({
        data: { userId, bookId: book.id }
      });
      res.status(201).json({ success: true, isBookmarked: true, message: "Buku berhasil ditambahkan ke koleksi" });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};

// GET /api/bookmarks/check?openLibraryId=... - Cek apakah user sudah menyimpan buku tertentu
export const checkBookmarkStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { openLibraryId } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: "Akses ditolak" });
      return;
    }

    if (!openLibraryId || typeof openLibraryId !== 'string') {
      res.status(400).json({ success: false, message: "openLibraryId wajib dikirimkan" });
      return;
    }

    // Cari buku lokal berdasarkan openLibraryId
    const book = await prisma.book.findUnique({ where: { openLibraryId } });

    if (!book) {
      // Buku belum pernah disimpan ke DB lokal sama sekali → pasti belum dibookmark
      res.status(200).json({ success: true, isBookmarked: false });
      return;
    }

    // Cek apakah user memiliki bookmark untuk buku lokal ini
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_bookId: { userId, bookId: book.id } }
    });

    res.status(200).json({ success: true, isBookmarked: !!bookmark });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};