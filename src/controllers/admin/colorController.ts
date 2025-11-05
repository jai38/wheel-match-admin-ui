import type { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Color from '../../models/Color.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

// Validation rules
export const createColorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('colorCode')
    .trim()
    .notEmpty()
    .withMessage('Color code is required')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color code must be a valid hex code (e.g., #FF0000)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const listColorsValidation = [
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

// Create a new color
export const createColor = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { name, colorCode, isActive } = req.body;

    // Check if color with same name already exists
    const existingColor = await Color.findOne({
      where: {
        [Op.or]: [
          { name: name },
          { colorCode: colorCode.toUpperCase() },
        ],
      },
    });

    if (existingColor) {
      sendError(res, 'Color with this name or code already exists', 409);
      return;
    }

    // Create color
    const color = await Color.create({
      name,
      colorCode: colorCode.toUpperCase(),
      isActive: isActive !== undefined ? isActive : true,
    });

    sendSuccess(
      res,
      'Color created successfully',
      {
        id: color.id,
        name: color.name,
        colorCode: color.colorCode,
        isActive: color.isActive,
        createdAt: color.createdAt,
        updatedAt: color.updatedAt,
      },
      201
    );
  } catch (error) {
    sendError(res, 'Failed to create color', 500);
  }
};

// Get list of all colors
export const listColors = async (req: Request, res: Response): Promise<void> => {
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

    // Fetch colors with pagination
    const { count, rows: colors } = await Color.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    sendSuccess(res, 'Colors retrieved successfully', {
      items: colors.map(color => ({
        id: color.id,
        name: color.name,
        colorCode: color.colorCode,
        isActive: color.isActive,
        createdAt: color.createdAt,
        updatedAt: color.updatedAt,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    sendError(res, 'Failed to retrieve colors', 500);
  }
};
