import express from 'express';
import { getDashboardStats, getConfig, updateConfig } from '../controllers/adminController';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Route untuk mengambil statistik dashboard admin
// Wajib login (verifyToken) dan wajib ADMIN (requireAdmin)
router.get('/stats', verifyToken, requireAdmin, getDashboardStats);

// Route untuk manajemen konfigurasi sistem
router.get('/config/:key', verifyToken, requireAdmin, getConfig);
router.post('/config', verifyToken, requireAdmin, updateConfig);

export default router;
