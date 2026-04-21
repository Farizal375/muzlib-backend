// Di dalam file src/index.ts 

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import adminRoutes from './routes/adminRoutes';

// Load environment variables — override: true agar nilai dari .env selalu dipakai
dotenv.config({ override: true });

// Inisialisasi Express app
const app: Express = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Request Logger agar terlihat di terminal
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server berjalan di port ${PORT}`);
});