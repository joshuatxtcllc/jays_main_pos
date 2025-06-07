import { Request, Response } from 'express';
import { storage } from '../storage';
import * as qrCodeController from './qrCodeController';
import crypto from 'crypto';

/**
 * Integration Controller
 * 
 * This controller handles API requests for external integrations with Houston Frames
 */

/**
 * Get order information by ID with QR code data
 */
export async function getOrderWithQrCode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Get the order
    const order = await storage.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get QR code for the order
    const qrCodeData = await qrCodeController.generateQrCodeForOrder(orderId);

    // Return the order with QR code data
    res.json({
      success: true,
      order: {
        ...order,
        qrCode: qrCodeData
      }
    });
  } catch (error: any) {
    console.error('Error fetching order with QR code:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch order information' });
  }
}

/**
 * Get all orders with their QR codes
 */
export async function getAllOrdersWithQrCodes(req: Request, res: Response) {
  try {
    // Get parameters for filtering
    const { status, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : undefined;

    // Get orders with optional filtering
    const orders = await storage.getOrders(status as string | undefined);

    // Apply limit if specified
    const limitedOrders = limitNum ? orders.slice(0, limitNum) : orders;

    // Enhance orders with QR codes
    const enhancedOrders = await Promise.all(limitedOrders.map(async (order) => {
      const qrCodeData = await qrCodeController.generateQrCodeForOrder(order.id);
      return {
        ...order,
        qrCode: qrCodeData
      };
    }));

    res.json({
      success: true,
      count: enhancedOrders.length,
      orders: enhancedOrders
    });
  } catch (error: any) {
    console.error('Error fetching orders with QR codes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch orders' });
  }
}

/**
 * Update order status from external system
 */
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Get the order
    const order = await storage.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the order status
    const updatedOrder = await storage.updateOrder(orderId, {
      status,
      notes: notes || `Status updated via Integration API to: ${status}`
    });

    // Log status change to history if we have the service available
    try {
      const orderStatusHistoryService = require('../services/orderStatusHistoryService');
      await orderStatusHistoryService.addStatusHistory(orderId, {
        previousStatus: order.status,
        newStatus: status,
        changedBy: 'Integration API',
        notes: notes || `Status updated via Integration API`
      });
    } catch (historyError) {
      console.warn('Could not log status history:', historyError);
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
}

/**
 * Webhook endpoint to receive notifications from external systems
 */
export async function receiveWebhook(req: Request, res: Response) {
  try {
    const { source, event, data } = req.body;

    if (!source || !event) {
      return res.status(400).json({ error: 'Source and event are required' });
    }

    console.log(`Received webhook from ${source}, event: ${event}`);

    // Process the webhook based on source and event
    switch (source) {
      case 'qr_generator':
        // Handle QR code generation events
        if (event === 'qr_generated' && data && data.orderId) {
          const orderId = parseInt(data.orderId);
          // Update order with QR code information
          await storage.updateOrder(orderId, {
            hasQrCode: true,
            qrCodeGeneratedAt: new Date(),
            qrCodeData: data.qrData
          });
        }
        break;

      case 'printing_system':
        // Handle printing system events
        if (event === 'invoice_printed' && data && data.orderId) {
          const orderId = parseInt(data.orderId);
          // Update order with print information
          await storage.updateOrder(orderId, {
            invoicePrinted: true,
            printedAt: new Date()
          });
        }
        break;

      // Add more sources as needed

      default:
        console.log(`Unknown webhook source: ${source}`);
    }

    // Acknowledge receipt of webhook
    res.json({
      success: true,
      message: `Webhook received from ${source} for event ${event}`
    });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message || 'Failed to process webhook' });
  }
}

/**
 * Generate API key for external integrations
 */
export async function generateApiKey(req: Request, res: Response) {
  try {
    // Generate a secure API key
    const apiKey = 'jf_' + crypto.randomBytes(32).toString('hex');

    const keyInfo = {
      key: apiKey,
      name: 'Jay\'s Frames API Integration',
      permissions: ['orders:read', 'orders:write', 'integration:webhook'],
      createdAt: new Date().toISOString(),
      lastUsed: null
    };

    console.log('Generated API Key:', apiKey);

    res.json({
      success: true,
      ...keyInfo,
      message: 'API key generated successfully. Store this securely.',
      endpoints: {
        baseUrl: process.env.REPL_URL || 'https://your-repl-url.replit.dev',
        orders: '/api/integration/orders',
        webhook: '/api/integration/webhook',
        status: '/api/integration/status'
      },
      authentication: {
        method: 'Bearer Token',
        header: 'Authorization',
        value: `Bearer ${apiKey}`
      }
    });
  } catch (error: any) {
    console.error('Error generating API key:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate API key' 
    });
  }
}

export async function configureKanbanConnection(req: Request, res: Response) {
  try {
    const { kanbanApiUrl, kanbanApiKey } = req.body;

    if (!kanbanApiUrl || !kanbanApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Both kanbanApiUrl and kanbanApiKey are required'
      });
    }

    // Test the connection
    try {
      const testResponse = await fetch(`${kanbanApiUrl}/api/kanban/status`, {
        headers: {
          'Authorization': `Bearer ${kanbanApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (!testResponse.ok) {
        throw new Error(`Connection test failed: ${testResponse.status}`);
      }

      const testData = await testResponse.json();

      res.json({
        success: true,
        message: 'Kanban connection configured successfully',
        kanbanStatus: testData,
        configuration: {
          kanbanApiUrl,
          apiKeyConfigured: true
        }
      });

    } catch (connectionError: any) {
      res.status(400).json({
        success: false,
        error: `Failed to connect to Kanban app: ${connectionError.message}`
      });
    }

  } catch (error: any) {
    console.error('Error configuring Kanban connection:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to configure Kanban connection' 
    });
  }
}

/**
 * Get integration status and connection information
 */
export async function getIntegrationStatus(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      status: 'active',
      integrations: {
        webhooks: {
          enabled: true,
          endpointCount: 0
        },
        apiAccess: {
          enabled: true,
          lastGenerated: new Date().toISOString()
        }
      },
      endpoints: {
        baseUrl: process.env.REPL_URL || 'https://your-repl-url.replit.dev',
        orders: '/api/integration/orders',
        webhook: '/api/integration/webhook'
      }
    });
  } catch (error: any) {
    console.error('Error getting integration status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get integration status' 
    });
  }
}

/**
 * Get integration documentation
 */
export async function getIntegrationDocs(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      documentation: {
        authentication: {
          method: 'Bearer Token',
          header: 'Authorization',
          example: 'Authorization: Bearer YOUR_API_KEY'
        },
        endpoints: [
          {
            method: 'GET',
            path: '/api/integration/orders',
            description: 'Get all orders with QR codes',
            parameters: {
              status: 'optional - filter by order status',
              limit: 'optional - limit number of results'
            }
          },
          {
            method: 'GET',
            path: '/api/integration/orders/:id',
            description: 'Get specific order with QR code',
            parameters: {
              id: 'required - order ID'
            }
          },
          {
            method: 'PATCH',
            path: '/api/integration/orders/:id/status',
            description: 'Update order status',
            body: {
              status: 'required - new status',
              notes: 'optional - status change notes'
            }
          },
          {
            method: 'POST',
            path: '/api/integration/webhook',
            description: 'Receive webhook notifications',
            body: {
              source: 'required - webhook source',
              event: 'required - event type',
              data: 'optional - event data'
            }
          }
        ],
        webhookEvents: [
          'order.created',
          'order.updated',
          'order.completed',
          'payment.received',
          'qr.generated'
        ]
      }
    });
  } catch (error: any) {
    console.error('Error getting integration docs:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get integration documentation' 
    });
  }
}