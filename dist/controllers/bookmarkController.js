"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBookmark = exports.addBookmark = exports.getMyBookmarks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /api/bookmarks - Melihat semua bookmark milik user yang sedang login
const getMyBookmarks = async (req, res) => {
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
exports.getMyBookmarks = getMyBookmarks;
// POST /api/bookmarks - Menambahkan buku ke bookmark
const addBookmark = async (req, res) => {
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
exports.addBookmark = addBookmark;
// DELETE /api/bookmarks/book/:bookId - Menghapus bookmark
const removeBookmark = async (req, res) => {
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
exports.removeBookmark = removeBookmark;
//# sourceMappingURL=bookmarkController.js.map