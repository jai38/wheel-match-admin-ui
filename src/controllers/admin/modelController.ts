import type { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import CarModel from '../../models/CarModel.js';
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
export const createModelValidation = [
  body('makeId')
    .notEmpty()
    .withMessage('Make ID is required')
    .isInt({ min: 1 })
    .withMessage('Make ID must be a positive integer'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const listModelsValidation = [
  query('makeId')
    .notEmpty()
    .withMessage('Make ID is required')
    .isInt({ min: 1 })
    .withMessage('Make ID must be a positive integer'),
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

// Create a new model
export const createModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { makeId, name, isActive } = req.body;

    // Check if make exists
    const make = await Make.findByPk(makeId);
    if (!make) {
      sendError(res, 'Make not found', 404);
      return;
    }

    // Generate slug from name
    const slug = generateSlug(name);

    // Check if model with same name already exists for this make
    const existingModel = await CarModel.findOne({
      where: {
        makeId: makeId,
        name: name,
      },
    });

    if (existingModel) {
      sendError(res, 'Model with this name already exists for this make', 409);
      return;
    }

    // Create model
    const model = await CarModel.create({
      makeId,
      name,
      slug,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Fetch the created model with make details
    const createdModel = await CarModel.findByPk(model.id, {
      include: [
        {
          model: Make,
          as: 'make',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    sendSuccess(
      res,
      'Model created successfully',
      {
        id: createdModel!.id,
        makeId: createdModel!.makeId,
        name: createdModel!.name,
        slug: createdModel!.slug,
        isActive: createdModel!.isActive,
        make: (createdModel as any).make,
        createdAt: createdModel!.createdAt,
        updatedAt: createdModel!.updatedAt,
      },
      201
    );
  } catch (error) {
    console.error('Create model error:', error);
    sendError(res, 'Failed to create model', 500);
  }
};

// Get list of all models for a make
export const listModels = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const makeId = parseInt(req.query.makeId as string);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const isActive = req.query.isActive !== undefined 
      ? req.query.isActive === 'true' 
      : undefined;

    // Check if make exists
    const make = await Make.findByPk(makeId);
    if (!make) {
      sendError(res, 'Make not found', 404);
      return;
    }

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      makeId: makeId,
    };
    
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`,
      };
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    // Fetch models with pagination
    const { count, rows: models } = await CarModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
      include: [
        {
          model: Make,
          as: 'make',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    sendSuccess(res, 'Models retrieved successfully', {
      models: models.map(model => ({
        id: model.id,
        makeId: model.makeId,
        name: model.name,
        slug: model.slug,
        isActive: model.isActive,
        make: (model as any).make,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('List models error:', error);
    sendError(res, 'Failed to retrieve models', 500);
  }
};
