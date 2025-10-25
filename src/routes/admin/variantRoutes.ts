import { Router } from 'express';
import {
  createVariant,
  listVariants,
  createVariantValidation,
  listVariantsValidation,
} from '../../controllers/admin/variantController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Variant routes
router.post('/', createVariantValidation, createVariant);
router.get('/', listVariantsValidation, listVariants);

export default router;
