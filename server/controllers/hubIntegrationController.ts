import { Request, Response } from 'express';
import * as hubIntegrationService from '../services/hubIntegrationService';
import { storage } from '../storage';

/**
 * Hub Integration Controller
 * 
 * This controller handles API requests related to Jays Frames Hub integration.
 */

/**
 * Get all material orders with their hub sync status
 */
export async function getAllMaterialOrdersWithHubStatus(req: Request, res: Response) {
  try {
    const materialOrders = await storage.getAllMaterialOrders();
    
    // Return all orders with their hub status information
    res.json(materialOrders);
  } catch (error: any) {
    console.error('Error fetching material orders with hub status:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch material orders' });
  }
}

/**
 * Sync a material order with the Hub
 */
export async function syncMaterialOrderWithHub(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid material order ID' });
    }
    
    // Get the material order
    const materialOrder = await storage.getMaterialOrder(orderId);
    
    if (!materialOrder) {
      return res.status(404).json({ error: 'Material order not found' });
    }
    
    // Send the order to Jays Frames Hub
    const result = await hubIntegrationService.sendMaterialOrderToHub(materialOrder);
    
    if (result.success) {
      // Update the material order with Hub information
      const updatedOrder = await storage.updateMaterialOrder(orderId, {
        hubOrderId: result.hubOrderId,
        hubSyncStatus: 'synced',
        hubLastSyncDate: new Date().toISOString(),
        hubTrackingInfo: result.trackingInfo,
        hubEstimatedDelivery: result.estimatedDelivery
      });
      
      res.json({
        success: true,
        message: 'Material order synced with Jays Frames Hub',
        order: updatedOrder
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to sync material order with Jays Frames Hub',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Error syncing material order with Hub:', error);
    res.status(500).json({ error: error.message || 'Failed to sync material order' });
  }
}

/**
 * Sync multiple material orders with the Hub
 */
export async function syncMaterialOrdersWithHub(req: Request, res: Response) {
  try {
    // Get all pending orders
    const pendingOrders = await storage.getMaterialOrdersByStatus('pending');
    
    // Sync all pending orders with the Hub
    const syncResults = await hubIntegrationService.syncPendingOrders(pendingOrders);
    
    // Update each order's hub status based on the sync results
    for (const result of syncResults.details) {
      if (result.status === 'success' && result.hubOrderId) {
        await storage.updateMaterialOrder(result.orderId, {
          hubOrderId: result.hubOrderId,
          hubSyncStatus: 'synced',
          hubLastSyncDate: new Date().toISOString()
        });
      } else {
        await storage.updateMaterialOrder(result.orderId, {
          hubSyncStatus: 'failed',
          hubLastSyncDate: new Date().toISOString(),
          notes: (result.error ? `Sync failed: ${result.error}` : 'Sync failed with unknown error')
        });
      }
    }
    
    res.json({
      success: true,
      message: `Synced ${syncResults.succeeded} out of ${syncResults.total} material orders`,
      details: syncResults
    });
  } catch (error: any) {
    console.error('Error syncing material orders with Hub:', error);
    res.status(500).json({ error: error.message || 'Failed to sync material orders' });
  }
}

/**
 * Get Hub inventory levels
 */
export async function getHubInventoryLevels(req: Request, res: Response) {
  try {
    const { productIds } = req.query;
    
    // Parse product IDs if provided
    const productIdsArray = productIds 
      ? (Array.isArray(productIds) ? productIds as string[] : [productIds as string]) 
      : undefined;
    
    // Get inventory levels from the Hub
    const inventoryResult = await hubIntegrationService.getInventoryLevels(productIdsArray);
    
    if (inventoryResult.success) {
      res.json({
        success: true,
        inventory: inventoryResult.inventory
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory levels from Jays Frames Hub',
        error: inventoryResult.error
      });
    }
  } catch (error: any) {
    console.error('Error getting Hub inventory levels:', error);
    res.status(500).json({ error: error.message || 'Failed to get inventory levels' });
  }
}

/**
 * Get the status of a material order from the Hub
 */
export async function getHubOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid material order ID' });
    }
    
    // Get the material order
    const materialOrder = await storage.getMaterialOrder(orderId);
    
    if (!materialOrder) {
      return res.status(404).json({ error: 'Material order not found' });
    }
    
    // Check if the order has a Hub order ID
    if (!materialOrder.hubOrderId) {
      return res.status(400).json({ 
        error: 'Material order has not been synced with Jays Frames Hub yet',
        syncStatus: materialOrder.hubSyncStatus || 'not_synced'
      });
    }
    
    // Get the order status from the Hub
    const statusResult = await hubIntegrationService.getHubOrderStatus(materialOrder.hubOrderId);
    
    if (statusResult.success) {
      // Update the material order with the latest status from the Hub
      const updatedOrder = await storage.updateMaterialOrder(orderId, {
        status: statusResult.status,
        hubLastSyncDate: new Date().toISOString(),
        hubTrackingInfo: statusResult.trackingInfo,
        hubEstimatedDelivery: statusResult.estimatedDelivery,
        hubSupplierNotes: statusResult.supplierNotes
      });
      
      res.json({
        success: true,
        order: updatedOrder,
        hubStatus: statusResult
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get order status from Jays Frames Hub',
        error: statusResult.error
      });
    }
  } catch (error: any) {
    console.error('Error getting Hub order status:', error);
    res.status(500).json({ error: error.message || 'Failed to get order status' });
  }
}

/**
 * Update a material order status in both systems
 */
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid material order ID' });
    }
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Get the material order
    const materialOrder = await storage.getMaterialOrder(orderId);
    
    if (!materialOrder) {
      return res.status(404).json({ error: 'Material order not found' });
    }
    
    // Update the order status locally
    const updatedOrder = await storage.updateMaterialOrder(orderId, {
      status
    });
    
    // If the order has been synced with the Hub, update the status there too
    if (materialOrder.hubOrderId) {
      const hubUpdateResult = await hubIntegrationService.updateOrderStatusInHub(
        orderId,
        materialOrder.hubOrderId,
        status
      );
      
      if (!hubUpdateResult.success) {
        console.warn(`Failed to update order status in Hub: ${hubUpdateResult.error}`);
      }
    }
    
    res.json({
      success: true,
      message: 'Material order status updated',
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
}