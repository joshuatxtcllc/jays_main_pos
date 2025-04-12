import axios from 'axios';
import { MaterialOrder, MaterialOrderStatus } from '@shared/schema';

/**
 * Hub Integration Service
 * 
 * This service handles integration with Jays Frames Hub, enabling
 * data synchronization, material order management, and inventory updates.
 */

// Hub API configuration - these would come from environment variables in production
const HUB_API_URL = process.env.HUB_API_URL || 'https://api.jaysframeshub.com';
const HUB_API_KEY = process.env.HUB_API_KEY;

// Hub order result interfaces
interface HubOrderResult {
  success: boolean;
  hubOrderId?: string;
  trackingInfo?: string;
  estimatedDelivery?: string;
  error?: string;
}

interface SyncResult {
  orderId: number;
  hubOrderId?: string;
  status: 'success' | 'failed';
  error?: string;
}

// Create authenticated API client
const hubClient = axios.create({
  baseURL: HUB_API_URL,
  headers: {
    'Authorization': `Bearer ${HUB_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Sends a material order to Jays Frames Hub
 * @param materialOrder The material order to send
 * @returns The response from the Hub API including the Hub's order ID
 */
export async function sendMaterialOrderToHub(materialOrder: MaterialOrder): Promise<HubOrderResult> {
  try {
    // Transform our material order to the Hub's expected format
    const hubOrderPayload = {
      external_id: materialOrder.id.toString(),
      material_type: materialOrder.materialType,
      product_id: materialOrder.materialId, // Use materialId as the product ID
      quantity: materialOrder.quantity,
      unit_measurement: (materialOrder as any).unitMeasurement || 'united_inch', // Default to united inch
      status: mapStatusToHubFormat(materialOrder.status),
      customer_reference: (materialOrder as any).orderReference || `Order-${materialOrder.sourceOrderId || 'Unknown'}`,
      priority: materialOrder.priority || 'normal',
      requested_date: materialOrder.createdAt
    };
    
    const response = await hubClient.post('/v1/material-orders', hubOrderPayload);
    
    // Return the Hub's order response with their ID and tracking info
    return {
      success: true,
      hubOrderId: response.data.id,
      trackingInfo: response.data.tracking_info,
      estimatedDelivery: response.data.estimated_delivery
    };
  } catch (error: any) {
    console.error('Error sending material order to Hub:', error);
    return {
      success: false,
      error: error.message || 'Failed to send order to Jays Frames Hub'
    };
  }
}

/**
 * Updates a material order status in the Jays Frames Hub
 * @param materialOrderId The local material order ID
 * @param hubOrderId The Hub's order ID
 * @param status The new status
 * @returns Success indicator and updated order details
 */
export async function updateOrderStatusInHub(
  materialOrderId: number,
  hubOrderId: string,
  status: MaterialOrderStatus
) {
  try {
    const response = await hubClient.patch(`/v1/material-orders/${hubOrderId}`, {
      status: mapStatusToHubFormat(status),
      external_id: materialOrderId.toString()
    });
    
    return {
      success: true,
      updatedStatus: response.data.status,
      lastUpdated: response.data.updated_at
    };
  } catch (error: any) {
    console.error('Error updating order status in Hub:', error);
    return {
      success: false,
      error: error.message || 'Failed to update order status in Jays Frames Hub'
    };
  }
}

/**
 * Gets the latest status of an order from Jays Frames Hub
 * @param hubOrderId The Hub's order ID
 * @returns The latest order details from the Hub
 */
export async function getHubOrderStatus(hubOrderId: string) {
  try {
    const response = await hubClient.get(`/v1/material-orders/${hubOrderId}`);
    
    return {
      success: true,
      status: mapHubStatusToLocal(response.data.status),
      estimatedDelivery: response.data.estimated_delivery,
      trackingInfo: response.data.tracking_info,
      supplierNotes: response.data.supplier_notes,
      lastUpdated: response.data.updated_at
    };
  } catch (error: any) {
    console.error('Error fetching order from Hub:', error);
    return {
      success: false,
      error: error.message || 'Failed to get order details from Jays Frames Hub'
    };
  }
}

/**
 * Get inventory levels from Jays Frames Hub
 * @param productIds Optional array of product IDs to check
 * @returns Inventory levels for requested products
 */
export async function getInventoryLevels(productIds?: string[]) {
  try {
    let url = '/v1/inventory';
    if (productIds && productIds.length > 0) {
      url += `?product_ids=${productIds.join(',')}`;
    }
    
    const response = await hubClient.get(url);
    
    return {
      success: true,
      inventory: response.data.items
    };
  } catch (error: any) {
    console.error('Error fetching inventory from Hub:', error);
    return {
      success: false,
      error: error.message || 'Failed to get inventory from Jays Frames Hub'
    };
  }
}

/**
 * Synchronize all pending material orders with the Hub
 * @returns Summary of synchronization results
 */
export async function syncPendingOrders(pendingOrders: MaterialOrder[]) {
  const results = {
    total: pendingOrders.length,
    succeeded: 0,
    failed: 0,
    details: [] as SyncResult[]
  };
  
  for (const order of pendingOrders) {
    try {
      const result = await sendMaterialOrderToHub(order);
      if (result.success) {
        results.succeeded++;
        results.details.push({
          orderId: order.id,
          hubOrderId: result.hubOrderId,
          status: 'success'
        });
      } else {
        results.failed++;
        results.details.push({
          orderId: order.id,
          status: 'failed',
          error: result.error
        });
      }
    } catch (error: any) {
      results.failed++;
      results.details.push({
        orderId: order.id,
        status: 'failed',
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Maps our internal status to the Hub's status format
 * @param status Our internal MaterialOrderStatus
 * @returns The Hub's status equivalent
 */
function mapStatusToHubFormat(status: MaterialOrderStatus): string {
  const statusMap: Record<MaterialOrderStatus, string> = {
    pending: 'awaiting_processing',
    processed: 'processing',
    ordered: 'ordered',
    arrived: 'received',
    frame_cut: 'in_production',
    mat_cut: 'in_production',
    prepped: 'ready_for_assembly',
    completed: 'completed',
    delayed: 'delayed',
    canceled: 'canceled'
  };
  
  return statusMap[status] || 'awaiting_processing';
}

/**
 * Maps the Hub's status format to our internal status
 * @param hubStatus The Hub's status string
 * @returns Our internal MaterialOrderStatus
 */
function mapHubStatusToLocal(hubStatus: string): MaterialOrderStatus {
  const hubStatusMap: Record<string, MaterialOrderStatus> = {
    'awaiting_processing': 'pending',
    'processing': 'processed',
    'ordered': 'ordered',
    'shipped': 'ordered',
    'in_transit': 'ordered',
    'received': 'arrived',
    'in_production': 'frame_cut', // Default to frame_cut as first production step
    'ready_for_assembly': 'prepped',
    'completed': 'completed',
    'delayed': 'delayed',
    'canceled': 'canceled'
  };
  
  return hubStatusMap[hubStatus] || 'pending';
}