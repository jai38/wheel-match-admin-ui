import { Router } from 'express';
import {
  createMake,
  listMakes,
  createMakeValidation,
  listMakesValidation,
} from '../../controllers/admin/makeController.js';
import {
  createModel,
  listModels,
  createModelValidation,
  listModelsValidation,
} from '../../controllers/admin/modelController.js';
import {
  createColor,
  listColors,
  createColorValidation,
  listColorsValidation,
} from '../../controllers/admin/colorController.js';
import {
  createVariant,
  listVariants,
  createVariantValidation,
  listVariantsValidation,
} from '../../controllers/admin/variantController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Make routes - /api/admin/car/makes
router.post('/makes', validate(createMakeValidation), createMake);
router.get('/makes', validate(listMakesValidation), listMakes);

// Model routes - /api/admin/car/models
router.post('/models', validate(createModelValidation), createModel);
router.get('/models', validate(listModelsValidation), listModels);

// Color routes - /api/admin/car/colors
router.post('/colors', validate(createColorValidation), createColor);
router.get('/colors', validate(listColorsValidation), listColors);

// Variant routes - /api/admin/car/variants
router.post('/variants', validate(createVariantValidation), createVariant);
router.get('/variants', validate(listVariantsValidation), listVariants);

export default router;
