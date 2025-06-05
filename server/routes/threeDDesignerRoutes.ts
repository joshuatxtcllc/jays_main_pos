
import { Router } from 'express';
import * as threeDDesignerController from '../controllers/threeDDesignerController';
import { validateApiKey } from '../middleware/apiKeyAuth';

const router = Router();

/**
 * @route POST /api/3d-designer/orders
 * @desc Create order from 3D Designer
 * @access Protected by API key
 */
router.post('/orders', validateApiKey, threeDDesignerController.createOrderFrom3D);

/**
 * @route GET /api/3d-designer/orders/:trackingId
 * @desc Check order status by tracking ID
 * @access Protected by API key
 */
router.get('/orders/:trackingId', validateApiKey, threeDDesignerController.getOrderStatus);

/**
 * @route PATCH /api/3d-designer/orders/:trackingId/files
 * @desc Update design files for an existing order
 * @access Protected by API key
 */
router.patch('/orders/:trackingId/files', validateApiKey, threeDDesignerController.updateDesignFiles);

/**
 * @route GET /api/3d-designer/pricing/:designType
 * @desc Get pricing for different design types
 * @access Protected by API key
 */
router.get('/pricing/:designType', validateApiKey, threeDDesignerController.getDesignPricing);

/**
 * @route GET /api/3d-designer/frames
 * @desc Get available frame options
 * @access Protected by API key
 */
router.get('/frames', validateApiKey, threeDDesignerController.getFrameOptions);

/**
 * @route GET /api/3d-designer/mats
 * @desc Get available mat color options
 * @access Protected by API key
 */
router.get('/mats', validateApiKey, threeDDesignerController.getMatOptions);

/**
 * @route GET /api/3d-designer/test
 * @desc Test 3D Designer integration
 * @access Protected by API key
 */
router.get('/test', validateApiKey, threeDDesignerController.testIntegration);

export default router;
