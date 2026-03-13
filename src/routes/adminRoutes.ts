import express from 'express';
import { getDashboardStats } from '../controllers/adminController';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Route untuk mengambil statistik dashboard admin
// Wajib login (verifyToken) dan wajib ADMIN (requireAdmin)
router.get('/stats', verifyToken, requireAdmin, getDashboardStats);

export default router;
