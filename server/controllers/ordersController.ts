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