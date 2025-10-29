import type { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import AlloySize from '../../models/AlloySize.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

export const createAlloySizeValidation = [
  body('diameter').notEmpty().withMessage('Diameter is required').isFloat({ min: 10, max: 30 }).withMessage('Diameter must be between 10 and 30 inches'),
  body('width').notEmpty().withMessage('Width is required').isFloat({ min: 5, max: 15 }).withMessage('Width must be between 5 and 15 inches'),
  body('offset').optional().isInt().withMessage('Offset must be an integer'),
  body('specs').trim().notEmpty().withMessage('Specs is required').isLength({ min: 1, max: 50 }).withMessage('Specs must be between 1 and 50 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const listAlloySizesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must not exceed 100 characters'),
  query('diameter').optional().isFloat({ min: 10, max: 30 }).withMessage('Diameter must be between 10 and 30'),
  query('minDiameter').optional().isFloat({ min: 10, max: 30 }).withMessage('Min diameter must be between 10 and 30'),
  query('maxDiameter').optional().isFloat({ min: 10, max: 30 }).withMessage('Max diameter must be between 10 and 30'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const createAlloySize = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { diameter, width, offset, specs, isActive } = req.body;

    const existingSize = await AlloySize.findOne({ where: { specs } });
    if (existingSize) {
      sendError(res, 'Alloy size with these specs already exists', 409);
      return;
    }

    const size = await AlloySize.create({
      diameter,
      width,
      offset: offset || null,
      specs,
      isActive: isActive !== undefined ? isActive : true,
    });

    sendSuccess(res, 'Alloy size created successfully', {
      id: size.id,
      diameter: parseFloat(size.diameter.toString()),
      width: parseFloat(size.width.toString()),
      offset: size.offset,
      specs: size.specs,
      isActive: size.isActive,
      createdAt: size.createdAt,
      updatedAt: size.updatedAt,
    }, 201);
  } catch (error) {
    console.error('Create alloy size error:', error);
    sendError(res, 'Failed to create alloy size', 500);
  }
};

export const listAlloySizes = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const diameter = req.query.diameter ? parseFloat(req.query.diameter as string) : undefined;
    const minDiameter = req.query.minDiameter ? parseFloat(req.query.minDiameter as string) : undefined;
    const maxDiameter = req.query.maxDiameter ? parseFloat(req.query.maxDiameter as string) : undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    
    if (search) {
      whereClause.specs = { [Op.like]: `%${search}%` };
    }
    
    if (diameter !== undefined) {
      whereClause.diameter = diameter;
    } else if (minDiameter !== undefined || maxDiameter !== undefined) {
      whereClause.diameter = {};
      if (minDiameter !== undefined) whereClause.diameter[Op.gte] = minDiameter;
      if (maxDiameter !== undefined) whereClause.diameter[Op.lte] = maxDiameter;
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const { count, rows: sizes } = await AlloySize.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['diameter', 'ASC'], ['width', 'ASC']],
    });

    sendSuccess(res, 'Alloy sizes retrieved successfully', {
      sizes: sizes.map(size => ({
        id: size.id,
        diameter: parseFloat(size.diameter.toString()),
        width: parseFloat(size.width.toString()),
        offset: size.offset,
        specs: size.specs,
        isActive: size.isActive,
        createdAt: size.createdAt,
        updatedAt: size.updatedAt,
      })),
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('List alloy sizes error:', error);
    sendError(res, 'Failed to retrieve alloy sizes', 500);
  }
};
