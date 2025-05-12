
import { Router } from 'express';
import * as webhookController from '../controllers/webhookController';
import { authenticateAdmin } from '../middleware/security';

const router = Router();

/**
 * @route GET /api/webhooks
 * @desc Get all webhook endpoints
 * @access Admin only
 */
router.get('/', authenticateAdmin, webhookController.getWebhookEndpoints);

/**
 * @route POST /api/webhooks
 * @desc Create a new webhook endpoint
 * @access Admin only
 */
router.post('/', authenticateAdmin, webhookController.createWebhookEndpoint);

/**
 * @route PATCH /api/webhooks/:id
 * @desc Update a webhook endpoint
 * @access Admin only
 */
router.patch('/:id', authenticateAdmin, webhookController.updateWebhookEndpoint);

/**
 * @route DELETE /api/webhooks/:id
 * @desc Delete a webhook endpoint
 * @access Admin only
 */
router.delete('/:id', authenticateAdmin, webhookController.deleteWebhookEndpoint);

/**
 * @route POST /api/webhooks/:id/test
 * @desc Test a webhook endpoint
 * @access Admin only
 */
router.post('/:id/test', authenticateAdmin, webhookController.testWebhookEndpoint);

export default router;
