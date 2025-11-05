import type { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import AlloyPCD from '../../models/AlloyPCD.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

// Validation rules
export const createAlloyPCDValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const listAlloyPCDsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Create a new alloy PCD
export const createAlloyPCD = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { name, isActive } = req.body;

    // Check if PCD with same name already exists
    const existingPCD = await AlloyPCD.findOne({
      where: { name },
    });

    if (existingPCD) {
      sendError(res, 'Alloy PCD with this name already exists', 409);
      return;
    }

    // Create PCD
    const pcd = await AlloyPCD.create({
      name,
      isActive: isActive !== undefined ? isActive : true,
    });

    sendSuccess(
      res,
      'Alloy PCD created successfully',
      {
        id: pcd.id,
        name: pcd.name,
        isActive: pcd.isActive,
        createdAt: pcd.createdAt,
        updatedAt: pcd.updatedAt,
      },
      201
    );
  } catch (error) {
    console.error('Create alloy PCD error:', error);
    sendError(res, 'Failed to create alloy PCD', 500);
  }
};

// Get list of all alloy PCDs
export const listAlloyPCDs = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const isActive = req.query.isActive !== undefined
      ? req.query.isActive === 'true'
      : undefined;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`,
      };
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    // Fetch PCDs with pagination
    const { count, rows: pcds } = await AlloyPCD.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    sendSuccess(res, 'Alloy PCDs retrieved successfully', {
      items: pcds.map(pcd => ({
        id: pcd.id,
        name: pcd.name,
        isActive: pcd.isActive,
        createdAt: pcd.createdAt,
        updatedAt: pcd.updatedAt,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('List alloy PCDs error:', error);
    sendError(res, 'Failed to retrieve alloy PCDs', 500);
  }
};
