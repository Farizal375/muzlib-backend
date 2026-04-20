// File: src/routes/bookmarkRoutes.ts
import { Router, RequestHandler } from 'express';
import { getMyBookmarks, addBookmark, removeBookmark, toggleBookmark, checkBookmarkStatus } from '../controllers/bookmarkController';
import { verifyToken } from '../middlewares/authMiddleware';

const router: Router = Router();

// Semua rute bookmark WAJIB login (verifyToken)

router.get('/', verifyToken, getMyBookmarks as unknown as RequestHandler);
router.post('/', verifyToken, addBookmark as unknown as RequestHandler);
router.delete('/book/:bookId', verifyToken, removeBookmark as unknown as RequestHandler);

// Rute baru untuk sinkronisasi dari Frontend
router.post('/toggle', verifyToken, toggleBookmark as unknown as RequestHandler);
router.get('/check', verifyToken, checkBookmarkStatus as unknown as RequestHandler);

export default router;