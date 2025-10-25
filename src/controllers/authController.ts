import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Validation rules
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register a new admin user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      sendError(res, 'User with this email already exists', 409);
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendSuccess(
      res,
      'User registered successfully',
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Failed to register user', 500);
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { email, password } = req.body;

    // Find user
    const userModel = await User.findOne({ where: { email } });
    if (!userModel) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }
    const user = userModel.get({ plain: true });

    // Check if user is active
    if (!user.isActive) {
      sendError(res, 'Account is inactive', 403);
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Failed to login', 500);
  }
};

// Logout user (client-side token removal)
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // With JWT, logout is handled on the client side by removing the token
  // This endpoint exists for consistency and can be extended with refresh token blacklisting
  sendSuccess(res, 'Logout successful');
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, 'Profile retrieved successfully', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 'Failed to retrieve profile', 500);
  }
};
