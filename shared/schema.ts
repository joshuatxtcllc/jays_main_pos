import { pgTable, text, serial, integer, boolean, numeric, timestamp, foreignKey, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customer model
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Frame model
export const frames = pgTable("frames", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  manufacturer: text("manufacturer").notNull(),
  material: text("material").notNull(),
  width: numeric("width").notNull(), // in inches
  depth: numeric("depth").notNull(), // in inches
  price: numeric("price").notNull(), // per foot (wholesale)
  catalogImage: text("catalog_image").notNull(),
  edgeTexture: text("edge_texture"),
  corner: text("corner")
  // color is added programmatically in storage.ts
});

export const insertFrameSchema = createInsertSchema(frames);
export type InsertFrame = z.infer<typeof insertFrameSchema>;

// Extend the Frame type to include the color property that's added programmatically in storage.ts
export type Frame = typeof frames.$inferSelect & {
  color?: string;
};

// Mat color model
export const matColors = pgTable("mat_colors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  price: numeric("price").notNull(), // per square inch (wholesale)
  manufacturer: text("manufacturer"),
  code: text("code"),
  description: text("description"),
  category: text("category")
});

export const insertMatColorSchema = createInsertSchema(matColors);
export type InsertMatColor = z.infer<typeof insertMatColorSchema>;
export type MatColor = typeof matColors.$inferSelect;

// Glass option model
export const glassOptions = pgTable("glass_options", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull() // per square inch (wholesale)
});

export const insertGlassOptionSchema = createInsertSchema(glassOptions);
export type InsertGlassOption = z.infer<typeof insertGlassOptionSchema>;
export type GlassOption = typeof glassOptions.$inferSelect;

// Special service model
export const specialServices = pgTable("special_services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull() // fixed price (wholesale)
});

export const insertSpecialServiceSchema = createInsertSchema(specialServices);
export type InsertSpecialService = z.infer<typeof insertSpecialServiceSchema>;
export type SpecialService = typeof specialServices.$inferSelect;

// Order Group model - for handling multiple orders in a single checkout
export const orderGroups = pgTable("order_groups", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  subtotal: numeric("subtotal"),
  tax: numeric("tax"),
  total: numeric("total"),
  status: text("status").notNull().default('open'),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripePaymentStatus: text("stripe_payment_status"),
  paymentDate: timestamp("payment_date"),
  discountAmount: numeric("discount_amount"),
  discountType: text("discount_type"), // 'percentage' or 'fixed'
  taxExempt: boolean("tax_exempt").default(false),
  cashAmount: numeric("cash_amount"),
  checkNumber: text("check_number"),
  invoiceEmailSent: boolean("invoice_email_sent").default(false),
  invoiceEmailDate: timestamp("invoice_email_date"),
});

export const insertOrderGroupSchema = createInsertSchema(orderGroups).omit({ id: true, createdAt: true });
export type InsertOrderGroup = z.infer<typeof insertOrderGroupSchema>;
export type OrderGroup = typeof orderGroups.$inferSelect;

// Production status for the Kanban board
export const productionStatuses = [
  "order_processed",
  "scheduled",
  "materials_ordered", 
  "materials_arrived", 
  "frame_cut", 
  "mat_cut", 
  "prepped", 
  "completed", 
  "delayed"
] as const;

export type ProductionStatus = typeof productionStatuses[number];

// Order model
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  orderGroupId: integer("order_group_id").references(() => orderGroups.id),
  frameId: text("frame_id").references(() => frames.id),
  matColorId: text("mat_color_id").references(() => matColors.id),
  glassOptionId: text("glass_option_id").references(() => glassOptions.id),
  artworkWidth: numeric("artwork_width").notNull(), // in inches
  artworkHeight: numeric("artwork_height").notNull(), // in inches
  matWidth: numeric("mat_width").notNull(), // in inches
  artworkDescription: text("artwork_description"),
  artworkType: text("artwork_type"),
  quantity: integer("quantity").notNull().default(1),
  subtotal: numeric("subtotal").notNull(),
  tax: numeric("tax").notNull(),
  total: numeric("total").notNull(),
  status: text("status").notNull().default('pending'), // Order payment status
  productionStatus: text("production_status").$type<ProductionStatus>().notNull().default('order_processed'), // Production workflow status
  previousStatus: text("previous_status").$type<ProductionStatus>(), // Used to track previous status, especially for delays
  createdAt: timestamp("created_at").defaultNow(),
  dueDate: timestamp("due_date"),
  artworkImage: text("artwork_image"),
  lastNotificationSent: timestamp("last_notification_sent"),
  estimatedCompletionDays: integer("estimated_completion_days"),
  addToWholesaleOrder: boolean("add_to_wholesale_order").default(false),
  lastStatusChange: timestamp("last_status_change").defaultNow(),
  notificationsEnabled: boolean("notifications_enabled").default(true)
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order special services junction table
export const orderSpecialServices = pgTable("order_special_services", {
  orderId: integer("order_id").references(() => orders.id),
  specialServiceId: text("special_service_id").references(() => specialServices.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.orderId, t.specialServiceId] })
}));

export const insertOrderSpecialServiceSchema = createInsertSchema(orderSpecialServices);
export type InsertOrderSpecialService = z.infer<typeof insertOrderSpecialServiceSchema>;
export type OrderSpecialService = typeof orderSpecialServices.$inferSelect;

// Wholesale order model
export const wholesaleOrders = pgTable("wholesale_orders", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  manufacturer: text("manufacturer").notNull(),
  items: jsonb("items").notNull(), // Array of items to order
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertWholesaleOrderSchema = createInsertSchema(wholesaleOrders).omit({ id: true, createdAt: true });
export type InsertWholesaleOrder = z.infer<typeof insertWholesaleOrderSchema>;
export type WholesaleOrder = typeof wholesaleOrders.$inferSelect;

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('employee')
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Larson Juhl catalog model for matboards
export const larsonJuhlCatalog = pgTable("larson_juhl_catalog", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hex_color: text("hex_color").notNull(),
  price: numeric("price", { precision: 10, scale: 6 }).notNull(),
  code: text("code").notNull(),
  crescent_code: text("crescent_code"),
  description: text("description"),
  category: text("category"),
  manufacturer: text("manufacturer").notNull()
});

export const insertLarsonJuhlCatalogSchema = createInsertSchema(larsonJuhlCatalog);
export type InsertLarsonJuhlCatalog = z.infer<typeof insertLarsonJuhlCatalogSchema>;
export type LarsonJuhlCatalog = typeof larsonJuhlCatalog.$inferSelect;

// Notification types
export const notificationTypes = [
  "status_update",
  "estimated_completion",
  "status_change",
  "due_date_update", 
  "completion_reminder", 
  "order_complete", 
  "payment_reminder",
  "delay_notification"
] as const;

export type NotificationType = typeof notificationTypes[number];

// Notification channels
export const notificationChannels = [
  "email",
  "sms",
  "both"
] as const;

export type NotificationChannel = typeof notificationChannels[number];

// Customer notifications model
export const customerNotifications = pgTable("customer_notifications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  orderId: integer("order_id").references(() => orders.id),
  notificationType: text("notification_type").$type<NotificationType>().notNull(),
  channel: text("channel").$type<NotificationChannel>().notNull().default('email'),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  successful: boolean("successful").notNull(),
  responseData: jsonb("response_data"),
  previousStatus: text("previous_status"),
  newStatus: text("new_status")
});

export const insertCustomerNotificationSchema = createInsertSchema(customerNotifications).omit({ id: true, sentAt: true });
export type InsertCustomerNotification = z.infer<typeof insertCustomerNotificationSchema>;
export type CustomerNotification = typeof customerNotifications.$inferSelect;

// Material order types
export const materialTypes = [
  "frame",
  "matboard",
  "glass",
  "backing_board",
  "hardware",
  "specialty_materials"
] as const;

export type MaterialType = typeof materialTypes[number];

// Material order status
export const materialOrderStatuses = [
  "pending",
  "processed",
  "ordered",
  "arrived",
  "frame_cut",
  "mat_cut",
  "prepped",
  "completed",
  "delayed",
  "canceled"
] as const;

export type MaterialOrderStatus = typeof materialOrderStatuses[number];

// Material orders model
export const materialOrders = pgTable("material_orders", {
  id: serial("id").primaryKey(),
  materialType: text("material_type").$type<MaterialType>().notNull(),
  materialId: text("material_id").notNull(), // frameId, matColorId, etc.
  materialName: text("material_name").notNull(),
  vendor: text("vendor"), // Vendor name (e.g., Larson, Nielsen)
  quantity: numeric("quantity").notNull(),
  status: text("status").$type<MaterialOrderStatus>().notNull().default('pending'),
  sourceOrderId: integer("source_order_id").references(() => orders.id),
  orderDate: timestamp("order_date"),
  expectedArrival: timestamp("expected_arrival"),
  actualArrival: timestamp("actual_arrival"),
  supplierName: text("supplier_name"),
  supplierOrderNumber: text("supplier_order_number"),
  notes: text("notes"),
  costPerUnit: numeric("cost_per_unit"),
  totalCost: numeric("total_cost"),
  priority: text("priority").default("normal"),
  // Hub integration fields
  hubOrderId: text("hub_order_id"),
  hubSyncStatus: text("hub_sync_status").default("not_synced"),
  hubLastSyncDate: timestamp("hub_last_sync_date"),
  hubTrackingInfo: text("hub_tracking_info"),
  hubEstimatedDelivery: timestamp("hub_estimated_delivery"),
  hubSupplierNotes: text("hub_supplier_notes"),
  orderReference: text("order_reference"), // Reference number for this order
  unitMeasurement: text("unit_measurement"), // e.g., "inches", "feet", "united_inch"
  createdAt: timestamp("created_at").defaultNow()
});

export const insertMaterialOrderSchema = createInsertSchema(materialOrders).omit({ 
  id: true, 
  createdAt: true,
  hubOrderId: true,
  hubSyncStatus: true,
  hubLastSyncDate: true,
  hubTrackingInfo: true,
  hubEstimatedDelivery: true,
  hubSupplierNotes: true
});
export type InsertMaterialOrder = z.infer<typeof insertMaterialOrderSchema>;
export type MaterialOrder = typeof materialOrders.$inferSelect;

// Advanced Inventory Management System

// Vendors/Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  website: text("website"),
  accountNumber: text("account_number"),
  notes: text("notes"),
  paymentTerms: text("payment_terms"),
  minimumOrderAmount: numeric("minimum_order_amount"),
  shippingPreference: text("shipping_preference"),
  leadTime: integer("lead_time"), // typical lead time in days
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastOrderDate: timestamp("last_order_date")
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Categories for inventory items
export const inventoryCategories = pgTable("inventory_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentCategoryId: integer("parent_category_id").references(() => inventoryCategories.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertInventoryCategorySchema = createInsertSchema(inventoryCategories).omit({ id: true, createdAt: true });
export type InsertInventoryCategory = z.infer<typeof insertInventoryCategorySchema>;
export type InventoryCategory = typeof inventoryCategories.$inferSelect;

// Location in the store/warehouse
export const inventoryLocations = pgTable("inventory_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Shelf A1", "Cabinet 3", etc.
  description: text("description"),
  type: text("type"), // e.g., "shelf", "drawer", "bin", etc.
  parentLocationId: integer("parent_location_id").references(() => inventoryLocations.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertInventoryLocationSchema = createInsertSchema(inventoryLocations).omit({ id: true, createdAt: true });
export type InsertInventoryLocation = z.infer<typeof insertInventoryLocationSchema>;
export type InventoryLocation = typeof inventoryLocations.$inferSelect;

// Units of measurement
export const measurementUnits = [
  "each", "inch", "foot", "united_inch", "square_inch", "sheet", "roll", "pound", "liter", "gallon"
] as const;

export type MeasurementUnit = typeof measurementUnits[number];

// Main inventory items table
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(), // Stock Keeping Unit - unique identifier
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => inventoryCategories.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  supplierSku: text("supplier_sku"), // Supplier's item number/SKU
  unitOfMeasure: text("unit_of_measure").$type<MeasurementUnit>().notNull(),
  costPerUnit: numeric("cost_per_unit").notNull(),
  retailPrice: numeric("retail_price"),
  minimumStockLevel: numeric("minimum_stock_level").notNull(),
  reorderLevel: numeric("reorder_level").notNull(), // when to reorder
  reorderQuantity: numeric("reorder_quantity"), // how much to reorder
  locationId: integer("location_id").references(() => inventoryLocations.id),
  barcode: text("barcode"),
  notes: text("notes"),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastCountDate: timestamp("last_count_date"),
  imageUrl: text("image_url"),
  dimensions: jsonb("dimensions"), // for items with dimensions (width, height, etc.)
  autoBatchReorder: boolean("auto_batch_reorder").default(false), // automatically add to batch orders
  materialType: text("material_type").$type<MaterialType>(), // for linking to existing material types
  materialId: text("material_id") // ID in source material table if applicable
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

// Inventory transactions
export const transactionTypes = [
  "purchase", "sale", "adjustment", "return", "transfer", "count", "scrap", "initial"
] as const;

export type TransactionType = typeof transactionTypes[number];

// Inventory transactions table
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => inventoryItems.id).notNull(),
  type: text("type").$type<TransactionType>().notNull(),
  quantity: numeric("quantity").notNull(),
  unitCost: numeric("unit_cost"),
  locationId: integer("location_id").references(() => inventoryLocations.id),
  relatedOrderId: integer("related_order_id").references(() => orders.id),
  notes: text("notes"),
  referenceNumber: text("reference_number"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id)
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

// Purchase orders
export const purchaseOrderStatuses = [
  "draft", "pending", "approved", "sent", "partially_received", "received", "canceled"
] as const;

export type PurchaseOrderStatus = typeof purchaseOrderStatuses[number];

// Purchase orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull(), // generated PO number
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  orderDate: timestamp("order_date").notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  status: text("status").$type<PurchaseOrderStatus>().default("draft").notNull(),
  subtotal: numeric("subtotal"),
  tax: numeric("tax"),
  shipping: numeric("shipping"),
  total: numeric("total"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  receivedDate: timestamp("received_date"),
  supplierOrderConfirmation: text("supplier_order_confirmation"),
  shippingMethod: text("shipping_method"),
  paymentMethod: text("payment_method"),
  paymentTerms: text("payment_terms"),
  tracking: text("tracking"),
  attachments: text("attachments").array()
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// Purchase order line items
export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  itemId: integer("item_id").references(() => inventoryItems.id).notNull(),
  quantity: numeric("quantity").notNull(),
  unitCost: numeric("unit_cost").notNull(),
  lineTotal: numeric("line_total").notNull(),
  receivedQuantity: numeric("received_quantity").default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertPurchaseOrderLineSchema = createInsertSchema(purchaseOrderLines).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertPurchaseOrderLine = z.infer<typeof insertPurchaseOrderLineSchema>;
export type PurchaseOrderLine = typeof purchaseOrderLines.$inferSelect;

// Inventory count records
export const inventoryCounts = pgTable("inventory_counts", {
  id: serial("id").primaryKey(),
  countReference: text("count_reference").notNull(), // e.g., "COUNT-2023-04-15"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("in_progress").notNull(), // "in_progress", "completed", "canceled"
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertInventoryCountSchema = createInsertSchema(inventoryCounts).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertInventoryCount = z.infer<typeof insertInventoryCountSchema>;
export type InventoryCount = typeof inventoryCounts.$inferSelect;

// Inventory count details
export const inventoryCountItems = pgTable("inventory_count_items", {
  id: serial("id").primaryKey(),
  countId: integer("count_id").references(() => inventoryCounts.id).notNull(),
  itemId: integer("item_id").references(() => inventoryItems.id).notNull(),
  locationId: integer("location_id").references(() => inventoryLocations.id),
  expectedQuantity: numeric("expected_quantity"), // expected based on system records
  actualQuantity: numeric("actual_quantity"), // actual counted quantity
  notes: text("notes"),
  countedBy: integer("counted_by").references(() => users.id),
  countedAt: timestamp("counted_at"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertInventoryCountItemSchema = createInsertSchema(inventoryCountItems).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertInventoryCountItem = z.infer<typeof insertInventoryCountItemSchema>;
export type InventoryCountItem = typeof inventoryCountItems.$inferSelect;
