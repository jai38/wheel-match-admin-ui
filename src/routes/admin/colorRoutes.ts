import { Router } from 'express';
import {
  createColor,
  listColors,
  createColorValidation,
  listColorsValidation,
} from '../../controllers/admin/colorController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Color routes
router.post('/', createColorValidation, createColor);
router.get('/', listColorsValidation, listColors);

export default router;
