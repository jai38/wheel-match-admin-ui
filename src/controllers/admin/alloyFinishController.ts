import type { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import AlloyFinish from '../../models/AlloyFinish.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

export const createAlloyFinishValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 1, max: 200 }).withMessage('Description must be between 1 and 200 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const listAlloyFinishesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must not exceed 100 characters'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const createAlloyFinish = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { name, description, isActive } = req.body;

    const existingFinish = await AlloyFinish.findOne({ where: { name } });
    if (existingFinish) {
      sendError(res, 'Alloy finish with this name already exists', 409);
      return;
    }

    const finish = await AlloyFinish.create({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    sendSuccess(res, 'Alloy finish created successfully', {
      id: finish.id,
      name: finish.name,
      description: finish.description,
      isActive: finish.isActive,
      createdAt: finish.createdAt,
      updatedAt: finish.updatedAt,
    }, 201);
  } catch (error) {
    console.error('Create alloy finish error:', error);
    sendError(res, 'Failed to create alloy finish', 500);
  }
};

export const listAlloyFinishes = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    const { count, rows: finishes } = await AlloyFinish.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    sendSuccess(res, 'Alloy finishes retrieved successfully', {
      finishes: finishes.map(finish => ({
        id: finish.id,
        name: finish.name,
        description: finish.description,
        isActive: finish.isActive,
        createdAt: finish.createdAt,
        updatedAt: finish.updatedAt,
      })),
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('List alloy finishes error:', error);
    sendError(res, 'Failed to retrieve alloy finishes', 500);
  }
};
