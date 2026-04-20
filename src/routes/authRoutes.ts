// File: src/routes/authRoutes.ts
import { Router, RequestHandler } from 'express';
import { register, login, googleSignIn, updateProfile } from '../controllers/authController';

const router: Router = Router();

// Route untuk registrasi user baru (email + password)
router.post('/register', register as unknown as RequestHandler);

// Route untuk login user (email + password)
router.post('/login', login as unknown as RequestHandler);

// Route untuk Google Sign-In SSO (dari Flutter — menerima Google ID Token)
router.post('/google-signin', googleSignIn as unknown as RequestHandler);

import { verifyToken } from '../middlewares/authMiddleware';
// Route untuk update profil user (wajib login)
router.put('/profile', verifyToken, updateProfile as unknown as RequestHandler);

export default router;
