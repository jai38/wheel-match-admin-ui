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
import { validate } from '../../middlewares/validate.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Alloy CRUD routes
router.post('/', validate(createAlloyValidation), createAlloy);
router.get('/', validate(listAlloysValidation), listAlloys);
router.get('/:id', validate(getAlloyValidation), getAlloy);
router.put('/:id', validate(updateAlloyValidation), updateAlloy);

export default router;
