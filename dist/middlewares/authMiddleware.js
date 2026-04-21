"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    try {
        // Ambil token dari header Authorization (Format: "Bearer <token>")
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: "Akses ditolak: Token tidak ditemukan atau format salah" });
            return;
        }
        // Ekstrak hanya tokennya saja (hilangkan kata "Bearer ")
        const token = authHeader.split(' ')[1];
        // Validasi keberadaan secret key
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("Sistem belum dikonfigurasi: JWT_SECRET tidak ditemukan");
        }
        // Verifikasi token (jika gagal, akan otomatis melempar error dan masuk ke catch)
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Sisipkan data payload ke dalam request object agar bisa dipakai di controller
        req.user = decoded;
        // Lanjutkan ke fungsi rute (controller) berikutnya
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ success: false, message: "Akses ditolak: Token sudah kedaluwarsa" });
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ success: false, message: "Akses ditolak: Token tidak valid" });
        }
        else if (error instanceof Error) {
            res.status(500).json({ success: false, message: error.message });
        }
        else {
            res.status(500).json({ success: false, message: "Terjadi kesalahan internal saat verifikasi token" });
        }
    }
};
exports.verifyToken = verifyToken;
/**
 * Middleware untuk memastikan pengguna memiliki peran ADMIN
 * Harus diletakkan SETELAH verifyToken
 */
const requireAdmin = (req, res, next) => {
    // Pengecekan keamanan ganda untuk memastikan req.user sudah ada (seharusnya sudah dijamin oleh verifyToken)
    if (!req.user) {
        res.status(401).json({ success: false, message: "Autentikasi diperlukan sebelum mengecek hak akses" });
        return;
    }
    // Cek apakah rolenya ADMIN
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: "Akses ditolak: Membutuhkan hak akses Administrator" });
        return;
    }
    // Lanjut jika lolos
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=authMiddleware.js.map