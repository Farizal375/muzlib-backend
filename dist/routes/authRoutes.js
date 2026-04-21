"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Route untuk registrasi user baru (email + password)
router.post('/register', authController_1.register);
// Route untuk login user (email + password)
router.post('/login', authController_1.login);
// Route untuk Google Sign-In SSO (dari Flutter — menerima Google ID Token)
router.post('/google-signin', authController_1.googleSignIn);
const authMiddleware_1 = require("../middlewares/authMiddleware");
// Route untuk update profil user (wajib login)
router.put('/profile', authMiddleware_1.verifyToken, authController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map