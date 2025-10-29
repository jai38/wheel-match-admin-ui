import { Router } from 'express';
import { createAlloyDesign, listAlloyDesigns, createAlloyDesignValidation, listAlloyDesignsValidation } from '../../controllers/admin/alloyDesignController.js';
import { createAlloyPCD, listAlloyPCDs, createAlloyPCDValidation, listAlloyPCDsValidation } from '../../controllers/admin/alloyPcdController.js';
import { createAlloyFinish, listAlloyFinishes, createAlloyFinishValidation, listAlloyFinishesValidation } from '../../controllers/admin/alloyFinishController.js';
import { createAlloySize, listAlloySizes, createAlloySizeValidation, listAlloySizesValidation } from '../../controllers/admin/alloySizeController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Design routes
router.post('/designs', createAlloyDesignValidation, createAlloyDesign);
router.get('/designs', listAlloyDesignsValidation, listAlloyDesigns);

// PCD routes
router.post('/pcds', createAlloyPCDValidation, createAlloyPCD);
router.get('/pcds', listAlloyPCDsValidation, listAlloyPCDs);

// Finish routes
router.post('/finishes', createAlloyFinishValidation, createAlloyFinish);
router.get('/finishes', listAlloyFinishesValidation, listAlloyFinishes);

// Size routes
router.post('/sizes', createAlloySizeValidation, createAlloySize);
router.get('/sizes', listAlloySizesValidation, listAlloySizes);

export default router;
