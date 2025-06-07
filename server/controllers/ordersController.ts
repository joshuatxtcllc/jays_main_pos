import { Request, Response } from 'express';
import { storage } from '../storage';
import axios from 'axios';

// Kanban app configuration
const KANBAN_API_URL = process.env.KANBAN_API_URL || 'https://kanban-app-url.replit.app';
const KANBAN_API_KEY = process.env.KANBAN_API_KEY;

async function fetchOrdersFromKanban() {
  try {
    if (!KANBAN_API_KEY) {
      console.log('No Kanban API key found, using local storage');
      return null;
    }

    const response = await axios.get(`${KANBAN_API_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${KANBAN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });

    if (response.data && response.data.success) {
      return response.data.orders;
    }
    return null;
  } catch (error: any) {
    console.error('Failed to fetch orders from Kanban app:', error.message);
    return null;
  }
}

export async function getAllOrders(req: Request, res: Response) {
  try {
    // Try to fetch from Kanban app first
    const kanbanOrders = await fetchOrdersFromKanban();

    if (kanbanOrders && kanbanOrders.length > 0) {
      console.log(`Fetched ${kanbanOrders.length} orders from Kanban app`);

      // Transform Kanban orders to our format
      const transformedOrders = kanbanOrders.map((order: any) => ({
        id: order.orderId || order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone || '',
        customerEmail: order.customerEmail || '',
        artworkTitle: order.artworkTitle,
        artworkWidth: order.frameSize ? parseFloat(order.frameSize.split('x')[0]) : order.artworkWidth,
        artworkHeight: order.frameSize ? parseFloat(order.frameSize.split('x')[1]) : order.artworkHeight,
        frameId: order.materials?.frameType || order.frameId,
        matId: order.materials?.matColor || order.matId,
        glassType: order.materials?.glass || order.glassType || 'Museum Glass',
        productionStatus: order.status || 'pending',
        stage: order.stage || 'material_prep',
        totalPrice: order.totalPrice || 0,
        createdAt: order.createdAt,
        scheduledDate: order.dueDate || order.scheduledDate,
        estimatedCompletion: order.estimatedCompletion,
        priority: order.priority || 'standard',
        qrCode: order.qrCode || '',
        notes: order.notes || ''
      }));

      res.json({ 
        success: true, 
        orders: transformedOrders,
        source: 'kanban',
        count: transformedOrders.length
      });
      return;
    }

    // Fallback to local storage
    console.log('Falling back to local storage for orders');
    const localOrders = await storage.getAllOrders();
    res.json({ 
      success: true, 
      orders: localOrders,
      source: 'local',
      count: localOrders.length
    });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch orders' 
    });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const order = await storage.getOrder(parseInt(id));
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      order 
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch order' 
    });
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const orderData = req.body;
    console.log('Creating order with data:', orderData);

    // Validate required fields
    if (!orderData.customerId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer ID is required' 
      });
    }

    if (!orderData.artworkImage) {
      return res.status(400).json({ 
        success: false, 
        error: 'Artwork image is required' 
      });
    }

    const order = await storage.createOrder(orderData);
    
    res.status(201).json({ 
      success: true, 
      order,
      message: 'Order created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create order' 
    });
  }
}

export async function updateOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const order = await storage.updateOrder(parseInt(id), updateData);
    
    res.json({ 
      success: true, 
      order,
      message: 'Order updated successfully' 
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update order' 
    });
  }
}

export async function deleteOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    await storage.deleteOrder(parseInt(id));
    
    res.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete order' 
    });
  }
}

export async function getAllOrderGroups(req: Request, res: Response) {
  try {
    const orderGroups = await storage.getAllOrderGroups();
    
    res.json({ 
      success: true, 
      orderGroups,
      count: orderGroups.length 
    });
  } catch (error: any) {
    console.error('Error fetching order groups:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch order groups' 
    });
  }
}

export async function createOrderGroup(req: Request, res: Response) {
  try {
    const orderGroupData = req.body;
    
    const orderGroup = await storage.createOrderGroup(orderGroupData);
    
    res.status(201).json({ 
      success: true, 
      orderGroup,
      message: 'Order group created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating order group:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create order group' 
    });
  }
}