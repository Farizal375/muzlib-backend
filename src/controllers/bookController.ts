// File: src/controllers/bookController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleError } from '../utils/errorHandler';

const prisma = new PrismaClient();

interface BookParams {
  id: string;
}

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


// GET /api/books - Mengambil daftar semua buku
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    handleError(res, error, 'getAllBooks');
  }
};


// GET /api/books/:id - Mengambil detail satu buku
export const getBookById = async (
  req: Request<BookParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
      return;
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    handleError(res, error, 'getBookById');
  }
};


// POST /api/books - Menambah buku baru
export const createBook = async (
  req: Request<Record<string, never>, Record<string, never>, BookBody>,
  res: Response
): Promise<void> => {
  try {
    const { openLibraryId, title, author, coverUrl, publishYear, description, isFeatured, isHidden } = req.body;
    if (!openLibraryId || !title || !author || !coverUrl || !publishYear) {
      res.status(400).json({ success: false, message: 'Field wajib (openLibraryId, title, author, coverUrl, publishYear) harus diisi' });
      return;
    }
    const newBook = await prisma.book.create({
      data: { openLibraryId, title, author, coverUrl, publishYear, description, isFeatured: isFeatured ?? false, isHidden: isHidden ?? false }
    });
    res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan', data: newBook });
  } catch (error) {
    handleError(res, error, 'createBook');
  }
};


// PUT /api/books/:id - Mengedit buku
export const updateBook = async (
  req: Request<BookParams, Record<string, never>, Partial<BookBody>>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
      return;
    }
    const updatedBook = await prisma.book.update({ where: { id }, data: req.body });
    res.status(200).json({ success: true, message: 'Buku berhasil diperbarui', data: updatedBook });
  } catch (error) {
    handleError(res, error, 'updateBook');
  }
};


// PUT /api/books/:id/featured - Toggle Featured Status
export const toggleFeatured = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
      return;
    }
    const updatedBook = await prisma.book.update({
      where: { id },
      data: { isFeatured: !existingBook.isFeatured }
    });
    res.status(200).json({ success: true, message: 'Status Featured berhasil diubah', data: updatedBook });
  } catch (error) {
    handleError(res, error, 'toggleFeatured');
  }
};


// PUT /api/books/:id/hidden - Toggle Hidden Status
export const toggleHidden = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
      return;
    }
    const updatedBook = await prisma.book.update({
      where: { id },
      data: { isHidden: !existingBook.isHidden }
    });
    res.status(200).json({ success: true, message: 'Status Hidden berhasil diubah', data: updatedBook });
  } catch (error) {
    handleError(res, error, 'toggleHidden');
  }
};


// DELETE /api/books/:id - Menghapus buku
export const deleteBook = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
      return;
    }
    await prisma.book.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Buku berhasil dihapus' });
  } catch (error) {
    handleError(res, error, 'deleteBook');
  }
};


// GET /api/books/featured - Ambil buku featured untuk Hero Section
export const getFeaturedBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      where: { isFeatured: true, isHidden: false },
      orderBy: { updatedAt: 'desc' },
    });
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    handleError(res, error, 'getFeaturedBooks');
  }
};