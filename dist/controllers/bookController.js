"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBook = exports.updateBook = exports.createBook = exports.getBookById = exports.getAllBooks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /api/books - Mengambil daftar semua buku (Read)
const getAllBooks = async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: books });
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
exports.getAllBooks = getAllBooks;
// GET /api/books/:id - Mengambil detail satu buku (Read)
const getBookById = async (req, res) => {
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
exports.getBookById = getBookById;
// POST /api/books - Menambah buku baru (Create)
const createBook = async (req, res) => {
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
exports.createBook = createBook;
// PUT /api/books/:id - Mengedit buku (Update)
const updateBook = async (req, res) => {
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
exports.updateBook = updateBook;
// DELETE /api/books/:id - Menghapus buku (Delete)
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const existingBook = await prisma.book.findUnique({ where: { id } });
        if (!existingBook) {
            res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
            return;
        }
        await prisma.book.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Buku berhasil dihapus permanen" });
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
exports.deleteBook = deleteBook;
//# sourceMappingURL=bookController.js.map