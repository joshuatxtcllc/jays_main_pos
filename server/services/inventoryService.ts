/**
 * Inventory Management Service
 * 
 * This service handles all inventory-related operations including:
 * - Inventory item management
 * - Stock level tracking
 * - Transaction recording
 * - Purchase order management
 * - Vendor management
 * - Low stock alerts
 */

import { db } from "../db";
import { log } from "../vite";
import { eq, and, gt, lt, like, desc, sql, inArray } from "drizzle-orm";
import { 
  inventoryItems, type InventoryItem, type InsertInventoryItem,
  inventoryStock, type InventoryStock, type InsertInventoryStock,
  inventoryTransactions, type InventoryTransaction, type InsertInventoryTransaction,
  vendors, type Vendor, type InsertVendor,
  purchaseOrders, type PurchaseOrder, type InsertPurchaseOrder,
  purchaseOrderItems, type PurchaseOrderItem, type InsertPurchaseOrderItem
} from "@shared/inventory-schema";
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all inventory items
 */
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  try {
    return await db.select().from(inventoryItems);
  } catch (error) {
    log(`Error getting inventory items: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Get inventory items with stock levels
 */
export async function getInventoryItemsWithStock(
  filters: {
    type?: string;
    location?: string;
    lowStock?: boolean;
    search?: string;
  } = {}
): Promise<(InventoryItem & { currentStock: number; stockDetails: InventoryStock[] })[]> {
  try {
    // Build the query
    let query = db.select({
      ...inventoryItems,
      stockDetails: sql<InventoryStock[]>`json_agg(${inventoryStock})`
    })
    .from(inventoryItems)
    .leftJoin(inventoryStock, eq(inventoryItems.id, inventoryStock.inventoryItemId))
    .groupBy(inventoryItems.id);

    // Apply filters
    if (filters.type) {
      query = query.where(eq(inventoryItems.type, filters.type));
    }
    
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        sql`${inventoryItems.name} ILIKE ${searchTerm} OR ${inventoryItems.sku} ILIKE ${searchTerm}`
      );
    }
    
    // Execute the query
    const results = await query;
    
    // Calculate the current stock and apply additional filters
    const itemsWithStock = results.map(item => {
      // Filter out null values and calculate total stock
      const validStockDetails = item.stockDetails.filter(stock => stock !== null);
      
      // Calculate total stock considering different locations
      let currentStock = 0;
      validStockDetails.forEach(stock => {
        if (stock && stock.quantity) {
          currentStock += Number(stock.quantity);
        }
      });
      
      return {
        ...item,
        currentStock,
        stockDetails: validStockDetails
      };
    });
    
    // Apply low stock filter if requested
    if (filters.lowStock) {
      return itemsWithStock.filter(item => 
        item.currentStock < Number(item.reorderThreshold)
      );
    }
    
    // Apply location filter if needed
    if (filters.location) {
      return itemsWithStock.filter(item => 
        item.stockDetails.some(stock => stock.location === filters.location)
      );
    }
    
    return itemsWithStock;
  } catch (error) {
    log(`Error getting inventory items with stock: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Get a single inventory item by ID
 */
export async function getInventoryItemById(id: string): Promise<(InventoryItem & { stock: InventoryStock[], transactions: InventoryTransaction[] }) | null> {
  try {
    const items = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    
    if (!items.length) {
      return null;
    }
    
    const stock = await db.select().from(inventoryStock).where(eq(inventoryStock.inventoryItemId, id));
    const transactions = await db.select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.inventoryItemId, id))
      .orderBy(desc(inventoryTransactions.createdAt))
      .limit(100);
    
    return {
      ...items[0],
      stock,
      transactions
    };
  } catch (error) {
    log(`Error getting inventory item by ID: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Create a new inventory item
 */
export async function createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
  try {
    // Generate a UUID for the new item
    const itemWithId = {
      ...item,
      id: uuidv4()
    };
    
    const [createdItem] = await db.insert(inventoryItems).values(itemWithId).returning();
    
    // Create initial stock entry if initial quantity is provided
    if (item.initialQuantity) {
      await db.insert(inventoryStock).values({
        id: uuidv4(),
        inventoryItemId: createdItem.id,
        quantity: item.initialQuantity.toString(),
        location: 'main_storage'
      });
      
      // Record initial transaction
      await db.insert(inventoryTransactions).values({
        id: uuidv4(),
        inventoryItemId: createdItem.id,
        quantity: item.initialQuantity.toString(),
        type: 'initial',
        notes: 'Initial inventory setup'
      });
    }
    
    return createdItem;
  } catch (error) {
    log(`Error creating inventory item: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Update an inventory item
 */
export async function updateInventoryItem(id: string, updates: Partial<InsertInventoryItem>): Promise<InventoryItem> {
  try {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    
    return updatedItem;
  } catch (error) {
    log(`Error updating inventory item: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    // First check if there are any non-zero stock entries
    const stockEntries = await db
      .select()
      .from(inventoryStock)
      .where(
        and(
          eq(inventoryStock.inventoryItemId, id),
          sql`${inventoryStock.quantity} > 0`
        )
      );
    
    if (stockEntries.length > 0) {
      throw new Error("Cannot delete inventory item with existing stock");
    }
    
    // Delete related stock entries
    await db
      .delete(inventoryStock)
      .where(eq(inventoryStock.inventoryItemId, id));
    
    // Delete related transactions
    await db
      .delete(inventoryTransactions)
      .where(eq(inventoryTransactions.inventoryItemId, id));
    
    // Delete the item
    await db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, id));
    
    return true;
  } catch (error) {
    log(`Error deleting inventory item: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Update stock level for an item
 */
export async function updateStockLevel(
  itemId: string, 
  quantity: number,
  location: string,
  transactionType: string,
  notes?: string,
  userId?: string
): Promise<boolean> {
  try {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Find existing stock entry for this location
      const existingStock = await tx
        .select()
        .from(inventoryStock)
        .where(
          and(
            eq(inventoryStock.inventoryItemId, itemId),
            eq(inventoryStock.location, location)
          )
        );
      
      // Update or create stock entry
      if (existingStock.length > 0) {
        // Calculate new quantity
        const currentQuantity = Number(existingStock[0].quantity);
        let newQuantity: number;
        
        if (transactionType === 'adjustment') {
          // For adjustments, set the exact quantity
          newQuantity = quantity;
        } else if (transactionType === 'purchase' || transactionType === 'transfer_in') {
          // For purchases and transfers in, add to current quantity
          newQuantity = currentQuantity + quantity;
        } else if (transactionType === 'sale' || transactionType === 'transfer_out') {
          // For sales and transfers out, subtract from current quantity
          newQuantity = currentQuantity - quantity;
          
          // Validate we're not going negative
          if (newQuantity < 0) {
            throw new Error(`Insufficient stock. Current: ${currentQuantity}, Requested: ${quantity}`);
          }
        } else {
          throw new Error(`Unknown transaction type: ${transactionType}`);
        }
        
        // Update stock
        await tx
          .update(inventoryStock)
          .set({
            quantity: newQuantity.toString(),
            lastStockCheck: new Date(),
            updatedAt: new Date()
          })
          .where(eq(inventoryStock.id, existingStock[0].id));
      } else {
        // Create new stock entry
        if (transactionType === 'sale' || transactionType === 'transfer_out') {
          throw new Error(`Cannot remove stock from non-existent location: ${location}`);
        }
        
        await tx.insert(inventoryStock).values({
          id: uuidv4(),
          inventoryItemId: itemId,
          quantity: quantity.toString(),
          location,
          lastStockCheck: new Date()
        });
      }
      
      // Record transaction
      await tx.insert(inventoryTransactions).values({
        id: uuidv4(),
        inventoryItemId: itemId,
        quantity: Math.abs(quantity).toString(), // Store absolute value of quantity
        type: transactionType,
        sourceLocationId: transactionType === 'transfer_out' ? location : undefined,
        destinationLocationId: transactionType === 'transfer_in' ? location : undefined,
        notes,
        userId
      });
      
      return true;
    });
  } catch (error) {
    log(`Error updating stock level: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Transfer stock between locations
 */
export async function transferStock(
  itemId: string,
  quantity: number,
  sourceLocation: string,
  destinationLocation: string,
  notes?: string,
  userId?: string
): Promise<boolean> {
  try {
    // Remove from source location
    await updateStockLevel(
      itemId,
      quantity,
      sourceLocation,
      'transfer_out',
      notes,
      userId
    );
    
    // Add to destination location
    await updateStockLevel(
      itemId,
      quantity,
      destinationLocation,
      'transfer_in',
      notes,
      userId
    );
    
    return true;
  } catch (error) {
    log(`Error transferring stock: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Get inventory transactions
 */
export async function getInventoryTransactions(
  filters: {
    itemId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<InventoryTransaction[]> {
  try {
    let query = db.select().from(inventoryTransactions);
    
    // Apply filters
    if (filters.itemId) {
      query = query.where(eq(inventoryTransactions.inventoryItemId, filters.itemId));
    }
    
    if (filters.type) {
      query = query.where(eq(inventoryTransactions.type, filters.type));
    }
    
    if (filters.startDate) {
      query = query.where(
        gt(inventoryTransactions.createdAt, filters.startDate)
      );
    }
    
    if (filters.endDate) {
      query = query.where(
        lt(inventoryTransactions.createdAt, filters.endDate)
      );
    }
    
    // Order by most recent first
    query = query.orderBy(desc(inventoryTransactions.createdAt));
    
    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  } catch (error) {
    log(`Error getting inventory transactions: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Get low stock alerts
 */
export async function getLowStockAlerts(): Promise<(InventoryItem & { currentStock: number })[]> {
  try {
    const results = await getInventoryItemsWithStock({ lowStock: true });
    return results;
  } catch (error) {
    log(`Error getting low stock alerts: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Vendor Management
 */

export async function getAllVendors(): Promise<Vendor[]> {
  try {
    return await db.select().from(vendors);
  } catch (error) {
    log(`Error getting vendors: ${error}`, "inventoryService");
    throw error;
  }
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  try {
    const result = await db.select().from(vendors).where(eq(vendors.id, id));
    return result.length ? result[0] : null;
  } catch (error) {
    log(`Error getting vendor by ID: ${error}`, "inventoryService");
    throw error;
  }
}

export async function createVendor(vendor: InsertVendor): Promise<Vendor> {
  try {
    // Generate a clean ID from the vendor name
    const vendorId = vendor.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const [createdVendor] = await db
      .insert(vendors)
      .values({ ...vendor, id: vendorId })
      .returning();
    
    return createdVendor;
  } catch (error) {
    log(`Error creating vendor: ${error}`, "inventoryService");
    throw error;
  }
}

export async function updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor> {
  try {
    const [updatedVendor] = await db
      .update(vendors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    
    return updatedVendor;
  } catch (error) {
    log(`Error updating vendor: ${error}`, "inventoryService");
    throw error;
  }
}

export async function deleteVendor(id: string): Promise<boolean> {
  try {
    // Check if vendor has associated inventory items
    const items = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.vendorId, id));
    
    if (items.length > 0) {
      throw new Error("Cannot delete vendor with associated inventory items");
    }
    
    // Check if vendor has associated purchase orders
    const orders = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.vendorId, id));
    
    if (orders.length > 0) {
      throw new Error("Cannot delete vendor with associated purchase orders");
    }
    
    // Delete the vendor
    await db.delete(vendors).where(eq(vendors.id, id));
    
    return true;
  } catch (error) {
    log(`Error deleting vendor: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Purchase Order Management
 */

export async function getAllPurchaseOrders(
  filters: {
    vendorId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<PurchaseOrder[]> {
  try {
    let query = db.select().from(purchaseOrders);
    
    // Apply filters
    if (filters.vendorId) {
      query = query.where(eq(purchaseOrders.vendorId, filters.vendorId));
    }
    
    if (filters.status) {
      query = query.where(eq(purchaseOrders.status, filters.status));
    }
    
    if (filters.startDate) {
      query = query.where(
        gt(purchaseOrders.orderDate, filters.startDate)
      );
    }
    
    if (filters.endDate) {
      query = query.where(
        lt(purchaseOrders.orderDate, filters.endDate)
      );
    }
    
    // Order by most recent first
    query = query.orderBy(desc(purchaseOrders.orderDate));
    
    return await query;
  } catch (error) {
    log(`Error getting purchase orders: ${error}`, "inventoryService");
    throw error;
  }
}

export async function getPurchaseOrderById(id: string): Promise<(PurchaseOrder & { items: PurchaseOrderItem[] }) | null> {
  try {
    const orders = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    
    if (!orders.length) {
      return null;
    }
    
    const items = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, id));
    
    return {
      ...orders[0],
      items
    };
  } catch (error) {
    log(`Error getting purchase order by ID: ${error}`, "inventoryService");
    throw error;
  }
}

export async function createPurchaseOrder(order: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder> {
  try {
    // Generate a UUID for the new order
    const orderId = uuidv4();
    
    // Create a PO number if not provided
    if (!order.poNumber) {
      const today = new Date();
      const year = today.getFullYear().toString().slice(2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      order.poNumber = `PO-${year}${month}${day}-${random}`;
    }
    
    // Calculate total amount from items
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );
    
    // Create the purchase order
    const [createdOrder] = await db
      .insert(purchaseOrders)
      .values({
        ...order,
        id: orderId,
        totalAmount: totalAmount.toString()
      })
      .returning();
    
    // Create purchase order items
    if (items.length > 0) {
      await db.insert(purchaseOrderItems).values(
        items.map(item => ({
          ...item,
          id: uuidv4(),
          purchaseOrderId: orderId
        }))
      );
    }
    
    return createdOrder;
  } catch (error) {
    log(`Error creating purchase order: ${error}`, "inventoryService");
    throw error;
  }
}

export async function updatePurchaseOrder(id: string, updates: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder> {
  try {
    const [updatedOrder] = await db
      .update(purchaseOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    
    return updatedOrder;
  } catch (error) {
    log(`Error updating purchase order: ${error}`, "inventoryService");
    throw error;
  }
}

export async function updatePurchaseOrderItem(id: string, updates: Partial<InsertPurchaseOrderItem>): Promise<PurchaseOrderItem> {
  try {
    const [updatedItem] = await db
      .update(purchaseOrderItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    
    // If we're updating received quantity, update the stock
    if (updates.receivedQuantity && Number(updates.receivedQuantity) > 0) {
      const item = await db
        .select()
        .from(purchaseOrderItems)
        .where(eq(purchaseOrderItems.id, id))
        .innerJoin(
          inventoryItems,
          eq(purchaseOrderItems.inventoryItemId, inventoryItems.id)
        );
      
      if (item.length > 0) {
        // Calculate the delta quantity that was just received
        const previousReceived = Number(updatedItem.receivedQuantity) - Number(updates.receivedQuantity);
        const delta = Number(updates.receivedQuantity) - previousReceived;
        
        if (delta > 0) {
          // Update stock level
          await updateStockLevel(
            updatedItem.inventoryItemId,
            delta,
            'main_storage',
            'purchase',
            `Received from PO ${updatedItem.purchaseOrderId}`
          );
          
          // Update order status if needed
          const orderItems = await db
            .select()
            .from(purchaseOrderItems)
            .where(eq(purchaseOrderItems.purchaseOrderId, updatedItem.purchaseOrderId));
          
          const allItemsReceived = orderItems.every(item => 
            Number(item.receivedQuantity) >= Number(item.quantity)
          );
          
          const someItemsReceived = orderItems.some(item =>
            Number(item.receivedQuantity) > 0
          );
          
          if (allItemsReceived) {
            await db
              .update(purchaseOrders)
              .set({ status: 'received' })
              .where(eq(purchaseOrders.id, updatedItem.purchaseOrderId));
          } else if (someItemsReceived) {
            await db
              .update(purchaseOrders)
              .set({ status: 'partially_received' })
              .where(eq(purchaseOrders.id, updatedItem.purchaseOrderId));
          }
        }
      }
    }
    
    return updatedItem;
  } catch (error) {
    log(`Error updating purchase order item: ${error}`, "inventoryService");
    throw error;
  }
}

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  try {
    // Check if order has received items
    const items = await db
      .select()
      .from(purchaseOrderItems)
      .where(
        and(
          eq(purchaseOrderItems.purchaseOrderId, id),
          sql`${purchaseOrderItems.receivedQuantity} > 0`
        )
      );
    
    if (items.length > 0) {
      throw new Error("Cannot delete purchase order with received items");
    }
    
    // Delete order items
    await db
      .delete(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, id));
    
    // Delete the order
    await db
      .delete(purchaseOrders)
      .where(eq(purchaseOrders.id, id));
    
    return true;
  } catch (error) {
    log(`Error deleting purchase order: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Utility Methods
 */

/**
 * Generate a reorder report based on low stock items
 */
export async function generateReorderReport(): Promise<{
  itemsToReorder: (InventoryItem & { currentStock: number; reorderAmount: number })[];
  suggestedPurchaseOrders: Record<string, {
    vendorId: string;
    vendorName: string;
    items: {
      itemId: string;
      sku: string;
      name: string;
      currentStock: number;
      reorderAmount: number;
      unitCost: string;
      totalCost: number;
    }[];
    totalCost: number;
  }>;
}> {
  try {
    // Get all items with low stock
    const lowStockItems = await getLowStockAlerts();
    
    // Calculate reorder amount for each item
    const itemsToReorder = lowStockItems.map(item => ({
      ...item,
      reorderAmount: Number(item.reorderQuantity)
    }));
    
    // Group by vendor
    const vendorGroups: Record<string, any> = {};
    
    for (const item of itemsToReorder) {
      const vendorId = item.vendorId || 'unknown';
      
      if (!vendorGroups[vendorId]) {
        const vendor = item.vendorId 
          ? await getVendorById(item.vendorId)
          : null;
        
        vendorGroups[vendorId] = {
          vendorId,
          vendorName: vendor ? vendor.name : 'Unknown Vendor',
          items: [],
          totalCost: 0
        };
      }
      
      const totalCost = Number(item.unitCost) * item.reorderAmount;
      
      vendorGroups[vendorId].items.push({
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        currentStock: item.currentStock,
        reorderAmount: item.reorderAmount,
        unitCost: item.unitCost,
        totalCost
      });
      
      vendorGroups[vendorId].totalCost += totalCost;
    }
    
    return {
      itemsToReorder,
      suggestedPurchaseOrders: vendorGroups
    };
  } catch (error) {
    log(`Error generating reorder report: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Get inventory valuation report
 */
export async function getInventoryValuation(): Promise<{
  totalValue: number;
  valueByType: Record<string, number>;
  valueByVendor: Record<string, number>;
  items: (InventoryItem & { 
    currentStock: number; 
    stockValue: number;
  })[];
}> {
  try {
    // Get all inventory items with stock
    const items = await getInventoryItemsWithStock();
    
    // Calculate values
    let totalValue = 0;
    const valueByType: Record<string, number> = {};
    const valueByVendor: Record<string, number> = {};
    
    const itemsWithValue = items.map(item => {
      const stockValue = item.currentStock * Number(item.unitCost);
      totalValue += stockValue;
      
      // Aggregate by type
      const type = item.type;
      valueByType[type] = (valueByType[type] || 0) + stockValue;
      
      // Aggregate by vendor
      const vendorId = item.vendorId || 'unknown';
      valueByVendor[vendorId] = (valueByVendor[vendorId] || 0) + stockValue;
      
      return {
        ...item,
        stockValue
      };
    });
    
    return {
      totalValue,
      valueByType,
      valueByVendor,
      items: itemsWithValue
    };
  } catch (error) {
    log(`Error generating inventory valuation: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Get inventory activity by date range
 */
export async function getInventoryActivity(
  startDate: Date,
  endDate: Date
): Promise<{
  totalTransactions: number;
  purchaseValue: number;
  saleValue: number;
  adjustmentValue: number;
  activityByDay: Record<string, {
    purchases: number;
    sales: number;
    adjustments: number;
  }>;
}> {
  try {
    // Get all transactions in the date range
    const transactions = await getInventoryTransactions({
      startDate,
      endDate
    });
    
    // Get associated inventory items for cost information
    const itemIds = [...new Set(transactions.map(t => t.inventoryItemId))];
    const inventoryItemsMap: Record<string, InventoryItem> = {};
    
    if (itemIds.length > 0) {
      const items = await db
        .select()
        .from(inventoryItems)
        .where(inArray(inventoryItems.id, itemIds));
        
      items.forEach(item => {
        inventoryItemsMap[item.id] = item;
      });
    }
    
    // Calculate values
    let purchaseValue = 0;
    let saleValue = 0;
    let adjustmentValue = 0;
    const activityByDay: Record<string, { purchases: number; sales: number; adjustments: number }> = {};
    
    for (const transaction of transactions) {
      const item = inventoryItemsMap[transaction.inventoryItemId];
      if (!item) continue;
      
      const quantity = Number(transaction.quantity);
      const value = quantity * Number(item.unitCost);
      
      // Group by day
      const day = transaction.createdAt.toISOString().split('T')[0];
      if (!activityByDay[day]) {
        activityByDay[day] = {
          purchases: 0,
          sales: 0,
          adjustments: 0
        };
      }
      
      // Categorize and sum values
      if (transaction.type === 'purchase' || transaction.type === 'transfer_in') {
        purchaseValue += value;
        activityByDay[day].purchases += value;
      } else if (transaction.type === 'sale' || transaction.type === 'transfer_out') {
        saleValue += value;
        activityByDay[day].sales += value;
      } else {
        adjustmentValue += value;
        activityByDay[day].adjustments += value;
      }
    }
    
    return {
      totalTransactions: transactions.length,
      purchaseValue,
      saleValue,
      adjustmentValue,
      activityByDay
    };
  } catch (error) {
    log(`Error getting inventory activity: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Create automatic purchase orders for low stock items
 */
export async function createAutomaticPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    // Generate reorder report
    const report = await generateReorderReport();
    
    // Create purchase orders for each vendor
    const createdOrders: PurchaseOrder[] = [];
    
    for (const [vendorId, poData] of Object.entries(report.suggestedPurchaseOrders)) {
      // Skip unknown vendors
      if (vendorId === 'unknown') continue;
      
      // Create PO data
      const poItems = poData.items.map(item => ({
        inventoryItemId: item.itemId,
        quantity: item.reorderAmount.toString(),
        unitPrice: item.unitCost,
        totalPrice: item.totalCost.toString(),
        receivedQuantity: '0'
      }));
      
      // Create the purchase order
      if (poItems.length > 0) {
        const po = await createPurchaseOrder(
          {
            vendorId,
            status: 'draft',
            totalAmount: poData.totalCost.toString(),
            notes: 'Automatically generated from low stock report'
          },
          poItems
        );
        
        createdOrders.push(po);
      }
    }
    
    return createdOrders;
  } catch (error) {
    log(`Error creating automatic purchase orders: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Link inventory items to frames, mats, glass, etc.
 */
export async function linkInventoryItemToMaterial(
  inventoryItemId: string,
  materialType: string,
  materialId: string
): Promise<boolean> {
  try {
    await db
      .update(inventoryItems)
      .set({ 
        materialId,
        updatedAt: new Date()
      })
      .where(eq(inventoryItems.id, inventoryItemId));
    
    return true;
  } catch (error) {
    log(`Error linking inventory item to material: ${error}`, "inventoryService");
    throw error;
  }
}

/**
 * Get inventory items for a specific material
 */
export async function getInventoryItemsByMaterial(
  materialType: string,
  materialId: string
): Promise<(InventoryItem & { currentStock: number })[]> {
  try {
    const items = await getInventoryItemsWithStock({
      type: materialType
    });
    
    return items.filter(item => item.materialId === materialId);
  } catch (error) {
    log(`Error getting inventory items by material: ${error}`, "inventoryService");
    throw error;
  }
}