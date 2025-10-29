import type { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Alloy from '../../models/Alloy.js';
import AlloyDesign from '../../models/AlloyDesign.js';
import AlloyPCD from '../../models/AlloyPCD.js';
import AlloyFinish from '../../models/AlloyFinish.js';
import AlloySize from '../../models/AlloySize.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { Op } from 'sequelize';

// Helper function to generate alloy name: {specs} {design} {pcd} {finish}
const generateAlloyName = (specs: string, design: string, pcd: string, finish: string): string => {
  return `${specs} ${design} ${pcd} ${finish}`;
};

// Helper function to format alloy response
const formatAlloyResponse = (alloy: any) => ({
  id: alloy.id,
  designId: alloy.designId,
  pcdId: alloy.pcdId,
  finishId: alloy.finishId,
  sizeId: alloy.sizeId,
  alloyName: alloy.alloyName,
  alloyImages: alloy.alloyImages,
  isActive: alloy.isActive,
  design: alloy.design ? { id: alloy.design.id, name: alloy.design.name } : null,
  pcd: alloy.pcd ? { id: alloy.pcd.id, name: alloy.pcd.name } : null,
  finish: alloy.finish ? { id: alloy.finish.id, name: alloy.finish.name, description: alloy.finish.description } : null,
  size: alloy.size ? {
    id: alloy.size.id,
    diameter: parseFloat(alloy.size.diameter.toString()),
    width: parseFloat(alloy.size.width.toString()),
    offset: alloy.size.offset,
    specs: alloy.size.specs,
  } : null,
  createdAt: alloy.createdAt,
  updatedAt: alloy.updatedAt,
});

// Validation rules
export const createAlloyValidation = [
  body('designId').notEmpty().withMessage('Design ID is required').isInt({ min: 1 }).withMessage('Design ID must be a positive integer'),
  body('pcdId').notEmpty().withMessage('PCD ID is required').isInt({ min: 1 }).withMessage('PCD ID must be a positive integer'),
  body('finishId').notEmpty().withMessage('Finish ID is required').isInt({ min: 1 }).withMessage('Finish ID must be a positive integer'),
  body('sizeId').notEmpty().withMessage('Size ID is required').isInt({ min: 1 }).withMessage('Size ID must be a positive integer'),
  body('alloyImages').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('alloyImages.*').isURL().withMessage('Each image must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const updateAlloyValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid alloy ID'),
  body('designId').optional().isInt({ min: 1 }).withMessage('Design ID must be a positive integer'),
  body('pcdId').optional().isInt({ min: 1 }).withMessage('PCD ID must be a positive integer'),
  body('finishId').optional().isInt({ min: 1 }).withMessage('Finish ID must be a positive integer'),
  body('sizeId').optional().isInt({ min: 1 }).withMessage('Size ID must be a positive integer'),
  body('alloyImages').optional().isArray({ min: 1 }).withMessage('At least one image is required'),
  body('alloyImages.*').optional().isURL().withMessage('Each image must be a valid URL'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const listAlloysValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must not exceed 100 characters'),
  query('designId').optional().isInt({ min: 1 }).withMessage('Design ID must be a positive integer'),
  query('pcdId').optional().isInt({ min: 1 }).withMessage('PCD ID must be a positive integer'),
  query('finishId').optional().isInt({ min: 1 }).withMessage('Finish ID must be a positive integer'),
  query('sizeId').optional().isInt({ min: 1 }).withMessage('Size ID must be a positive integer'),
  query('diameter').optional().isFloat({ min: 10, max: 30 }).withMessage('Diameter must be between 10 and 30'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const getAlloyValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid alloy ID'),
];

// Create a new alloy
export const createAlloy = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const { designId, pcdId, finishId, sizeId, alloyImages, isActive } = req.body;

    // Check if all master data exists
    const [design, pcd, finish, size] = await Promise.all([
      AlloyDesign.findByPk(designId),
      AlloyPCD.findByPk(pcdId),
      AlloyFinish.findByPk(finishId),
      AlloySize.findByPk(sizeId),
    ]);

    if (!design) {
      sendError(res, 'Design not found', 404);
      return;
    }
    if (!pcd) {
      sendError(res, 'PCD not found', 404);
      return;
    }
    if (!finish) {
      sendError(res, 'Finish not found', 404);
      return;
    }
    if (!size) {
      sendError(res, 'Size not found', 404);
      return;
    }

    // Check if alloy with same combination already exists
    const existingAlloy = await Alloy.findOne({
      where: { designId, pcdId, finishId, sizeId },
    });

    if (existingAlloy) {
      sendError(res, 'Alloy with this combination already exists', 409);
      return;
    }

    // Generate alloy name: {specs} {design} {pcd} {finish}
    const alloyName = generateAlloyName(size.specs, design.name, pcd.name, finish.name);

    // Create alloy
    const alloy = await Alloy.create({
      designId,
      pcdId,
      finishId,
      sizeId,
      alloyName,
      alloyImages,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Fetch created alloy with relationships
    const createdAlloy = await Alloy.findByPk(alloy.id, {
      include: [
        { model: AlloyDesign, as: 'design', attributes: ['id', 'name'] },
        { model: AlloyPCD, as: 'pcd', attributes: ['id', 'name'] },
        { model: AlloyFinish, as: 'finish', attributes: ['id', 'name', 'description'] },
        { model: AlloySize, as: 'size', attributes: ['id', 'diameter', 'width', 'offset', 'specs'] },
      ],
    });

    sendSuccess(res, 'Alloy created successfully', formatAlloyResponse(createdAlloy), 201);
  } catch (error) {
    console.error('Create alloy error:', error);
    sendError(res, 'Failed to create alloy', 500);
  }
};

// List all alloys
export const listAlloys = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const designId = req.query.designId ? parseInt(req.query.designId as string) : undefined;
    const pcdId = req.query.pcdId ? parseInt(req.query.pcdId as string) : undefined;
    const finishId = req.query.finishId ? parseInt(req.query.finishId as string) : undefined;
    const sizeId = req.query.sizeId ? parseInt(req.query.sizeId as string) : undefined;
    const diameter = req.query.diameter ? parseFloat(req.query.diameter as string) : undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.alloyName = { [Op.like]: `%${search}%` };
    }
    if (designId) whereClause.designId = designId;
    if (pcdId) whereClause.pcdId = pcdId;
    if (finishId) whereClause.finishId = finishId;
    if (sizeId) whereClause.sizeId = sizeId;
    if (isActive !== undefined) whereClause.isActive = isActive;

    // Build include clause with diameter filter
    const includeClause: any = [
      { model: AlloyDesign, as: 'design', attributes: ['id', 'name'] },
      { model: AlloyPCD, as: 'pcd', attributes: ['id', 'name'] },
      { model: AlloyFinish, as: 'finish', attributes: ['id', 'name', 'description'] },
      {
        model: AlloySize,
        as: 'size',
        attributes: ['id', 'diameter', 'width', 'offset', 'specs'],
        where: diameter !== undefined ? { diameter } : undefined,
        required: diameter !== undefined,
      },
    ];

    const { count, rows: alloys } = await Alloy.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    sendSuccess(res, 'Alloys retrieved successfully', {
      alloys: alloys.map(alloy => formatAlloyResponse(alloy)),
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('List alloys error:', error);
    sendError(res, 'Failed to retrieve alloys', 500);
  }
};

// Get single alloy by ID
export const getAlloy = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const alloyId = parseInt(req.params.id);

    const alloy = await Alloy.findByPk(alloyId, {
      include: [
        { model: AlloyDesign, as: 'design', attributes: ['id', 'name'] },
        { model: AlloyPCD, as: 'pcd', attributes: ['id', 'name'] },
        { model: AlloyFinish, as: 'finish', attributes: ['id', 'name', 'description'] },
        { model: AlloySize, as: 'size', attributes: ['id', 'diameter', 'width', 'offset', 'specs'] },
      ],
    });

    if (!alloy) {
      sendError(res, 'Alloy not found', 404);
      return;
    }

    sendSuccess(res, 'Alloy retrieved successfully', formatAlloyResponse(alloy));
  } catch (error) {
    console.error('Get alloy error:', error);
    sendError(res, 'Failed to retrieve alloy', 500);
  }
};

// Update alloy
export const updateAlloy = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, errors.array()[0].msg, 400);
      return;
    }

    const alloyId = parseInt(req.params.id);
    const { designId, pcdId, finishId, sizeId, alloyImages, isActive } = req.body;

    const alloy = await Alloy.findByPk(alloyId);
    if (!alloy) {
      sendError(res, 'Alloy not found', 404);
      return;
    }

    // Check if master data exists for updated fields
    if (designId !== undefined) {
      const design = await AlloyDesign.findByPk(designId);
      if (!design) {
        sendError(res, 'Design not found', 404);
        return;
      }
    }
    if (pcdId !== undefined) {
      const pcd = await AlloyPCD.findByPk(pcdId);
      if (!pcd) {
        sendError(res, 'PCD not found', 404);
        return;
      }
    }
    if (finishId !== undefined) {
      const finish = await AlloyFinish.findByPk(finishId);
      if (!finish) {
        sendError(res, 'Finish not found', 404);
        return;
      }
    }
    if (sizeId !== undefined) {
      const size = await AlloySize.findByPk(sizeId);
      if (!size) {
        sendError(res, 'Size not found', 404);
        return;
      }
    }

    // Check for duplicate combination (excluding current alloy)
    if (designId !== undefined || pcdId !== undefined || finishId !== undefined || sizeId !== undefined) {
      const existingAlloy = await Alloy.findOne({
        where: {
          designId: designId !== undefined ? designId : alloy.designId,
          pcdId: pcdId !== undefined ? pcdId : alloy.pcdId,
          finishId: finishId !== undefined ? finishId : alloy.finishId,
          sizeId: sizeId !== undefined ? sizeId : alloy.sizeId,
          id: { [Op.ne]: alloyId },
        },
      });

      if (existingAlloy) {
        sendError(res, 'Alloy with this combination already exists', 409);
        return;
      }
    }

    // Regenerate alloy name if master data changed
    let newAlloyName = alloy.alloyName;
    if (designId !== undefined || pcdId !== undefined || finishId !== undefined || sizeId !== undefined) {
      const [design, pcd, finish, size] = await Promise.all([
        designId !== undefined ? AlloyDesign.findByPk(designId) : AlloyDesign.findByPk(alloy.designId),
        pcdId !== undefined ? AlloyPCD.findByPk(pcdId) : AlloyPCD.findByPk(alloy.pcdId),
        finishId !== undefined ? AlloyFinish.findByPk(finishId) : AlloyFinish.findByPk(alloy.finishId),
        sizeId !== undefined ? AlloySize.findByPk(sizeId) : AlloySize.findByPk(alloy.sizeId),
      ]);
      
      newAlloyName = generateAlloyName(size!.specs, design!.name, pcd!.name, finish!.name);
    }

    // Update alloy
    await alloy.update({
      ...(designId !== undefined && { designId }),
      ...(pcdId !== undefined && { pcdId }),
      ...(finishId !== undefined && { finishId }),
      ...(sizeId !== undefined && { sizeId }),
      ...(alloyImages !== undefined && { alloyImages }),
      ...(isActive !== undefined && { isActive }),
      alloyName: newAlloyName,
    });

    // Fetch updated alloy with relationships
    const updatedAlloy = await Alloy.findByPk(alloyId, {
      include: [
        { model: AlloyDesign, as: 'design', attributes: ['id', 'name'] },
        { model: AlloyPCD, as: 'pcd', attributes: ['id', 'name'] },
        { model: AlloyFinish, as: 'finish', attributes: ['id', 'name', 'description'] },
        { model: AlloySize, as: 'size', attributes: ['id', 'diameter', 'width', 'offset', 'specs'] },
      ],
    });

    sendSuccess(res, 'Alloy updated successfully', formatAlloyResponse(updatedAlloy));
  } catch (error) {
    console.error('Update alloy error:', error);
    sendError(res, 'Failed to update alloy', 500);
  }
};
