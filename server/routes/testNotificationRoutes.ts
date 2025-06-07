
import express from 'express';
import UnifiedNotificationService, { CustomerContact } from '../services/unifiedNotificationService.js';
import DiscordBot from '../services/discordBot.js';

const router = express.Router();

// Test customer notification endpoint
router.post('/test-customer-notification', async (req, res) => {
  try {
    const { 
      customerId = 1,
      orderId = 123,
      type = 'order_update',
      discordUserId,
      email = 'test@example.com',
      phone,
      message
    } = req.body;

    // Get the Discord bot from app locals
    const discordBot = req.app.locals.discordBot as DiscordBot;
    if (!discordBot) {
      return res.status(500).json({ error: 'Discord bot not initialized' });
    }

    const notificationService = new UnifiedNotificationService(discordBot);
    
    // Create test customer with notification preferences
    const testCustomer: CustomerContact = {
      id: customerId,
      email: email,
      phone: phone,
      discordUserId: discordUserId,
      preferences: {
        discord: !!discordUserId,
        email: true,
        inApp: true,
        sms: !!phone
      }
    };

    let result;
    
    switch (type) {
      case 'order_update':
        result = await notificationService.sendOrderStatusUpdate(
          testCustomer, 
          orderId, 
          'In Production',
          message || 'Your custom frame is now being crafted by our artisans.'
        );
        break;
        
      case 'completion':
        result = await notificationService.sendCompletionNotice(
          testCustomer,
          orderId,
          message || 'Ready for pickup at our studio during business hours.'
        );
        break;
        
      case 'estimate':
        result = await notificationService.sendEstimateUpdate(
          testCustomer,
          orderId,
          7
        );
        break;
        
      default:
        result = await notificationService.notifyCustomer(testCustomer, {
          title: 'Test Notification',
          message: message || 'This is a test notification from Jay\'s Frames.',
          orderId: orderId,
          type: 'custom',
          urgency: 'normal'
        });
    }

    res.json({
      success: true,
      message: 'Customer notification test completed',
      results: result,
      testCustomer: {
        id: testCustomer.id,
        email: testCustomer.email,
        phone: testCustomer.phone,
        discordUserId: testCustomer.discordUserId,
        preferences: testCustomer.preferences
      }
    });

  } catch (error) {
    console.error('Error testing customer notification:', error);
    res.status(500).json({ 
      error: 'Failed to test customer notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test all notification channels for a customer
router.post('/test-all-channels', async (req, res) => {
  try {
    const { discordUserId, email, phone } = req.body;

    const discordBot = req.app.locals.discordBot as DiscordBot;
    if (!discordBot) {
      return res.status(500).json({ error: 'Discord bot not initialized' });
    }

    const notificationService = new UnifiedNotificationService(discordBot);
    
    const testCustomer: CustomerContact = {
      id: 999,
      email: email || 'test@jaysframes.com',
      phone: phone,
      discordUserId: discordUserId,
      preferences: {
        discord: !!discordUserId,
        email: true,
        inApp: true,
        sms: !!phone
      }
    };

    // Test each notification type
    const tests = [
      {
        type: 'order_update',
        test: () => notificationService.sendOrderStatusUpdate(testCustomer, 456, 'Measuring', 'We are carefully measuring your artwork.')
      },
      {
        type: 'completion',
        test: () => notificationService.sendCompletionNotice(testCustomer, 456, 'Your frame is ready! Please bring your pickup receipt.')
      },
      {
        type: 'estimate',
        test: () => notificationService.sendEstimateUpdate(testCustomer, 456, 5)
      }
    ];

    const results = [];
    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        results.push({
          type: testCase.type,
          success: true,
          result: result
        });
      } catch (error) {
        results.push({
          type: testCase.type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      message: 'All channel tests completed',
      results: results,
      testCustomer: testCustomer
    });

  } catch (error) {
    console.error('Error testing all channels:', error);
    res.status(500).json({ 
      error: 'Failed to test all channels',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
