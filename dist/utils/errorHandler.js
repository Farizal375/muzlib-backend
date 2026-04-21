"use strict";
// File: src/utils/errorHandler.ts
//
// Utility untuk menangani error secara aman:
// - Log detail error di server (untuk debugging)
// - Kirim pesan generik ke client (tidak bocorkan source code/path)
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
const client_1 = require("@prisma/client");
/**
 * Menangani error dan mengirim response yang aman ke client.
 * Detail error di-log ke console server, tapi TIDAK dikirim ke client.
 */
function handleError(res, error, context = 'Server') {
    // Log detail lengkap di server (hanya terlihat di terminal, bukan di app)
    console.error(`[${context} Error]`, error);
    if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        res.status(503).json({
            success: false,
            message: 'Layanan database sedang tidak tersedia. Silakan coba beberapa saat lagi.',
        });
        return;
    }
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === 'P2002') {
            res.status(409).json({ success: false, message: 'Data yang sama sudah ada.' });
            return;
        }
        // Record not found
        if (error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
            return;
        }
        res.status(400).json({ success: false, message: 'Permintaan tidak valid.' });
        return;
    }
    // Untuk error lainnya, kirim pesan generik saja
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal pada server. Silakan coba lagi.',
    });
}
//# sourceMappingURL=errorHandler.js.map