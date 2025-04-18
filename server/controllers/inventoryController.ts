/**
 * Inventory Controller
 * 
 * Handles all inventory API endpoints including:
 * - Inventory items
 * - Stock management
 * - Transactions
 * - Vendors
 * - Purchase orders
 * - Reports
 */

import { Request, Response } from 'express';
import { log } from '../vite';
import * as inventoryService from '../services/inventoryService';
import { 
  insertInventoryItemSchema, 
  insertVendorSchema,
  insertPurchaseOrderSchema, 
  insertPurchaseOrderItemSchema 
} from '@shared/inventory-schema';
import { ZodError } from 'zod';

/**
 * Inventory Items Endpoints
 */

// Get all inventory items with optional filtering
export async function getInventoryItems(req: Request, res: Response) {
  try {
    const filters = {
      type: req.query.type as string,
      location: req.query.location as string,
      lowStock: req.query.lowStock === 'true',
      search: req.query.search as string
    };
    
    const items = await inventoryService.getInventoryItemsWithStock(filters);
    res.json(items);
  } catch (error) {
    log(`Error in getInventoryItems: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get inventory items' });
  }
}

// Get a single inventory item by ID
export async function getInventoryItem(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await inventoryService.getInventoryItemById(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json(item);
  } catch (error) {
    log(`Error in getInventoryItem: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get inventory item' });
  }
}

// Create a new inventory item
export async function createInventoryItem(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = insertInventoryItemSchema.parse(req.body);
    
    // Create the item
    const item = await inventoryService.createInventoryItem(validatedData);
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    log(`Error in createInventoryItem: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
}

// Update an inventory item
export async function updateInventoryItem(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validatedData = insertInventoryItemSchema.partial().parse(req.body);
    
    // Update the item
    const item = await inventoryService.updateInventoryItem(id, validatedData);
    res.json(item);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    log(`Error in updateInventoryItem: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
}

// Delete an inventory item
export async function deleteInventoryItem(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await inventoryService.deleteInventoryItem(id);
    res.status(204).send();
  } catch (error) {
    log(`Error in deleteInventoryItem: ${error}`, 'inventoryController');
    
    // Provide better error messages for specific cases
    if (error.message?.includes('existing stock')) {
      return res.status(400).json({
        error: 'Cannot delete inventory item with existing stock'
      });
    }
    
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
}

/**
 * Stock Management Endpoints
 */

// Update stock level for an item
export async function updateStockLevel(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { quantity, location, transactionType, notes, userId } = req.body;
    
    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Quantity must be a number' });
    }
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }
    
    if (!transactionType) {
      return res.status(400).json({ error: 'Transaction type is required' });
    }
    
    await inventoryService.updateStockLevel(
      id, 
      quantity, 
      location, 
      transactionType, 
      notes,
      userId
    );
    
    res.json({ success: true });
  } catch (error) {
    log(`Error in updateStockLevel: ${error}`, 'inventoryController');
    
    // Better error handling for specific cases
    if (error.message?.includes('Insufficient stock')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update stock level' });
  }
}

// Transfer stock between locations
export async function transferStock(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { quantity, sourceLocation, destinationLocation, notes, userId } = req.body;
    
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }
    
    if (!sourceLocation || !destinationLocation) {
      return res.status(400).json({ error: 'Source and destination locations are required' });
    }
    
    await inventoryService.transferStock(
      id,
      quantity,
      sourceLocation,
      destinationLocation,
      notes,
      userId
    );
    
    res.json({ success: true });
  } catch (error) {
    log(`Error in transferStock: ${error}`, 'inventoryController');
    
    if (error.message?.includes('Insufficient stock')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to transfer stock' });
  }
}

/**
 * Inventory Transactions Endpoints
 */

// Get inventory transactions with optional filtering
export async function getInventoryTransactions(req: Request, res: Response) {
  try {
    const filters = {
      itemId: req.query.itemId as string,
      type: req.query.type as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
    };
    
    const transactions = await inventoryService.getInventoryTransactions(filters);
    res.json(transactions);
  } catch (error) {
    log(`Error in getInventoryTransactions: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get inventory transactions' });
  }
}

/**
 * Vendor Management Endpoints
 */

// Get all vendors
export async function getVendors(req: Request, res: Response) {
  try {
    const vendors = await inventoryService.getAllVendors();
    res.json(vendors);
  } catch (error) {
    log(`Error in getVendors: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get vendors' });
  }
}

// Get a single vendor by ID
export async function getVendor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const vendor = await inventoryService.getVendorById(id);
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    log(`Error in getVendor: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get vendor' });
  }
}

// Create a new vendor
export async function createVendor(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = insertVendorSchema.parse(req.body);
    
    // Create the vendor
    const vendor = await inventoryService.createVendor(validatedData);
    res.status(201).json(vendor);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    log(`Error in createVendor: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to create vendor' });
  }
}

// Update a vendor
export async function updateVendor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validatedData = insertVendorSchema.partial().parse(req.body);
    
    // Update the vendor
    const vendor = await inventoryService.updateVendor(id, validatedData);
    res.json(vendor);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    log(`Error in updateVendor: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to update vendor' });
  }
}

// Delete a vendor
export async function deleteVendor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await inventoryService.deleteVendor(id);
    res.status(204).send();
  } catch (error) {
    log(`Error in deleteVendor: ${error}`, 'inventoryController');
    
    // Provide better error messages for specific cases
    if (error.message?.includes('associated inventory items')) {
      return res.status(400).json({
        error: 'Cannot delete vendor with associated inventory items'
      });
    }
    
    if (error.message?.includes('associated purchase orders')) {
      return res.status(400).json({
        error: 'Cannot delete vendor with associated purchase orders'
      });
    }
    
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
}

/**
 * Purchase Order Endpoints
 */

// Get all purchase orders with optional filtering
export async function getPurchaseOrders(req: Request, res: Response) {
  try {
    const filters = {
      vendorId: req.query.vendorId as string,
      status: req.query.status as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
    };
    
    const orders = await inventoryService.getAllPurchaseOrders(filters);
    res.json(orders);
  } catch (error) {
    log(`Error in getPurchaseOrders: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get purchase orders' });
  }
}

// Get a single purchase order by ID
export async function getPurchaseOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const order = await inventoryService.getPurchaseOrderById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    res.json(order);
  } catch (error) {
    log(`Error in getPurchaseOrder: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get purchase order' });
  }
}

// Create a new purchase order
export async function createPurchaseOrder(req: Request, res: Response) {
  try {
    // Validate request body
    const { order, items } = req.body;
    
    const validatedOrder = insertPurchaseOrderSchema.parse(order);
    const validatedItems = items.map((item: any) => 
      insertPurchaseOrderItemSchema.parse(item)
    );
    
    // Create the purchase order
    const createdOrder = await inventoryService.createPurchaseOrder(validatedOrder, validatedItems);
    res.status(201).json(createdOrder);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    log(`Error in createPurchaseOrder: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
}

// Update a purchase order
export async function updatePurchaseOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validatedData = insertPurchaseOrderSchema.partial().parse(req.body);
    
    // Update the purchase order
    const order = await inventoryService.updatePurchaseOrder(id, validatedData);
    res.json(order);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    log(`Error in updatePurchaseOrder: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
}

// Update a purchase order item (e.g., mark as received)
export async function updatePurchaseOrderItem(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validate request body
    const validatedData = insertPurchaseOrderItemSchema.partial().parse(req.body);
    
    // Update the purchase order item
    const item = await inventoryService.updatePurchaseOrderItem(id, validatedData);
    res.json(item);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    log(`Error in updatePurchaseOrderItem: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to update purchase order item' });
  }
}

// Delete a purchase order
export async function deletePurchaseOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await inventoryService.deletePurchaseOrder(id);
    res.status(204).send();
  } catch (error) {
    log(`Error in deletePurchaseOrder: ${error}`, 'inventoryController');
    
    // Provide better error messages for specific cases
    if (error.message?.includes('received items')) {
      return res.status(400).json({
        error: 'Cannot delete purchase order with received items'
      });
    }
    
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
}

/**
 * Report Endpoints
 */

// Get low stock alerts
export async function getLowStockAlerts(req: Request, res: Response) {
  try {
    const alerts = await inventoryService.getLowStockAlerts();
    res.json(alerts);
  } catch (error) {
    log(`Error in getLowStockAlerts: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get low stock alerts' });
  }
}

// Generate reorder report
export async function getReorderReport(req: Request, res: Response) {
  try {
    const report = await inventoryService.generateReorderReport();
    res.json(report);
  } catch (error) {
    log(`Error in getReorderReport: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to generate reorder report' });
  }
}

// Get inventory valuation
export async function getInventoryValuation(req: Request, res: Response) {
  try {
    const valuation = await inventoryService.getInventoryValuation();
    res.json(valuation);
  } catch (error) {
    log(`Error in getInventoryValuation: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get inventory valuation' });
  }
}

// Get inventory activity
export async function getInventoryActivity(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
      
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();
      
    const activity = await inventoryService.getInventoryActivity(startDate, endDate);
    res.json(activity);
  } catch (error) {
    log(`Error in getInventoryActivity: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get inventory activity' });
  }
}

// Create automatic purchase orders
export async function createAutomaticPurchaseOrders(req: Request, res: Response) {
  try {
    const orders = await inventoryService.createAutomaticPurchaseOrders();
    res.json(orders);
  } catch (error) {
    log(`Error in createAutomaticPurchaseOrders: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to create automatic purchase orders' });
  }
}

/**
 * Material Link Endpoints
 */

// Link inventory item to material
export async function linkInventoryItemToMaterial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { materialType, materialId } = req.body;
    
    if (!materialType || !materialId) {
      return res.status(400).json({ error: 'Material type and ID are required' });
    }
    
    await inventoryService.linkInventoryItemToMaterial(id, materialType, materialId);
    res.json({ success: true });
  } catch (error) {
    log(`Error in linkInventoryItemToMaterial: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to link inventory item to material' });
  }
}

// Get inventory items for a specific material
export async function getInventoryItemsByMaterial(req: Request, res: Response) {
  try {
    const { materialType, materialId } = req.params;
    
    const items = await inventoryService.getInventoryItemsByMaterial(materialType, materialId);
    res.json(items);
  } catch (error) {
    log(`Error in getInventoryItemsByMaterial: ${error}`, 'inventoryController');
    res.status(500).json({ error: 'Failed to get inventory items by material' });
  }
}