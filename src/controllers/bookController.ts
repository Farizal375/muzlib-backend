// File: src/controllers/bookController.ts
import { Request, Response } from 'express';
import { PrismaClient, Book } from '@prisma/client';

const prisma = new PrismaClient();

// Interface untuk Request Params
interface BookParams {
  id: string;
}

// Interface untuk Request Body (Create & Update)
interface BookBody {
  openLibraryId: string;
  title: string;
  author: string;
  coverUrl: string;
  publishYear: number;
  description?: string;
  isFeatured?: boolean;
  isHidden?: boolean;
}


// GET /api/books - Mengambil daftar semua buku (Read)

export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({ success: true, data: books });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};


// GET /api/books/:id - Mengambil detail satu buku (Read)

export const getBookById = async (
  req: Request<BookParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id }
    });

    if (!book) {
      res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
      return;
    }

    res.status(200).json({ success: true, data: book });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};


// POST /api/books - Menambah buku baru (Create)

export const createBook = async (
  req: Request<Record<string, never>, Record<string, never>, BookBody>,
  res: Response
): Promise<void> => {
  try {
    const { openLibraryId, title, author, coverUrl, publishYear, description, isFeatured, isHidden } = req.body;

    // Validasi field wajib
    if (!openLibraryId || !title || !author || !coverUrl || !publishYear) {
      res.status(400).json({ success: false, message: "Seluruh field wajib (openLibraryId, title, author, coverUrl, publishYear) harus diisi" });
      return;
    }

    const newBook = await prisma.book.create({
      data: {
        openLibraryId,
        title,
        author,
        coverUrl,
        publishYear,
        description,
        isFeatured: isFeatured ?? false,
        isHidden: isHidden ?? false
      }
    });

    res.status(201).json({ success: true, message: "Buku berhasil ditambahkan", data: newBook });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};


// PUT /api/books/:id - Mengedit buku (Update)

export const updateBook = async (
  req: Request<BookParams, Record<string, never>, Partial<BookBody>>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
      return;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true, message: "Buku berhasil diperbarui", data: updatedBook });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};


// PUT /api/books/:id/featured - Toggle Featured Status (Admin)
export const toggleFeatured = async (
  req: Request<BookParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const existingBook = await prisma.book.findUnique({ where: { id } });
    
    if (!existingBook) {
      res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
      return;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: { isFeatured: !existingBook.isFeatured }
    });

    res.status(200).json({ success: true, message: "Status Featured berhasil diubah", data: updatedBook });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};


// PUT /api/books/:id/hidden - Toggle Hidden Status (Admin)
export const toggleHidden = async (
  req: Request<BookParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const existingBook = await prisma.book.findUnique({ where: { id } });
    
    if (!existingBook) {
      res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
      return;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: { isHidden: !existingBook.isHidden }
    });

    res.status(200).json({ success: true, message: "Status Hidden berhasil diubah", data: updatedBook });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};


// DELETE /api/books/:id - Menghapus buku (Delete)

export const deleteBook = async (
  req: Request<BookParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
      return;
    }

    await prisma.book.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Buku berhasil dihapus permanen" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};

// GET /api/books/featured - Ambil buku yang di-featured admin (untuk Hero Section homepage)
export const getFeaturedBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      where: {
        isFeatured: true,
        isHidden: false,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({ success: true, data: books });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal" });
    }
  }
};