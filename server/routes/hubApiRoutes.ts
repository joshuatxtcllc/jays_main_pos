
import { Router } from 'express';
import { storage } from '../storage';
import { verifyApiKey } from '../middleware/security';

const router = Router();

/**
 * @route GET /api/hub/orders
 * @desc Get all orders for hub synchronization
 * @access Protected by API key
 */
router.get('/orders', verifyApiKey, async (req, res) => {
  try {
    const orders = await storage.getAllOrders();
    
    // Transform orders to hub format
    const hubOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      artworkTitle: order.artworkTitle,
      artworkWidth: order.artworkWidth,
      artworkHeight: order.artworkHeight,
      frameId: order.frameId,
      matId: order.matId,
      glassType: order.glassType,
      productionStatus: order.productionStatus,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      scheduledDate: order.scheduledDate,
      qrCode: order.qrCode,
      notes: order.notes
    }));
    
    res.json({
      success: true,
      orders: hubOrders,
      count: hubOrders.length
    });
  } catch (error: any) {
    console.error('Error fetching orders for hub:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch orders' 
    });
  }
});

/**
 * @route GET /api/hub/orders/:id
 * @desc Get specific order for hub
 * @access Protected by API key
 */
router.get('/orders/:id', verifyApiKey, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order: {
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        artworkTitle: order.artworkTitle,
        artworkWidth: order.artworkWidth,
        artworkHeight: order.artworkHeight,
        frameId: order.frameId,
        matId: order.matId,
        glassType: order.glassType,
        productionStatus: order.productionStatus,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        scheduledDate: order.scheduledDate,
        qrCode: order.qrCode,
        notes: order.notes
      }
    });
  } catch (error: any) {
    console.error('Error fetching order for hub:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch order' 
    });
  }
});

/**
 * @route PATCH /api/hub/orders/:id/status
 * @desc Update order status from hub
 * @access Protected by API key
 */
router.patch('/orders/:id/status', verifyApiKey, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, notes } = req.body;
    
    const updatedOrder = await storage.updateOrder(orderId, { 
      productionStatus: status,
      notes: notes || undefined
    });
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('Error updating order status from hub:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update order status' 
    });
  }
});

/**
 * @route GET /api/hub/materials
 * @desc Get all material orders for hub
 * @access Protected by API key
 */
router.get('/materials', verifyApiKey, async (req, res) => {
  try {
    const materialOrders = await storage.getAllMaterialOrders();
    
    res.json({
      success: true,
      materialOrders: materialOrders,
      count: materialOrders.length
    });
  } catch (error: any) {
    console.error('Error fetching material orders for hub:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch material orders' 
    });
  }
});

/**
 * @route POST /api/hub/webhook
 * @desc Receive webhook notifications from hub
 * @access Protected by API key
 */
router.post('/webhook', verifyApiKey, async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Received hub webhook:', event, data);
    
    // Handle different webhook events
    switch (event) {
      case 'order.status_changed':
        if (data.orderId && data.status) {
          await storage.updateOrder(data.orderId, {
            productionStatus: data.status,
            notes: data.notes || undefined
          });
        }
        break;
      
      case 'material.status_changed':
        if (data.materialOrderId && data.status) {
          await storage.updateMaterialOrder(data.materialOrderId, {
            status: data.status,
            notes: data.notes || undefined
          });
        }
        break;
      
      default:
        console.log('Unknown webhook event:', event);
    }
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error: any) {
    console.error('Error processing hub webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process webhook' 
    });
  }
});

/**
 * @route GET /api/hub/status
 * @desc Get POS system status for hub
 * @access Protected by API key
 */
router.get('/status', verifyApiKey, async (req, res) => {
  try {
    const orders = await storage.getAllOrders();
    const materialOrders = await storage.getAllMaterialOrders();
    
    res.json({
      success: true,
      status: 'online',
      timestamp: new Date().toISOString(),
      stats: {
        totalOrders: orders.length,
        totalMaterialOrders: materialOrders.length,
        activeOrders: orders.filter(o => o.productionStatus !== 'completed').length
      }
    });
  } catch (error: any) {
    console.error('Error getting system status for hub:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get system status' 
    });
  }
});

export default router;
