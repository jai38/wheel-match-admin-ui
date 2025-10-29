import { Router } from 'express';
import { createAlloyDesign, listAlloyDesigns, createAlloyDesignValidation, listAlloyDesignsValidation } from '../../controllers/admin/alloyDesignController.js';
import { createAlloyPCD, listAlloyPCDs, createAlloyPCDValidation, listAlloyPCDsValidation } from '../../controllers/admin/alloyPcdController.js';
import { createAlloyFinish, listAlloyFinishes, createAlloyFinishValidation, listAlloyFinishesValidation } from '../../controllers/admin/alloyFinishController.js';
import { createAlloySize, listAlloySizes, createAlloySizeValidation, listAlloySizesValidation } from '../../controllers/admin/alloySizeController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Design routes
router.post('/designs', validate(createAlloyDesignValidation), createAlloyDesign);
router.get('/designs', validate(listAlloyDesignsValidation), listAlloyDesigns);

// PCD routes
router.post('/pcds', validate(createAlloyPCDValidation), createAlloyPCD);
router.get('/pcds', validate(listAlloyPCDsValidation), listAlloyPCDs);

// Finish routes
router.post('/finishes', validate(createAlloyFinishValidation), createAlloyFinish);
router.get('/finishes', validate(listAlloyFinishesValidation), listAlloyFinishes);

// Size routes
router.post('/sizes', validate(createAlloySizeValidation), createAlloySize);
router.get('/sizes', validate(listAlloySizesValidation), listAlloySizes);

export default router;
