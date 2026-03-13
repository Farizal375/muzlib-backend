"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/bookRoutes.ts
const express_1 = require("express");
const bookController_1 = require("../controllers/bookController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Semua endpoint wajib dilindungi (verifyToken)
// Hanya ADMIN yang boleh menambah, mengedit, dan menghapus buku
router.get('/', authMiddleware_1.verifyToken, bookController_1.getAllBooks);
router.get('/:id', authMiddleware_1.verifyToken, bookController_1.getBookById);
router.post('/', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, bookController_1.createBook);
router.put('/:id', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, bookController_1.updateBook);
router.delete('/:id', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, bookController_1.deleteBook);
exports.default = router;
//# sourceMappingURL=bookRoutes.js.map