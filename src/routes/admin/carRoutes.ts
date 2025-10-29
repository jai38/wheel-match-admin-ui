import { Router } from 'express';
import {
  createCar,
  listCars,
  getCar,
  updateCar,
  deleteCar,
  createCarValidation,
  listCarsValidation,
  getCarValidation,
  updateCarValidation,
} from '../../controllers/admin/carController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Car routes
router.post('/', validate(createCarValidation), createCar);
router.get('/', validate(listCarsValidation), listCars);
router.get('/:id', validate(getCarValidation), getCar);
router.put('/:id', validate(updateCarValidation), updateCar);
router.delete('/:id', validate(getCarValidation), deleteCar);

export default router;
