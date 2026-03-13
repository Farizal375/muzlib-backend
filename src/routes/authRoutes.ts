// File: src/routes/authRoutes.ts
import { Router, RequestHandler } from 'express';
import { register, login } from '../controllers/authController';

const router: Router = Router();

// Route untuk registrasi user baru
router.post('/register', register as unknown as RequestHandler);

// Route untuk login user
router.post('/login', login as unknown as RequestHandler);

export default router;
