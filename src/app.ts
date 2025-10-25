import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import makeRoutes from './routes/admin/makeRoutes.js';
import modelRoutes from './routes/admin/modelRoutes.js';
import colorRoutes from './routes/admin/colorRoutes.js';
import variantRoutes from './routes/admin/variantRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Wheel Match Admin Backend is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/makes', makeRoutes);
app.use('/api/admin/models', modelRoutes);
app.use('/api/admin/colors', colorRoutes);
app.use('/api/admin/variants', variantRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
