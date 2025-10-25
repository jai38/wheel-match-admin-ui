import { Router } from 'express';
import {
  createMake,
  listMakes,
  createMakeValidation,
  listMakesValidation,
} from '../../controllers/admin/makeController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Make routes
router.post('/', createMakeValidation, createMake);
router.get('/', listMakesValidation, listMakes);

export default router;
