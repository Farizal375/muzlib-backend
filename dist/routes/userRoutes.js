"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/userRoutes.ts
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Terapkan middleware pada rute.
// Semua rute manajemen user ini HANYA boleh diakses oleh ADMIN yang sudah LOGIN.
router.get('/', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, userController_1.getAllUsers);
router.post('/', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, userController_1.createUser);
router.put('/:id/role', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, userController_1.updateUserRole); // MUST BE BEFORE /:id
router.put('/:id', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, userController_1.updateUser);
router.delete('/:id', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map