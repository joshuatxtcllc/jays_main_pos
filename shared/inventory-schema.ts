import { pgTable, text, integer, numeric, uuid, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums for inventory types and statuses
export const inventoryTypeEnum = pgEnum('inventory_type', [
  'frame',
  'mat',
  'glass',
  'backing',
  'hardware',
  'tool',
  'other'
]);

export const inventoryUnitEnum = pgEnum('inventory_unit', [
  'feet',
  'sheets',
  'pieces',
  'boxes',
  'rolls',
  'other'
]);

export const inventoryLocationEnum = pgEnum('inventory_location', [
  'main_storage',
  'workshop',
  'display_area',
  'offsite_storage',
  'in_transit',
  'supplier'
]);

// Inventory items table
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  type: inventoryTypeEnum('type').notNull(),
  vendorId: text('vendor_id').references(() => vendors.id),
  materialId: text('material_id'), // Can be frameId, matColorId, etc.
  reorderThreshold: integer('reorder_threshold').notNull().default(5),
  reorderQuantity: integer('reorder_quantity').notNull().default(10),
  unit: inventoryUnitEnum('unit').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  unitCost: numeric('unit_cost').notNull(),
  taxExempt: boolean('tax_exempt').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Inventory stock levels table
export const inventoryStock = pgTable('inventory_stock', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryItemId: uuid('inventory_item_id').references(() => inventoryItems.id).notNull(),
  quantity: numeric('quantity').notNull().default('0'),
  location: inventoryLocationEnum('location').notNull().default('main_storage'),
  lotNumber: text('lot_number'),
  expiryDate: timestamp('expiry_date'),
  lastStockCheck: timestamp('last_stock_check'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Inventory transactions table
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryItemId: uuid('inventory_item_id').references(() => inventoryItems.id).notNull(),
  quantity: numeric('quantity').notNull(),
  type: text('type').notNull(), // purchase, sale, adjustment, transfer
  sourceLocationId: text('source_location_id'), // For transfers
  destinationLocationId: text('destination_location_id'), // For transfers
  orderId: integer('order_id'), // For sales
  materialOrderId: integer('material_order_id'), // For purchases
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: text('user_id') // Who performed the transaction
});

// Vendors table
export const vendors = pgTable('vendors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  website: text('website'),
  accountNumber: text('account_number'),
  paymentTerms: text('payment_terms'),
  preferredSupplier: boolean('preferred_supplier').default(false),
  active: boolean('active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Purchase orders table
export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  poNumber: text('po_number').notNull().unique(),
  vendorId: text('vendor_id').references(() => vendors.id).notNull(),
  orderDate: timestamp('order_date').defaultNow().notNull(),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  status: text('status').notNull().default('draft'), // draft, submitted, partially_received, received, cancelled
  totalAmount: numeric('total_amount').notNull().default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Purchase order items table
export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseOrderId: uuid('purchase_order_id').references(() => purchaseOrders.id).notNull(),
  inventoryItemId: uuid('inventory_item_id').references(() => inventoryItems.id).notNull(),
  quantity: numeric('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  totalPrice: numeric('total_price').notNull(),
  receivedQuantity: numeric('received_quantity').notNull().default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define schemas for Zod validation and TypeScript types
export const insertInventoryItemSchema = createInsertSchema(inventoryItems, {
  unitPrice: z.string(),
  unitCost: z.string(),
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  type: z.enum(['frame', 'mat', 'glass', 'backing', 'hardware', 'tool', 'other']),
  unit: z.enum(['feet', 'sheets', 'pieces', 'boxes', 'rolls', 'other']),
  reorderThreshold: z.number().min(0),
  reorderQuantity: z.number().min(1)
});

export const insertInventoryStockSchema = createInsertSchema(inventoryStock, {
  quantity: z.string(),
  location: z.enum(['main_storage', 'workshop', 'display_area', 'offsite_storage', 'in_transit', 'supplier'])
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions, {
  quantity: z.string(),
  type: z.string().min(1, "Transaction type is required")
});

export const insertVendorSchema = createInsertSchema(vendors, {
  name: z.string().min(1, "Vendor name is required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal(''))
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders, {
  poNumber: z.string().min(1, "PO number is required"),
  totalAmount: z.string(),
  status: z.string()
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems, {
  quantity: z.string(),
  unitPrice: z.string(),
  totalPrice: z.string(),
  receivedQuantity: z.string()
});

// TypeScript types
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type InventoryStock = typeof inventoryStock.$inferSelect;
export type InsertInventoryStock = z.infer<typeof insertInventoryStockSchema>;

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;