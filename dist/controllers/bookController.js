"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeaturedBooks = exports.deleteBook = exports.toggleHidden = exports.toggleFeatured = exports.updateBook = exports.createBook = exports.getBookById = exports.getAllBooks = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
// GET /api/books - Mengambil daftar semua buku
const getAllBooks = async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: books });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'getAllBooks');
    }
};
exports.getAllBooks = getAllBooks;
// GET /api/books/:id - Mengambil detail satu buku
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await prisma.book.findUnique({ where: { id } });
        if (!book) {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
            return;
        }
        res.status(200).json({ success: true, data: book });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'getBookById');
    }
};
exports.getBookById = getBookById;
// POST /api/books - Menambah buku baru
const createBook = async (req, res) => {
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
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'createBook');
    }
};
exports.createBook = createBook;
// PUT /api/books/:id - Mengedit buku
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const existingBook = await prisma.book.findUnique({ where: { id } });
        if (!existingBook) {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
            return;
        }
        const updatedBook = await prisma.book.update({ where: { id }, data: req.body });
        res.status(200).json({ success: true, message: 'Buku berhasil diperbarui', data: updatedBook });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'updateBook');
    }
};
exports.updateBook = updateBook;
// PUT /api/books/:id/featured - Toggle Featured Status
const toggleFeatured = async (req, res) => {
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
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'toggleFeatured');
    }
};
exports.toggleFeatured = toggleFeatured;
// PUT /api/books/:id/hidden - Toggle Hidden Status
const toggleHidden = async (req, res) => {
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
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'toggleHidden');
    }
};
exports.toggleHidden = toggleHidden;
// DELETE /api/books/:id - Menghapus buku
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const existingBook = await prisma.book.findUnique({ where: { id } });
        if (!existingBook) {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
            return;
        }
        await prisma.book.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Buku berhasil dihapus' });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'deleteBook');
    }
};
exports.deleteBook = deleteBook;
// GET /api/books/featured - Ambil buku featured untuk Hero Section
const getFeaturedBooks = async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            where: { isFeatured: true, isHidden: false },
            orderBy: { updatedAt: 'desc' },
        });
        res.status(200).json({ success: true, data: books });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'getFeaturedBooks');
    }
};
exports.getFeaturedBooks = getFeaturedBooks;
//# sourceMappingURL=bookController.js.map