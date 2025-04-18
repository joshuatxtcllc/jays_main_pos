/**
 * Inventory Schema
 * 
 * This file defines the schema for inventory-related tables using Drizzle ORM.
 */

import { pgTable, text, timestamp, pgEnum, uuid, numeric, boolean, integer, foreignKey, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enum definitions
export const inventoryItemTypeEnum = pgEnum('inventory_item_type', [
  'frame',
  'glass',
  'hardware',
  'tool',
  'mat',
  'backing',
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

export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', [
  'purchase',
  'sale',
  'adjustment',
  'return',
  'damage',
  'transfer'
]);

export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', [
  'draft',
  'pending',
  'ordered',
  'processing',
  'partial',
  'received',
  'cancelled'
]);

// Table definitions
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  type: inventoryItemTypeEnum('type').notNull(),
  description: text('description'),
  notes: text('notes'),
  taxExempt: boolean('tax_exempt').default(false).notNull(),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode'),
  reorderThreshold: integer('reorder_threshold').notNull(),
  reorderQuantity: integer('reorder_quantity').notNull(),
  unit: inventoryUnitEnum('unit').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  unitCost: numeric('unit_cost').notNull(),
  metadata: json('metadata'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  vendorId: uuid('vendor_id').references(() => vendors.id)
});

export const inventoryStock = pgTable('inventory_stock', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  inventoryItemId: uuid('inventory_item_id').notNull().references(() => inventoryItems.id),
  location: inventoryLocationEnum('location').notNull(),
  quantity: numeric('quantity').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  inventoryItemId: uuid('inventory_item_id').notNull().references(() => inventoryItems.id),
  type: inventoryTransactionTypeEnum('type').notNull(),
  quantity: numeric('quantity').notNull(),
  location: inventoryLocationEnum('location').notNull(),
  notes: text('notes'),
  reference: text('reference'),
  userId: uuid('user_id'),
  purchaseOrderId: uuid('purchase_order_id').references(() => purchaseOrders.id),
  sourceLocation: inventoryLocationEnum('source_location'),
  destinationLocation: inventoryLocationEnum('destination_location')
});

export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  website: text('website'),
  notes: text('notes'),
  status: text('status').default('active').notNull(),
  primaryType: inventoryItemTypeEnum('primary_type'),
  accountNumber: text('account_number'),
  metadata: json('metadata'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id),
  orderNumber: text('order_number').notNull().unique(),
  orderDate: timestamp('order_date').notNull(),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  status: purchaseOrderStatusEnum('status').default('draft').notNull(),
  notes: text('notes'),
  totalAmount: numeric('total_amount').notNull(),
  shippingCost: numeric('shipping_cost').default('0'),
  taxAmount: numeric('tax_amount').default('0'),
  discountAmount: numeric('discount_amount').default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: uuid('user_id'),
  receivedDate: timestamp('received_date'),
  cancelledDate: timestamp('cancelled_date'),
  paymentTerms: text('payment_terms'),
  shippingMethod: text('shipping_method'),
  trackingNumber: text('tracking_number')
});

export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  purchaseOrderId: uuid('purchase_order_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  inventoryItemId: uuid('inventory_item_id').notNull().references(() => inventoryItems.id),
  quantity: numeric('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  totalPrice: numeric('total_price').notNull(),
  receivedQuantity: numeric('received_quantity').default('0').notNull(),
  receivedDate: timestamp('received_date'),
  notes: text('notes'),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  status: text('status').default('pending').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const inventoryMaterialLinks = pgTable('inventory_material_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  inventoryItemId: uuid('inventory_item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  materialType: text('material_type').notNull(),
  materialId: text('material_id').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Zod schemas for validation and type inference
export const insertInventoryItemSchema = createInsertSchema(inventoryItems, {
  type: z.enum(['frame', 'glass', 'hardware', 'tool', 'mat', 'backing', 'other']),
  unit: z.enum(['feet', 'sheets', 'pieces', 'boxes', 'rolls', 'other']),
  reorderThreshold: z.number().positive(),
  reorderQuantity: z.number().positive(),
  unitPrice: z.string().or(z.number()).transform(val => String(val)),
  unitCost: z.string().or(z.number()).transform(val => String(val)),
  metadata: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertInventoryStockSchema = createInsertSchema(inventoryStock, {
  location: z.enum(['main_storage', 'workshop', 'display_area', 'offsite_storage', 'in_transit', 'supplier']),
  quantity: z.string().or(z.number()).transform(val => String(val)),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions, {
  type: z.enum(['purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer']),
  location: z.enum(['main_storage', 'workshop', 'display_area', 'offsite_storage', 'in_transit', 'supplier']),
  quantity: z.string().or(z.number()).transform(val => String(val)),
  sourceLocation: z.enum(['main_storage', 'workshop', 'display_area', 'offsite_storage', 'in_transit', 'supplier']).optional(),
  destinationLocation: z.enum(['main_storage', 'workshop', 'display_area', 'offsite_storage', 'in_transit', 'supplier']).optional(),
}).omit({ id: true, createdAt: true });

export const insertVendorSchema = createInsertSchema(vendors, {
  status: z.string().default('active'),
  primaryType: z.enum(['frame', 'glass', 'hardware', 'tool', 'mat', 'backing', 'other']).optional(),
  metadata: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders, {
  status: z.enum(['draft', 'pending', 'ordered', 'processing', 'partial', 'received', 'cancelled']).default('draft'),
  totalAmount: z.string().or(z.number()).transform(val => String(val)),
  shippingCost: z.string().or(z.number()).transform(val => String(val)).optional(),
  taxAmount: z.string().or(z.number()).transform(val => String(val)).optional(),
  discountAmount: z.string().or(z.number()).transform(val => String(val)).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, orderNumber: true });

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems, {
  quantity: z.string().or(z.number()).transform(val => String(val)),
  unitPrice: z.string().or(z.number()).transform(val => String(val)),
  totalPrice: z.string().or(z.number()).transform(val => String(val)),
  receivedQuantity: z.string().or(z.number()).transform(val => String(val)).optional(),
  status: z.string().default('pending'),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertInventoryMaterialLinkSchema = createInsertSchema(inventoryMaterialLinks, {
  materialType: z.string(),
  materialId: z.string(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// TypeScript types inferred from the schema
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

export type InventoryMaterialLink = typeof inventoryMaterialLinks.$inferSelect;
export type InsertInventoryMaterialLink = z.infer<typeof insertInventoryMaterialLinkSchema>;