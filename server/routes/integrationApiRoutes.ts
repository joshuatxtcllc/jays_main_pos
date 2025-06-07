import { Router } from 'express';
import * as integrationController from '../controllers/integrationController';
import { verifyApiKey } from '../middleware/security';
import { 
  generateApiKey,
  testIntegration,
  configureKanbanConnection 
} from '../controllers/integrationController';

const router = Router();

/**
 * @route GET /api/integration/orders/:id
 * @desc Get order information with QR code
 * @access Protected by API key
 */
router.get('/orders/:id', verifyApiKey, integrationController.getOrderWithQrCode);

/**
 * @route GET /api/integration/orders
 * @desc Get all orders with QR codes
 * @access Protected by API key
 */
router.get('/orders', verifyApiKey, integrationController.getAllOrdersWithQrCodes);

/**
 * @route PATCH /api/integration/orders/:id/status
 * @desc Update order status from external system
 * @access Protected by API key
 */
router.patch('/orders/:id/status', verifyApiKey, integrationController.updateOrderStatus);

/**
 * @route POST /api/integration/webhook
 * @desc Receive webhook notifications from external systems
 * @access Protected by API key
 */
router.post('/webhook', verifyApiKey, integrationController.receiveWebhook);

// Test integration
router.get('/test', testIntegration);

// Configure Kanban app connection
router.post('/configure-kanban', configureKanbanConnection);

export default router;