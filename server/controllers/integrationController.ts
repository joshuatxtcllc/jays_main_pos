
import { Request, Response } from 'express';
import { storage } from '../storage';
import * as qrCodeController from './qrCodeController';

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
