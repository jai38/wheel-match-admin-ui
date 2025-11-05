import type { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import AlloyDesign from '../../models/AlloyDesign.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

// Validation rules
export const createAlloyDesignValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const listAlloyDesignsValidation = [
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

// Create a new alloy design
export const createAlloyDesign = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { name, isActive } = req.body;

    // Check if design with same name already exists
    const existingDesign = await AlloyDesign.findOne({
      where: { name },
    });

    if (existingDesign) {
      sendError(res, 'Alloy design with this name already exists', 409);
      return;
    }

    // Create design
    const design = await AlloyDesign.create({
      name,
      isActive: isActive !== undefined ? isActive : true,
    });

    sendSuccess(
      res,
      'Alloy design created successfully',
      {
        id: design.id,
        name: design.name,
        isActive: design.isActive,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt,
      },
      201
    );
  } catch (error) {
    console.error('Create alloy design error:', error);
    sendError(res, 'Failed to create alloy design', 500);
  }
};

// Get list of all alloy designs
export const listAlloyDesigns = async (req: Request, res: Response): Promise<void> => {
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

    // Fetch designs with pagination
    const { count, rows: designs } = await AlloyDesign.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    sendSuccess(res, 'Alloy designs retrieved successfully', {
      items: designs.map(design => ({
        id: design.id,
        name: design.name,
        isActive: design.isActive,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('List alloy designs error:', error);
    sendError(res, 'Failed to retrieve alloy designs', 500);
  }
};
