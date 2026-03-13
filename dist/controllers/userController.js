"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /api/users - Mengambil semua data user (Kecuali Password)
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: users });
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
exports.getAllUsers = getAllUsers;
// PUT /api/users/:id/role - Mempromosikan / Menurunkan Role User
const updateUserRole = async (req, res) => {
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
exports.updateUserRole = updateUserRole;
// DELETE /api/users/:id - Menghapus User Permanen
const deleteUser = async (req, res) => {
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
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map