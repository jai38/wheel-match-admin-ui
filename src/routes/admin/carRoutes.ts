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

const router = Router();

// All routes require authentication
router.use(authenticate);

// Car routes
router.post('/', createCarValidation, createCar);
router.get('/', listCarsValidation, listCars);
router.get('/:id', getCarValidation, getCar);
router.put('/:id', updateCarValidation, updateCar);
router.delete('/:id', getCarValidation, deleteCar);

export default router;
