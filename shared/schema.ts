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
  "needed",
  "pending",
  "ordered",
  "shipped",
  "received",
  "cancelled",
  "back_ordered"
] as const;

export type MaterialOrderStatus = typeof materialOrderStatuses[number];

// Material orders model
export const materialOrders = pgTable("material_orders", {
  id: serial("id").primaryKey(),
  materialType: text("material_type").$type<MaterialType>().notNull(),
  materialId: text("material_id").notNull(), // frameId, matColorId, etc.
  materialName: text("material_name").notNull(),
  quantity: numeric("quantity").notNull(),
  status: text("status").$type<MaterialOrderStatus>().notNull().default('needed'),
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
  createdAt: timestamp("created_at").defaultNow()
});

export const insertMaterialOrderSchema = createInsertSchema(materialOrders).omit({ id: true, createdAt: true });
export type InsertMaterialOrder = z.infer<typeof insertMaterialOrderSchema>;
export type MaterialOrder = typeof materialOrders.$inferSelect;
