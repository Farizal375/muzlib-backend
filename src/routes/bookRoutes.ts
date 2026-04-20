// File: src/routes/bookRoutes.ts
import { Router, RequestHandler } from 'express';
import { getAllBooks, getBookById, createBook, updateBook, deleteBook, toggleFeatured, toggleHidden, getFeaturedBooks } from '../controllers/bookController';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware';

const router: Router = Router();

// Rute publik (tanpa auth) - untuk homepage
router.get('/featured', getFeaturedBooks as unknown as RequestHandler);

// Endpoint baca buku bersifat publik (bisa diakses guest)
router.get('/', getAllBooks as unknown as RequestHandler);
router.get('/:id', getBookById as unknown as RequestHandler);

router.post('/', verifyToken, requireAdmin, createBook as unknown as RequestHandler);
router.put('/:id', verifyToken, requireAdmin, updateBook as unknown as RequestHandler);

// Toggle Status (Hanya Admin)
router.put('/:id/featured', verifyToken, requireAdmin, toggleFeatured as unknown as RequestHandler);
router.put('/:id/hidden', verifyToken, requireAdmin, toggleHidden as unknown as RequestHandler);

router.delete('/:id', verifyToken, requireAdmin, deleteBook as unknown as RequestHandler);

export default router;