// File: src/routes/userRoutes.ts
import { Router, RequestHandler } from 'express';
import { getAllUsers, createUser, updateUser, updateUserRole, deleteUser } from '../controllers/userController';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware';

const router: Router = Router();

// Terapkan middleware pada rute.
// Semua rute manajemen user ini HANYA boleh diakses oleh ADMIN yang sudah LOGIN.
router.get('/', verifyToken, requireAdmin, getAllUsers as unknown as RequestHandler);
router.post('/', verifyToken, requireAdmin, createUser as unknown as RequestHandler);
router.put('/:id/role', verifyToken, requireAdmin, updateUserRole as unknown as RequestHandler); // MUST BE BEFORE /:id
router.put('/:id', verifyToken, requireAdmin, updateUser as unknown as RequestHandler);
router.delete('/:id', verifyToken, requireAdmin, deleteUser as unknown as RequestHandler);

export default router;