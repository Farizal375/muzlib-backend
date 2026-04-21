"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.updateUser = exports.createUser = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// ---------------------------------------------------------
// GET /api/users - Mengambil semua data user (Kecuali Password)
// ---------------------------------------------------------
const getAllUsers = async (req, res) => {
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
// ---------------------------------------------------------
// POST /api/users - Membuat user baru (Admin Only)
// ---------------------------------------------------------
const createUser = async (req, res) => {
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
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
exports.createUser = createUser;
// ---------------------------------------------------------
// PUT /api/users/:id - Update user (Admin dapat update data user manapun)
// ---------------------------------------------------------
const updateUser = async (req, res) => {
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
        const updateData = {};
        if (name !== undefined)
            updateData.name = name || null;
        if (email !== undefined)
            updateData.email = email;
        if (password) {
            updateData.password = await bcryptjs_1.default.hash(password, 10);
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
exports.updateUser = updateUser;
// ---------------------------------------------------------
// PUT /api/users/:id/role - Mempromosikan / Menurunkan Role User
// ---------------------------------------------------------
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
// ---------------------------------------------------------
// DELETE /api/users/:id - Menghapus User Permanen
// ---------------------------------------------------------
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