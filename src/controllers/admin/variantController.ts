import type { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Variant from '../../models/Variant.js';
import CarModel from '../../models/CarModel.js';
import Make from '../../models/Make.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

// Validation rules
export const createVariantValidation = [
  body('modelId')
    .notEmpty()
    .withMessage('Model ID is required')
    .isInt({ min: 1 })
    .withMessage('Model ID must be a positive integer'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('defaultAlloySize')
    .notEmpty()
    .withMessage('Default alloy size is required')
    .isFloat({ min: 10.0, max: 30.0 })
    .withMessage('Default alloy size must be between 10.0 and 30.0 inches'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const listVariantsValidation = [
  query('modelId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Model ID must be a positive integer'),
  query('makeId')
    .optional()
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

// Create a new variant
export const createVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { modelId, name, defaultAlloySize, isActive } = req.body;

    // Check if model exists
    const model = await CarModel.findByPk(modelId);
    if (!model) {
      sendError(res, 'Model not found', 404);
      return;
    }

    // Check if variant with same modelId, name, and defaultAlloySize already exists
    const existingVariant = await Variant.findOne({
      where: {
        modelId: modelId,
        [Op.or]: [
          {
            name: name,
          },
          {
            defaultAlloySize: defaultAlloySize,
          },
        ],
      },
    });

    if (existingVariant) {
      if (existingVariant.name === name && existingVariant.defaultAlloySize === parseFloat(defaultAlloySize)) {
        sendError(res, 'Variant with this name and alloy size already exists for this model', 409);
      } else if (existingVariant.name === name) {
        sendError(res, 'Variant with this name already exists for this model', 409);
      } else {
        sendError(res, 'Variant with this alloy size already exists for this model', 409);
      }
      return;
    }

    // Create variant
    const variant = await Variant.create({
      modelId,
      name,
      defaultAlloySize,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Fetch the created variant with model and make details
    const createdVariant = await Variant.findByPk(variant.id, {
      include: [
        {
          model: CarModel,
          as: 'model',
          attributes: ['id', 'name', 'slug'],
          include: [
            {
              model: Make,
              as: 'make',
              attributes: ['id', 'name', 'slug'],
            },
          ],
        },
      ],
    });

    sendSuccess(
      res,
      'Variant created successfully',
      {
        id: createdVariant!.id,
        modelId: createdVariant!.modelId,
        name: createdVariant!.name,
        defaultAlloySize: parseFloat(createdVariant!.defaultAlloySize.toString()),
        isActive: createdVariant!.isActive,
        model: (createdVariant as any).model,
        createdAt: createdVariant!.createdAt,
        updatedAt: createdVariant!.updatedAt,
      },
      201
    );
  } catch (error) {
    sendError(res, 'Failed to create variant', 500);
  }
};

// Get list of all variants with global search support
export const listVariants = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const modelId = req.query.modelId ? parseInt(req.query.modelId as string) : undefined;
    const makeId = req.query.makeId ? parseInt(req.query.makeId as string) : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const isActive = req.query.isActive !== undefined
      ? req.query.isActive === 'true'
      : undefined;

    const offset = (page - 1) * limit;

    // Build where clause for variant
    const whereClause: any = {};

    if (modelId) {
      whereClause.modelId = modelId;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    // Build include clause with search support
    const includeClause: any = [
      {
        model: CarModel,
        as: 'model',
        attributes: ['id', 'name', 'slug'],
        required: false, // Use left join to allow variants without matching model/make
        where: makeId ? { makeId } : undefined,
        include: [
          {
            model: Make,
            as: 'make',
            attributes: ['id', 'name', 'slug'],
            required: false,
          },
        ],
      },
    ];

    // If search is provided, use Sequelize.literal to search across variant, model, and make names
    if (search) {
      whereClause[Op.or] = [
        // Search in variant name
        { name: { [Op.like]: `%${search}%` } },
        // Search in model name (via subquery)
        {
          '$model.name$': { [Op.like]: `%${search}%` },
        },
        // Search in make name (via subquery)
        {
          '$model.make.name$': { [Op.like]: `%${search}%` },
        },
      ];

      // Make joins required when searching to ensure we have the data
      includeClause[0].required = false;
      includeClause[0].include[0].required = false;
    }

    // Fetch variants with pagination
    const { count, rows: variants } = await Variant.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
      include: includeClause,
    });

    sendSuccess(res, 'Variants retrieved successfully', {
      items: variants.map(variant => ({
        id: variant.id,
        modelId: variant.modelId,
        name: variant.name,
        defaultAlloySize: parseFloat(variant.defaultAlloySize.toString()),
        isActive: variant.isActive,
        model: (variant as any).model,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    sendError(res, 'Failed to retrieve variants', 500);
  }
};
