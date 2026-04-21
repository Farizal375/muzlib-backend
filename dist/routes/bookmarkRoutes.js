"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/bookmarkRoutes.ts
const express_1 = require("express");
const bookmarkController_1 = require("../controllers/bookmarkController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Semua rute bookmark WAJIB login (verifyToken)
router.get('/', authMiddleware_1.verifyToken, bookmarkController_1.getMyBookmarks);
router.post('/', authMiddleware_1.verifyToken, bookmarkController_1.addBookmark);
router.delete('/book/:bookId', authMiddleware_1.verifyToken, bookmarkController_1.removeBookmark);
// Rute baru untuk sinkronisasi dari Frontend
router.post('/toggle', authMiddleware_1.verifyToken, bookmarkController_1.toggleBookmark);
router.get('/check', authMiddleware_1.verifyToken, bookmarkController_1.checkBookmarkStatus);
exports.default = router;
//# sourceMappingURL=bookmarkRoutes.js.map