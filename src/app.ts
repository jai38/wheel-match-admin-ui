import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/authRoutes.js';
import carMasterRoutes from './routes/admin/carMasterRoutes.js';
import carRoutes from './routes/admin/carRoutes.js';
import alloyRoutes from './routes/admin/alloyRoutes.js';
import alloyMainRoutes from './routes/admin/alloyMainRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { rateLimiter } from './middlewares/rateLimit.js';
import { CORS_OPTIONS } from './config/constants.js';
import { env } from './utils/env.js';

const app: Express = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors(CORS_OPTIONS)); // Enable CORS
app.use(mongoSanitize()); // Sanitize data against NoSQL injection

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (apply to all routes)
if (env.NODE_ENV === 'production') {
  app.use(rateLimiter());
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Wheel Match Admin Backend is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes (with versioning)
const API_V1 = '/api/v1';

// Auth routes (no version prefix for backward compatibility)
app.use('/api/auth', authRoutes);

// Admin routes with v1 prefix
app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/admin/car`, carMasterRoutes); // Car master data (makes, models, colors, variants)
app.use(`${API_V1}/admin/cars`, carRoutes); // Main car entity
app.use(`${API_V1}/admin/alloy`, alloyRoutes); // Alloy master data (designs, pcds, finishes, sizes)
app.use(`${API_V1}/admin/alloys`, alloyMainRoutes); // Main alloy entity

// Backward compatibility - old routes without version
app.use('/api/admin/car', carMasterRoutes);
app.use('/api/admin/cars', carRoutes);
app.use('/api/admin/alloy', alloyRoutes);
app.use('/api/admin/alloys', alloyMainRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
