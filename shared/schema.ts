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
});

export const insertFrameSchema = createInsertSchema(frames);
export type InsertFrame = z.infer<typeof insertFrameSchema>;
export type Frame = typeof frames.$inferSelect;

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
});

export const insertOrderGroupSchema = createInsertSchema(orderGroups).omit({ id: true, createdAt: true });
export type InsertOrderGroup = z.infer<typeof insertOrderGroupSchema>;
export type OrderGroup = typeof orderGroups.$inferSelect;

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
  subtotal: numeric("subtotal").notNull(),
  tax: numeric("tax").notNull(),
  total: numeric("total").notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  dueDate: timestamp("due_date"),
  artworkImage: text("artwork_image")
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
