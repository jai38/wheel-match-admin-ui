import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  registerValidation,
  loginValidation,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

export default router;
