import type { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Make from '../../models/Make.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Validation rules
export const createMakeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('logoUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const listMakesValidation = [
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

// Create a new make
export const createMake = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { name, logoUrl, isActive } = req.body;

    // Generate slug from name
    const slug = generateSlug(name);

    // Check if make with same name or slug already exists
    const existingMake = await Make.findOne({
      where: {
        [Op.or]: [
          { name: name },
          { slug: slug },
        ],
      },
    });

    if (existingMake) {
      sendError(res, 'Make with this name already exists', 409);
      return;
    }

    // Create make
    const make = await Make.create({
      name,
      slug,
      logoUrl: logoUrl || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    sendSuccess(
      res,
      'Make created successfully',
      {
        id: make.id,
        name: make.name,
        slug: make.slug,
        logoUrl: make.logoUrl,
        isActive: make.isActive,
        createdAt: make.createdAt,
        updatedAt: make.updatedAt,
      },
      201
    );
  } catch (error) {
    console.error('Create make error:', error);
    sendError(res, 'Failed to create make', 500);
  }
};

// Get list of all makes
export const listMakes = async (req: Request, res: Response): Promise<void> => {
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

    console.log('List makes request:', { page, limit, search, isActive, offset });

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

    // Fetch makes with pagination
    console.log('Where clause:', JSON.stringify(whereClause));
    const { count, rows: makes } = await Make.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
    });
    console.log('Query result:', { count, makesLength: makes.length });

    sendSuccess(res, 'Makes retrieved successfully', {
      makes: makes.map(make => ({
        id: make.id,
        name: make.name,
        slug: make.slug,
        logoUrl: make.logoUrl,
        isActive: make.isActive,
        createdAt: make.createdAt,
        updatedAt: make.updatedAt,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('List makes error:', error);
    sendError(res, 'Failed to retrieve makes', 500);
  }
};
