import { Router } from 'express';
import {
  createAlloy,
  listAlloys,
  getAlloy,
  updateAlloy,
  createAlloyValidation,
  listAlloysValidation,
  getAlloyValidation,
  updateAlloyValidation,
} from '../../controllers/admin/alloyController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Alloy CRUD routes
router.post('/', createAlloyValidation, createAlloy);
router.get('/', listAlloysValidation, listAlloys);
router.get('/:id', getAlloyValidation, getAlloy);
router.put('/:id', updateAlloyValidation, updateAlloy);

export default router;
