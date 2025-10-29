import type { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Car from '../../models/Car.js';
import Variant from '../../models/Variant.js';
import Color from '../../models/Color.js';
import CarModel from '../../models/CarModel.js';
import Make from '../../models/Make.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

// Validation rules
export const createCarValidation = [
  body('variantId')
    .notEmpty()
    .withMessage('Variant ID is required')
    .isInt({ min: 1 })
    .withMessage('Variant ID must be a positive integer'),
  body('colorId')
    .notEmpty()
    .withMessage('Color ID is required')
    .isInt({ min: 1 })
    .withMessage('Color ID must be a positive integer'),
  body('carImage')
    .trim()
    .notEmpty()
    .withMessage('Car image is required')
    .isLength({ max: 500 })
    .withMessage('Car image URL must not exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const updateCarValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid car ID'),
  body('variantId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Variant ID must be a positive integer'),
  body('colorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Color ID must be a positive integer'),
  body('carImage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Car image URL must not exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const listCarsValidation = [
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
  query('makeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Make ID must be a positive integer'),
  query('modelId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Model ID must be a positive integer'),
  query('variantId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Variant ID must be a positive integer'),
  query('colorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Color ID must be a positive integer'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const getCarValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid car ID'),
];

// Helper function to format car response with full details
const formatCarResponse = (car: any) => ({
  id: car.id,
  variantId: car.variantId,
  colorId: car.colorId,
  carImage: car.carImage,
  isActive: car.isActive,
  variant: car.variant ? {
    id: car.variant.id,
    name: car.variant.name,
    defaultAlloySize: parseFloat(car.variant.defaultAlloySize.toString()),
    model: car.variant.model ? {
      id: car.variant.model.id,
      name: car.variant.model.name,
      slug: car.variant.model.slug,
      make: car.variant.model.make ? {
        id: car.variant.model.make.id,
        name: car.variant.model.make.name,
        slug: car.variant.model.make.slug,
      } : null,
    } : null,
  } : null,
  color: car.color ? {
    id: car.color.id,
    name: car.color.name,
    colorCode: car.color.colorCode,
  } : null,
  createdAt: car.createdAt,
  updatedAt: car.updatedAt,
});

// Create a new car
export const createCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { variantId, colorId, carImage, isActive } = req.body;

    // Check if variant exists
    const variant = await Variant.findByPk(variantId);
    if (!variant) {
      sendError(res, 'Variant not found', 404);
      return;
    }

    // Check if color exists
    const color = await Color.findByPk(colorId);
    if (!color) {
      sendError(res, 'Color not found', 404);
      return;
    }

    // Check if car with same variant and color already exists
    const existingCar = await Car.findOne({
      where: {
        variantId,
        colorId,
      },
    });

    if (existingCar) {
      sendError(res, 'Car with this variant and color combination already exists', 409);
      return;
    }

    // Create car
    const car = await Car.create({
      variantId,
      colorId,
      carImage,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Fetch the created car with full details
    const createdCar = await Car.findByPk(car.id, {
      include: [
        {
          model: Variant,
          as: 'variant',
          attributes: ['id', 'name', 'defaultAlloySize'],
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
        },
        {
          model: Color,
          as: 'color',
          attributes: ['id', 'name', 'colorCode'],
        },
      ],
    });

    sendSuccess(
      res,
      'Car created successfully',
      formatCarResponse(createdCar),
      201
    );
  } catch (error) {
    console.error('Create car error:', error);
    sendError(res, 'Failed to create car', 500);
  }
};

// Get list of all cars
export const listCars = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const makeId = req.query.makeId ? parseInt(req.query.makeId as string) : undefined;
    const modelId = req.query.modelId ? parseInt(req.query.modelId as string) : undefined;
    const variantId = req.query.variantId ? parseInt(req.query.variantId as string) : undefined;
    const colorId = req.query.colorId ? parseInt(req.query.colorId as string) : undefined;
    const isActive = req.query.isActive !== undefined 
      ? req.query.isActive === 'true' 
      : undefined;

    const offset = (page - 1) * limit;

    // Build where clause for car
    const whereClause: any = {};
    
    if (variantId) {
      whereClause.variantId = variantId;
    }

    if (colorId) {
      whereClause.colorId = colorId;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    // Build include clause for search and filters
    const includeClause: any = [
      {
        model: Variant,
        as: 'variant',
        attributes: ['id', 'name', 'defaultAlloySize'],
        required: search || modelId || makeId ? true : false,
        where: modelId ? { modelId } : undefined,
        include: [
          {
            model: CarModel,
            as: 'model',
            attributes: ['id', 'name', 'slug'],
            required: search || makeId ? true : false,
            where: search ? {
              name: { [Op.like]: `%${search}%` },
            } : makeId ? { makeId } : undefined,
            include: [
              {
                model: Make,
                as: 'make',
                attributes: ['id', 'name', 'slug'],
                required: search || makeId ? true : false,
                where: search ? {
                  name: { [Op.like]: `%${search}%` },
                } : makeId ? { id: makeId } : undefined,
              },
            ],
          },
        ],
      },
      {
        model: Color,
        as: 'color',
        attributes: ['id', 'name', 'colorCode'],
      },
    ];

    // Fetch cars with pagination
    const { count, rows: cars } = await Car.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: includeClause,
    });

    sendSuccess(res, 'Cars retrieved successfully', {
      cars: cars.map(car => formatCarResponse(car)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('List cars error:', error);
    sendError(res, 'Failed to retrieve cars', 500);
  }
};

// Get single car by ID
export const getCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const carId = parseInt(req.params.id);

    const car = await Car.findByPk(carId, {
      include: [
        {
          model: Variant,
          as: 'variant',
          attributes: ['id', 'name', 'defaultAlloySize'],
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
        },
        {
          model: Color,
          as: 'color',
          attributes: ['id', 'name', 'colorCode'],
        },
      ],
    });

    if (!car) {
      sendError(res, 'Car not found', 404);
      return;
    }

    sendSuccess(res, 'Car retrieved successfully', formatCarResponse(car));
  } catch (error) {
    console.error('Get car error:', error);
    sendError(res, 'Failed to retrieve car', 500);
  }
};

// Update car
export const updateCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const carId = parseInt(req.params.id);
    const { variantId, colorId, carImage, isActive } = req.body;

    const car = await Car.findByPk(carId);
    if (!car) {
      sendError(res, 'Car not found', 404);
      return;
    }

    // If updating variant, check if it exists
    if (variantId !== undefined) {
      const variant = await Variant.findByPk(variantId);
      if (!variant) {
        sendError(res, 'Variant not found', 404);
        return;
      }
    }

    // If updating color, check if it exists
    if (colorId !== undefined) {
      const color = await Color.findByPk(colorId);
      if (!color) {
        sendError(res, 'Color not found', 404);
        return;
      }
    }

    // Check for duplicate variant+color combination (excluding current car)
    if (variantId !== undefined || colorId !== undefined) {
      const existingCar = await Car.findOne({
        where: {
          variantId: variantId !== undefined ? variantId : car.variantId,
          colorId: colorId !== undefined ? colorId : car.colorId,
          id: { [Op.ne]: carId },
        },
      });

      if (existingCar) {
        sendError(res, 'Car with this variant and color combination already exists', 409);
        return;
      }
    }

    // Update car
    await car.update({
      ...(variantId !== undefined && { variantId }),
      ...(colorId !== undefined && { colorId }),
      ...(carImage !== undefined && { carImage }),
      ...(isActive !== undefined && { isActive }),
    });

    // Fetch updated car with full details
    const updatedCar = await Car.findByPk(carId, {
      include: [
        {
          model: Variant,
          as: 'variant',
          attributes: ['id', 'name', 'defaultAlloySize'],
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
        },
        {
          model: Color,
          as: 'color',
          attributes: ['id', 'name', 'colorCode'],
        },
      ],
    });

    sendSuccess(res, 'Car updated successfully', formatCarResponse(updatedCar));
  } catch (error) {
    console.error('Update car error:', error);
    sendError(res, 'Failed to update car', 500);
  }
};

// Delete car
export const deleteCar = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const carId = parseInt(req.params.id);

    const car = await Car.findByPk(carId);
    if (!car) {
      sendError(res, 'Car not found', 404);
      return;
    }

    // Soft delete by setting isActive to false
    await car.update({ isActive: false });

    sendSuccess(res, 'Car deleted successfully');
  } catch (error) {
    console.error('Delete car error:', error);
    sendError(res, 'Failed to delete car', 500);
  }
};
