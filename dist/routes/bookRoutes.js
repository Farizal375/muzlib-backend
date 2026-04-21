"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/bookRoutes.ts
const express_1 = require("express");
const bookController_1 = require("../controllers/bookController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rute publik (tanpa auth) - untuk homepage
router.get('/featured', bookController_1.getFeaturedBooks);
// Endpoint baca buku bersifat publik (bisa diakses guest)
router.get('/', bookController_1.getAllBooks);
router.get('/:id', bookController_1.getBookById);
router.post('/', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, bookController_1.createBook);
router.put('/:id', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, bookController_1.updateBook);
// Toggle Status (Hanya Admin)
router.put('/:id/featured', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, bookController_1.toggleFeatured);
router.put('/:id/hidden', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, bookController_1.toggleHidden);
router.delete('/:id', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, bookController_1.deleteBook);
exports.default = router;
//# sourceMappingURL=bookRoutes.js.map