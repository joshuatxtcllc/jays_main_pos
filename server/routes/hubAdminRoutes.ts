
import { Router } from 'express';
import * as hubApiController from '../controllers/hubApiController';

const router = Router();

/**
 * @route POST /api/admin/generate-hub-key
 * @desc Generate API key for hub integration
 * @access Admin only (add proper auth middleware in production)
 */
router.post('/generate-hub-key', hubApiController.generateHubApiKey);

/**
 * @route GET /api/admin/hub-connection-info
 * @desc Get hub connection information and endpoints
 * @access Admin only (add proper auth middleware in production)
 */
router.get('/hub-connection-info', hubApiController.getHubConnectionInfo);

export default router;
