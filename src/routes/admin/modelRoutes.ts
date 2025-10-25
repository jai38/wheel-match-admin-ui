import { Router } from 'express';
import {
  createModel,
  listModels,
  createModelValidation,
  listModelsValidation,
} from '../../controllers/admin/modelController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Model routes
router.post('/', createModelValidation, createModel);
router.get('/', listModelsValidation, listModels);

export default router;
