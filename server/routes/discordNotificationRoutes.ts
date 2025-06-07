import express from 'express';
import UnifiedNotificationService, { CustomerContact } from '../services/unifiedNotificationService.js';

const router = express.Router();

// Test Discord notification endpoint
router.post('/test-discord-notification', async (req, res) => {
  try {
    const { discordUserId, orderId, type, message } = req.body;
    
    if (!discordUserId) {
      return res.status(400).json({ error: 'Discord user ID is required' });
    }

    const notificationService = req.app.locals.notificationService as UnifiedNotificationService;
    
    const testCustomer: CustomerContact = {
      id: 1,
      email: 'customer@example.com',
      discordUserId: discordUserId,
      preferences: {
        discord: true,
        email: true,
        inApp: true,
        sms: false
      }
    };

    let result;
    
    switch (type) {
      case 'order_update':
        result = await notificationService.sendOrderStatusUpdate(
          testCustomer, 
          orderId || 123, 
          'In Production',
          message || 'Your custom frame is now being crafted by our artisans.'
        );
        break;
        
      case 'completion':
        result = await notificationService.sendCompletionNotice(
          testCustomer,
          orderId || 123,
          message || 'Ready for pickup at our studio during business hours.'
        );
        break;
        
      case 'estimate':
        result = await notificationService.sendEstimateUpdate(
          testCustomer,
          orderId || 123,
          7
        );
        break;
        
      default:
        result = await notificationService.notifyCustomer(testCustomer, {
          title: 'Test Notification',
          message: message || 'This is a test notification from Jays Frames.',
          type: 'custom',
          urgency: 'normal'
        });
    }

    res.json({
      success: true,
      message: 'Discord notification sent successfully',
      details: result
    });

  } catch (error) {
    console.error('Error sending Discord notification:', error);
    res.status(500).json({ 
      error: 'Failed to send Discord notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Discord bot info
router.get('/bot-info', (req, res) => {
  res.json({
    botName: 'Jays Frames Ecosystem#5403',
    availableCommands: [
      '/order-status - Check order status',
      '/frame-quote - Get frame quotes',
      '/production-status - Check production queue',
      '/inventory-status - Check inventory levels',
      '/help - Show available commands'
    ],
    features: [
      'Direct message notifications',
      'Order status updates',
      'Completion notices',
      'Estimate updates',
      'Production alerts'
    ]
  });
});

export default router;