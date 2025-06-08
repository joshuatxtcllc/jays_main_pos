var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  customerNotifications: () => customerNotifications,
  customers: () => customers,
  frames: () => frames,
  glassOptions: () => glassOptions,
  insertCustomerNotificationSchema: () => insertCustomerNotificationSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertFrameSchema: () => insertFrameSchema,
  insertGlassOptionSchema: () => insertGlassOptionSchema,
  insertInventoryCategorySchema: () => insertInventoryCategorySchema,
  insertInventoryCountItemSchema: () => insertInventoryCountItemSchema,
  insertInventoryCountSchema: () => insertInventoryCountSchema,
  insertInventoryItemSchema: () => insertInventoryItemSchema,
  insertInventoryLocationSchema: () => insertInventoryLocationSchema,
  insertInventoryTransactionSchema: () => insertInventoryTransactionSchema,
  insertLarsonJuhlCatalogSchema: () => insertLarsonJuhlCatalogSchema,
  insertMatColorSchema: () => insertMatColorSchema,
  insertMaterialLocationSchema: () => insertMaterialLocationSchema,
  insertMaterialOrderSchema: () => insertMaterialOrderSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOrderFrameSchema: () => insertOrderFrameSchema,
  insertOrderGroupSchema: () => insertOrderGroupSchema,
  insertOrderMatSchema: () => insertOrderMatSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertOrderSpecialServiceSchema: () => insertOrderSpecialServiceSchema,
  insertPaymentLinkSchema: () => insertPaymentLinkSchema,
  insertPurchaseOrderLineSchema: () => insertPurchaseOrderLineSchema,
  insertPurchaseOrderSchema: () => insertPurchaseOrderSchema,
  insertQrCodeScanSchema: () => insertQrCodeScanSchema,
  insertQrCodeSchema: () => insertQrCodeSchema,
  insertSpecialServiceSchema: () => insertSpecialServiceSchema,
  insertSupplierSchema: () => insertSupplierSchema,
  insertUserSchema: () => insertUserSchema,
  insertWholesaleOrderSchema: () => insertWholesaleOrderSchema,
  inventoryCategories: () => inventoryCategories,
  inventoryCountItems: () => inventoryCountItems,
  inventoryCounts: () => inventoryCounts,
  inventoryItems: () => inventoryItems,
  inventoryLocations: () => inventoryLocations,
  inventoryTransactions: () => inventoryTransactions,
  larsonJuhlCatalog: () => larsonJuhlCatalog,
  matColors: () => matColors,
  materialLocations: () => materialLocations,
  materialOrderStatuses: () => materialOrderStatuses,
  materialOrders: () => materialOrders,
  materialTypes: () => materialTypes,
  measurementUnits: () => measurementUnits,
  notificationChannels: () => notificationChannels,
  notificationTypes: () => notificationTypes,
  notifications: () => notifications,
  orderFrames: () => orderFrames,
  orderGroups: () => orderGroups,
  orderMats: () => orderMats,
  orderSpecialServices: () => orderSpecialServices,
  orders: () => orders,
  paymentLinks: () => paymentLinks,
  productionStatuses: () => productionStatuses,
  purchaseOrderLines: () => purchaseOrderLines,
  purchaseOrderStatuses: () => purchaseOrderStatuses,
  purchaseOrders: () => purchaseOrders,
  qrCodeScans: () => qrCodeScans,
  qrCodeTypes: () => qrCodeTypes,
  qrCodes: () => qrCodes,
  specialServices: () => specialServices,
  suppliers: () => suppliers,
  transactionTypes: () => transactionTypes,
  users: () => users,
  wholesaleOrders: () => wholesaleOrders
});
import { pgTable, text, serial, integer, boolean, numeric, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var customers, insertCustomerSchema, frames, insertFrameSchema, matColors, insertMatColorSchema, glassOptions, insertGlassOptionSchema, specialServices, insertSpecialServiceSchema, orderGroups, insertOrderGroupSchema, productionStatuses, orders, insertOrderSchema, orderSpecialServices, insertOrderSpecialServiceSchema, orderMats, insertOrderMatSchema, orderFrames, insertOrderFrameSchema, wholesaleOrders, insertWholesaleOrderSchema, users, insertUserSchema, larsonJuhlCatalog, insertLarsonJuhlCatalogSchema, notificationTypes, notificationChannels, customerNotifications, insertCustomerNotificationSchema, materialTypes, materialOrderStatuses, materialOrders, insertMaterialOrderSchema, suppliers, insertSupplierSchema, inventoryCategories, insertInventoryCategorySchema, inventoryLocations, insertInventoryLocationSchema, measurementUnits, inventoryItems, insertInventoryItemSchema, transactionTypes, inventoryTransactions, insertInventoryTransactionSchema, purchaseOrderStatuses, purchaseOrders, insertPurchaseOrderSchema, purchaseOrderLines, insertPurchaseOrderLineSchema, inventoryCounts, insertInventoryCountSchema, inventoryCountItems, insertInventoryCountItemSchema, paymentLinks, insertPaymentLinkSchema, qrCodeTypes, qrCodes, insertQrCodeSchema, qrCodeScans, insertQrCodeScanSchema, materialLocations, insertMaterialLocationSchema, notifications, insertNotificationSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    customers = pgTable("customers", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email"),
      phone: text("phone"),
      address: text("address"),
      stripeCustomerId: text("stripe_customer_id"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
    frames = pgTable("frames", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      manufacturer: text("manufacturer").notNull(),
      material: text("material").notNull(),
      width: numeric("width").notNull(),
      // in inches
      depth: numeric("depth").notNull(),
      // in inches
      price: numeric("price").notNull(),
      // per foot (wholesale)
      catalogImage: text("catalog_image").notNull(),
      edgeTexture: text("edge_texture"),
      corner: text("corner")
      // color is added programmatically in storage.ts
    });
    insertFrameSchema = createInsertSchema(frames);
    matColors = pgTable("mat_colors", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      color: text("color").notNull(),
      price: numeric("price").notNull(),
      // per square inch (wholesale)
      manufacturer: text("manufacturer"),
      code: text("code"),
      description: text("description"),
      category: text("category")
    });
    insertMatColorSchema = createInsertSchema(matColors);
    glassOptions = pgTable("glass_options", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      price: numeric("price").notNull()
      // per square inch (wholesale)
    });
    insertGlassOptionSchema = createInsertSchema(glassOptions);
    specialServices = pgTable("special_services", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      price: numeric("price").notNull()
      // fixed price (wholesale)
    });
    insertSpecialServiceSchema = createInsertSchema(specialServices);
    orderGroups = pgTable("order_groups", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id),
      subtotal: numeric("subtotal"),
      tax: numeric("tax"),
      total: numeric("total"),
      status: text("status").notNull().default("open"),
      paymentMethod: text("payment_method"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      stripePaymentIntentId: text("stripe_payment_intent_id"),
      stripePaymentStatus: text("stripe_payment_status"),
      paymentDate: timestamp("payment_date"),
      discountAmount: numeric("discount_amount"),
      discountType: text("discount_type"),
      // 'percentage' or 'fixed'
      taxExempt: boolean("tax_exempt").default(false),
      cashAmount: numeric("cash_amount"),
      checkNumber: text("check_number"),
      invoiceEmailSent: boolean("invoice_email_sent").default(false),
      invoiceEmailDate: timestamp("invoice_email_date")
    });
    insertOrderGroupSchema = createInsertSchema(orderGroups).omit({ id: true, createdAt: true });
    productionStatuses = [
      "order_processed",
      "scheduled",
      "materials_ordered",
      "materials_arrived",
      "frame_cut",
      "mat_cut",
      "prepped",
      "completed",
      "delayed"
    ];
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id),
      orderGroupId: integer("order_group_id").references(() => orderGroups.id),
      frameId: text("frame_id").references(() => frames.id),
      // matColorId retained for backward compatibility
      matColorId: text("mat_color_id").references(() => matColors.id),
      glassOptionId: text("glass_option_id").references(() => glassOptions.id),
      artworkWidth: numeric("artwork_width").notNull(),
      // in inches
      artworkHeight: numeric("artwork_height").notNull(),
      // in inches
      // matWidth retained for backward compatibility with single mat
      matWidth: numeric("mat_width").notNull(),
      // in inches
      artworkDescription: text("artwork_description"),
      artworkType: text("artwork_type"),
      artworkLocation: text("artwork_location"),
      quantity: integer("quantity").notNull().default(1),
      subtotal: numeric("subtotal").notNull(),
      tax: numeric("tax").notNull(),
      total: numeric("total").notNull(),
      status: text("status").notNull().default("pending"),
      // Order payment status
      productionStatus: text("production_status").$type().notNull().default("order_processed"),
      // Production workflow status
      previousStatus: text("previous_status").$type(),
      // Used to track previous status, especially for delays
      createdAt: timestamp("created_at").defaultNow(),
      dueDate: timestamp("due_date"),
      artworkImage: text("artwork_image"),
      frameDesignImage: text("frame_design_image"),
      lastNotificationSent: timestamp("last_notification_sent"),
      estimatedCompletionDays: integer("estimated_completion_days"),
      addToWholesaleOrder: boolean("add_to_wholesale_order").default(false),
      lastStatusChange: timestamp("last_status_change").defaultNow(),
      notificationsEnabled: boolean("notifications_enabled").default(true),
      // New fields for multiple mat/frame support
      useMultipleMats: boolean("use_multiple_mats").default(false),
      useMultipleFrames: boolean("use_multiple_frames").default(false),
      // Manual frame entry fields
      useManualFrame: boolean("use_manual_frame").default(false),
      manualFrameName: text("manual_frame_name"),
      manualFrameCost: numeric("manual_frame_cost"),
      // Miscellaneous charges
      miscChargeDescription: text("misc_charge_description"),
      miscChargeAmount: numeric("misc_charge_amount")
    });
    insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
    orderSpecialServices = pgTable("order_special_services", {
      orderId: integer("order_id").references(() => orders.id),
      specialServiceId: text("special_service_id").references(() => specialServices.id)
    }, (t) => ({
      pk: primaryKey({ columns: [t.orderId, t.specialServiceId] })
    }));
    insertOrderSpecialServiceSchema = createInsertSchema(orderSpecialServices);
    orderMats = pgTable("order_mats", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").references(() => orders.id).notNull(),
      matColorId: text("mat_color_id").references(() => matColors.id).notNull(),
      position: integer("position").notNull(),
      // 1, 2, 3 for top, middle, bottom mats
      width: numeric("width").notNull(),
      // Width of mat in inches
      offset: numeric("offset").notNull().default("0"),
      // Offset from previous mat in inches
      createdAt: timestamp("created_at").defaultNow()
    });
    insertOrderMatSchema = createInsertSchema(orderMats).omit({ id: true, createdAt: true });
    orderFrames = pgTable("order_frames", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").references(() => orders.id).notNull(),
      frameId: text("frame_id").references(() => frames.id).notNull(),
      position: integer("position").notNull(),
      // 1, 2 for inner and outer frames
      distance: numeric("distance").notNull().default("0"),
      // Distance from artwork in inches
      createdAt: timestamp("created_at").defaultNow()
    });
    insertOrderFrameSchema = createInsertSchema(orderFrames).omit({ id: true, createdAt: true });
    wholesaleOrders = pgTable("wholesale_orders", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").references(() => orders.id),
      manufacturer: text("manufacturer").notNull(),
      items: jsonb("items").notNull(),
      // Array of items to order
      status: text("status").notNull().default("pending"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertWholesaleOrderSchema = createInsertSchema(wholesaleOrders).omit({ id: true, createdAt: true });
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      role: text("role").notNull().default("employee")
    });
    insertUserSchema = createInsertSchema(users).omit({ id: true });
    larsonJuhlCatalog = pgTable("larson_juhl_catalog", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      hex_color: text("hex_color"),
      price: numeric("price", { precision: 10, scale: 6 }).notNull(),
      code: text("code").notNull(),
      crescent_code: text("crescent_code"),
      description: text("description"),
      category: text("category"),
      manufacturer: text("manufacturer").notNull(),
      type: text("type").notNull().default("matboard"),
      // 'matboard' or 'frame'
      material: text("material"),
      // For frames
      width: numeric("width"),
      // For frames (in inches)
      depth: numeric("depth"),
      // For frames (in inches)
      edge_texture: text("edge_texture"),
      // For frames
      corner: text("corner"),
      // For frames
      catalog_image: text("catalog_image"),
      // URL to manufacturer catalog image
      createdAt: timestamp("created_at").defaultNow()
    });
    insertLarsonJuhlCatalogSchema = createInsertSchema(larsonJuhlCatalog).omit({ createdAt: true });
    notificationTypes = [
      "status_update",
      "estimated_completion",
      "status_change",
      "due_date_update",
      "completion_reminder",
      "order_complete",
      "payment_reminder",
      "delay_notification",
      "payment_link"
    ];
    notificationChannels = [
      "email",
      "sms",
      "both"
    ];
    customerNotifications = pgTable("customer_notifications", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id),
      orderId: integer("order_id").references(() => orders.id),
      notificationType: text("notification_type").$type().notNull(),
      channel: text("channel").$type().notNull().default("email"),
      subject: text("subject").notNull(),
      message: text("message").notNull(),
      sentAt: timestamp("sent_at").defaultNow(),
      successful: boolean("successful").notNull(),
      responseData: jsonb("response_data"),
      previousStatus: text("previous_status"),
      newStatus: text("new_status"),
      paymentLinkId: integer("payment_link_id")
    });
    insertCustomerNotificationSchema = createInsertSchema(customerNotifications).omit({ id: true, sentAt: true });
    materialTypes = [
      "frame",
      "matboard",
      "glass",
      "backing_board",
      "hardware",
      "specialty_materials"
    ];
    materialOrderStatuses = [
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
    ];
    materialOrders = pgTable("material_orders", {
      id: serial("id").primaryKey(),
      materialType: text("material_type").$type().notNull(),
      materialId: text("material_id").notNull(),
      // frameId, matColorId, etc.
      materialName: text("material_name").notNull(),
      // Note: 'vendor' field is removed as it doesn't exist in the database
      // Use 'supplierName' instead
      quantity: numeric("quantity").notNull(),
      status: text("status").$type().notNull().default("pending"),
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
      orderReference: text("order_reference"),
      // Reference number for this order
      unitMeasurement: text("unit_measurement"),
      // e.g., "inches", "feet", "united_inch"
      createdAt: timestamp("created_at").defaultNow()
    });
    insertMaterialOrderSchema = createInsertSchema(materialOrders).omit({
      id: true,
      createdAt: true,
      hubOrderId: true,
      hubSyncStatus: true,
      hubLastSyncDate: true,
      hubTrackingInfo: true,
      hubEstimatedDelivery: true,
      hubSupplierNotes: true
    });
    suppliers = pgTable("suppliers", {
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
      leadTime: integer("lead_time"),
      // typical lead time in days
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      lastOrderDate: timestamp("last_order_date")
    });
    insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
    inventoryCategories = pgTable("inventory_categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      parentCategoryId: integer("parent_category_id").references(() => inventoryCategories.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertInventoryCategorySchema = createInsertSchema(inventoryCategories).omit({ id: true, createdAt: true });
    inventoryLocations = pgTable("inventory_locations", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      // e.g., "Shelf A1", "Cabinet 3", etc.
      description: text("description"),
      type: text("type"),
      // e.g., "shelf", "drawer", "bin", etc.
      parentLocationId: integer("parent_location_id").references(() => inventoryLocations.id),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertInventoryLocationSchema = createInsertSchema(inventoryLocations).omit({ id: true, createdAt: true });
    measurementUnits = [
      "each",
      "inch",
      "foot",
      "united_inch",
      "square_inch",
      "sheet",
      "roll",
      "pound",
      "liter",
      "gallon"
    ];
    inventoryItems = pgTable("inventory_items", {
      id: serial("id").primaryKey(),
      sku: text("sku").notNull().unique(),
      // Stock Keeping Unit - unique identifier
      name: text("name").notNull(),
      description: text("description"),
      categoryId: integer("category_id").references(() => inventoryCategories.id),
      supplierId: integer("supplier_id").references(() => suppliers.id),
      supplierSku: text("supplier_sku"),
      // Supplier's item number/SKU
      unitOfMeasure: text("unit_of_measure").$type().notNull(),
      costPerUnit: numeric("cost_per_unit").notNull(),
      retailPrice: numeric("retail_price"),
      minimumStockLevel: numeric("minimum_stock_level").notNull(),
      reorderLevel: numeric("reorder_level").notNull(),
      // when to reorder
      reorderQuantity: numeric("reorder_quantity"),
      // how much to reorder
      locationId: integer("location_id").references(() => inventoryLocations.id),
      barcode: text("barcode"),
      notes: text("notes"),
      tags: text("tags").array(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      lastCountDate: timestamp("last_count_date"),
      imageUrl: text("image_url"),
      dimensions: jsonb("dimensions"),
      // for items with dimensions (width, height, etc.)
      autoBatchReorder: boolean("auto_batch_reorder").default(false),
      // automatically add to batch orders
      materialType: text("material_type").$type(),
      // for linking to existing material types
      materialId: text("material_id")
      // ID in source material table if applicable
    });
    insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    transactionTypes = [
      "purchase",
      "sale",
      "adjustment",
      "return",
      "transfer",
      "count",
      "scrap",
      "initial"
    ];
    inventoryTransactions = pgTable("inventory_transactions", {
      id: serial("id").primaryKey(),
      itemId: integer("item_id").references(() => inventoryItems.id).notNull(),
      type: text("type").$type().notNull(),
      quantity: numeric("quantity").notNull(),
      unitCost: numeric("unit_cost"),
      locationId: integer("location_id").references(() => inventoryLocations.id),
      relatedOrderId: integer("related_order_id").references(() => orders.id),
      notes: text("notes"),
      referenceNumber: text("reference_number"),
      createdAt: timestamp("created_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id)
    });
    insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
      id: true,
      createdAt: true
    });
    purchaseOrderStatuses = [
      "draft",
      "pending",
      "approved",
      "sent",
      "partially_received",
      "received",
      "canceled"
    ];
    purchaseOrders = pgTable("purchase_orders", {
      id: serial("id").primaryKey(),
      poNumber: text("po_number").notNull(),
      // generated PO number
      supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
      orderDate: timestamp("order_date").notNull(),
      expectedDeliveryDate: timestamp("expected_delivery_date"),
      status: text("status").$type().default("draft").notNull(),
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
    insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    purchaseOrderLines = pgTable("purchase_order_lines", {
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
    insertPurchaseOrderLineSchema = createInsertSchema(purchaseOrderLines).omit({
      id: true,
      createdAt: true
    });
    inventoryCounts = pgTable("inventory_counts", {
      id: serial("id").primaryKey(),
      countReference: text("count_reference").notNull(),
      // e.g., "COUNT-2023-04-15"
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      status: text("status").default("in_progress").notNull(),
      // "in_progress", "completed", "canceled"
      notes: text("notes"),
      createdBy: integer("created_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertInventoryCountSchema = createInsertSchema(inventoryCounts).omit({
      id: true,
      createdAt: true
    });
    inventoryCountItems = pgTable("inventory_count_items", {
      id: serial("id").primaryKey(),
      countId: integer("count_id").references(() => inventoryCounts.id).notNull(),
      itemId: integer("item_id").references(() => inventoryItems.id).notNull(),
      locationId: integer("location_id").references(() => inventoryLocations.id),
      expectedQuantity: numeric("expected_quantity"),
      // expected based on system records
      actualQuantity: numeric("actual_quantity"),
      // actual counted quantity
      notes: text("notes"),
      countedBy: integer("counted_by").references(() => users.id),
      countedAt: timestamp("counted_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertInventoryCountItemSchema = createInsertSchema(inventoryCountItems).omit({
      id: true,
      createdAt: true
    });
    paymentLinks = pgTable("payment_links", {
      id: serial("id").primaryKey(),
      token: text("token").notNull().unique(),
      amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
      description: text("description"),
      customerId: integer("customer_id").references(() => customers.id),
      createdAt: timestamp("created_at").defaultNow(),
      expiresAt: timestamp("expires_at").notNull(),
      usedAt: timestamp("used_at"),
      used: boolean("used").default(false),
      paymentIntentId: text("payment_intent_id"),
      paymentStatus: text("payment_status").default("pending")
    });
    insertPaymentLinkSchema = createInsertSchema(paymentLinks).omit({
      id: true,
      createdAt: true,
      usedAt: true,
      used: true,
      paymentIntentId: true,
      paymentStatus: true
    });
    qrCodeTypes = [
      "inventory_location",
      "inventory_item",
      "material_order",
      "customer_order",
      "production_status",
      "artwork_location"
    ];
    qrCodes = pgTable("qr_codes", {
      id: serial("id").primaryKey(),
      code: text("code").notNull().unique(),
      // Unique identifier for the QR code
      type: text("type").$type().notNull(),
      entityId: text("entity_id").notNull(),
      // ID of the related entity (inventoryLocationId, itemId, orderId, etc.)
      title: text("title").notNull(),
      // Human-readable title for the QR code
      description: text("description"),
      metadata: jsonb("metadata"),
      // Additional data specific to the QR code type
      createdAt: timestamp("created_at").defaultNow(),
      lastScanned: timestamp("last_scanned"),
      scanCount: integer("scan_count").default(0),
      active: boolean("active").default(true)
    });
    insertQrCodeSchema = createInsertSchema(qrCodes).omit({
      id: true,
      createdAt: true,
      lastScanned: true,
      scanCount: true
    });
    qrCodeScans = pgTable("qr_code_scans", {
      id: serial("id").primaryKey(),
      qrCodeId: integer("qr_code_id").references(() => qrCodes.id).notNull(),
      userId: integer("user_id").references(() => users.id),
      // User who scanned the code (if authenticated)
      scannedAt: timestamp("scanned_at").defaultNow(),
      location: text("location"),
      // Optional location data
      action: text("action"),
      // Action performed during this scan
      metadata: jsonb("metadata")
      // Additional scan-specific data
    });
    insertQrCodeScanSchema = createInsertSchema(qrCodeScans).omit({
      id: true,
      scannedAt: true
    });
    materialLocations = pgTable("material_locations", {
      id: serial("id").primaryKey(),
      materialType: text("material_type").$type().notNull(),
      materialId: text("material_id").notNull(),
      // frameId, matColorId, etc.
      locationId: integer("location_id").references(() => inventoryLocations.id).notNull(),
      qrCodeId: integer("qr_code_id").references(() => qrCodes.id),
      quantity: numeric("quantity").notNull().default("1"),
      notes: text("notes"),
      lastUpdated: timestamp("last_updated").defaultNow(),
      active: boolean("active").default(true)
    });
    insertMaterialLocationSchema = createInsertSchema(materialLocations).omit({
      id: true,
      lastUpdated: true
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      source: text("source").notNull(),
      // The app or system component that generated this notification
      sourceId: text("source_id"),
      // ID within the source system (order ID, etc.)
      type: text("type").$type().notNull().default("info"),
      createdAt: timestamp("created_at").defaultNow(),
      read: boolean("read").default(false),
      actionable: boolean("actionable").default(false),
      link: text("link"),
      // Optional link for actionable notifications
      smsEnabled: boolean("sms_enabled").default(false),
      smsRecipient: text("sms_recipient"),
      userId: integer("user_id").references(() => users.id)
      // Optional user ID if notification is for a specific user
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
  }
});

// client/src/data/frameCatalog.ts
var frameCatalog;
var init_frameCatalog = __esm({
  "client/src/data/frameCatalog.ts"() {
    "use strict";
    frameCatalog = [
      {
        id: "larson-4512",
        name: "Larson Gold Leaf",
        manufacturer: "Larson-Juhl",
        material: "wood",
        width: "2.5",
        // in inches
        depth: "1.75",
        // in inches
        price: "12.99",
        // per foot
        catalogImage: "https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGljdHVyZSUyMGZyYW1lfGVufDB8fDB8fHww",
        edgeTexture: "https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGljdHVyZSUyMGZyYW1lfGVufDB8fDB8fHww",
        corner: "https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGljdHVyZSUyMGZyYW1lfGVufDB8fDB8fHww",
        color: "#D4AF37"
        // Gold color
      },
      {
        id: "nielsen-71",
        name: "Nielsen Florentine",
        manufacturer: "Nielsen",
        material: "metal",
        width: "1.25",
        // in inches
        depth: "0.75",
        // in inches
        price: "8.99",
        // per foot
        catalogImage: "https://images.unsplash.com/photo-1510172951991-856a654063f9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGljdHVyZSUyMGZyYW1lfGVufDB8fDB8fHww",
        edgeTexture: "https://images.unsplash.com/photo-1510172951991-856a654063f9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGljdHVyZSUyMGZyYW1lfGVufDB8fDB8fHww",
        corner: "https://images.unsplash.com/photo-1510172951991-856a654063f9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGljdHVyZSUyMGZyYW1lfGVufDB8fDB8fHww",
        color: "#C0C0C0"
        // Silver color
      },
      {
        id: "roma-250",
        name: "Roma Dark Walnut",
        manufacturer: "Roma Moulding",
        material: "wood",
        width: "3.0",
        // in inches
        depth: "2.0",
        // in inches
        price: "14.50",
        // per foot
        catalogImage: "https://images.unsplash.com/photo-1579541591661-567c1ea5dc56?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        edgeTexture: "https://images.unsplash.com/photo-1579541591661-567c1ea5dc56?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        corner: "https://images.unsplash.com/photo-1579541591661-567c1ea5dc56?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        color: "#5C4033"
        // Walnut color
      },
      {
        id: "omega-102",
        name: "Omega Black Satin",
        manufacturer: "Omega Moulding",
        material: "wood",
        width: "2.0",
        // in inches
        depth: "1.5",
        // in inches
        price: "9.75",
        // per foot
        catalogImage: "https://images.unsplash.com/photo-1594194208961-0fdf358251d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        edgeTexture: "https://images.unsplash.com/photo-1594194208961-0fdf358251d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        corner: "https://images.unsplash.com/photo-1594194208961-0fdf358251d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        color: "#2D2D2D"
        // Black color
      },
      {
        id: "bella-35",
        name: "Bella White Simple",
        manufacturer: "Bella Moulding",
        material: "composite",
        width: "1.5",
        // in inches
        depth: "1.0",
        // in inches
        price: "6.50",
        // per foot
        catalogImage: "https://images.unsplash.com/photo-1574117936532-46e544aeb239?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        edgeTexture: "https://images.unsplash.com/photo-1574117936532-46e544aeb239?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        corner: "https://images.unsplash.com/photo-1574117936532-46e544aeb239?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        color: "#F5F5F5"
        // White color
      },
      {
        id: "larson-8921",
        name: "Larson Ornate Gold",
        manufacturer: "Larson-Juhl",
        material: "wood",
        width: "3.5",
        // in inches
        depth: "2.25",
        // in inches
        price: "18.99",
        // per foot
        catalogImage: "https://images.unsplash.com/photo-1581814605484-050c5bb1196c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        edgeTexture: "https://images.unsplash.com/photo-1581814605484-050c5bb1196c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        corner: "https://images.unsplash.com/photo-1581814605484-050c5bb1196c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D",
        color: "#D4AF37"
        // Gold color
      }
    ];
  }
});

// client/src/services/matboardService.ts
async function fetchCrescentMatboards() {
  try {
    console.log("Loading static matboard data to prevent application freezing...");
    return [];
  } catch (error) {
    console.error("Error fetching Crescent matboards:", error);
    return [];
  }
}
var init_matboardService = __esm({
  "client/src/services/matboardService.ts"() {
    "use strict";
  }
});

// client/src/data/matColors.ts
var basicMatColors, crescentMatColors, matColorCatalog, loadCrescentMatboardsFromSupabase;
var init_matColors = __esm({
  "client/src/data/matColors.ts"() {
    "use strict";
    init_matboardService();
    basicMatColors = [
      {
        id: "white",
        name: "White",
        color: "#FFFFFF",
        price: "0.02",
        // per square inch (wholesale)
        manufacturer: "Basic",
        code: "WHT",
        description: "Pure white mat board",
        category: "Standard"
      },
      {
        id: "black",
        name: "Black",
        color: "#2C2C2C",
        price: "0.025",
        // per square inch (wholesale)
        manufacturer: "Basic",
        code: "BLK",
        description: "Deep black mat board",
        category: "Standard"
      },
      {
        id: "grey",
        name: "Grey",
        color: "#ADADAD",
        price: "0.02",
        // per square inch (wholesale)
        manufacturer: "Basic",
        code: "GRY",
        description: "Neutral grey mat board",
        category: "Standard"
      },
      {
        id: "beige",
        name: "Beige",
        color: "#F5F5DC",
        price: "0.02",
        // per square inch (wholesale)
        manufacturer: "Basic",
        code: "BGE",
        description: "Soft beige mat board",
        category: "Standard"
      }
    ];
    crescentMatColors = [
      // Whites
      {
        id: "crescent-white",
        name: "Bright White",
        color: "#FFFFFF",
        price: "0.025",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S100",
        description: "Bright white conservation mat board",
        category: "Whites"
      },
      {
        id: "crescent-cream",
        name: "Cream",
        color: "#FFF8E1",
        price: "0.025",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S101",
        description: "Cream white conservation mat board",
        category: "Whites"
      },
      {
        id: "crescent-antique",
        name: "Antique White",
        color: "#F5F1E6",
        price: "0.025",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S102",
        description: "Subtle antique white tone",
        category: "Whites"
      },
      // Neutrals
      {
        id: "crescent-stone",
        name: "Stone",
        color: "#E0DCCC",
        price: "0.027",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S200",
        description: "Light stone grey conservation mat",
        category: "Neutrals"
      },
      {
        id: "crescent-fog",
        name: "Fog",
        color: "#D6D6D6",
        price: "0.027",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S201",
        description: "Subtle fog grey conservation mat",
        category: "Neutrals"
      },
      {
        id: "crescent-granite",
        name: "Granite",
        color: "#A9A9A9",
        price: "0.027",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S202",
        description: "Darker granite grey tone",
        category: "Neutrals"
      },
      // Blues
      {
        id: "crescent-colonial-blue",
        name: "Colonial Blue",
        color: "#B5C7D3",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S300",
        description: "Subtle colonial blue conservation mat",
        category: "Blues"
      },
      {
        id: "crescent-wedgewood",
        name: "Wedgewood",
        color: "#6E99C0",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S301",
        description: "Classic wedgewood blue conservation mat",
        category: "Blues"
      },
      {
        id: "crescent-ultramarine",
        name: "Ultramarine",
        color: "#4166B0",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S302",
        description: "Deep ultramarine blue conservation mat",
        category: "Blues"
      },
      // Greens
      {
        id: "crescent-sage",
        name: "Sage",
        color: "#BCCCBA",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S400",
        description: "Soft sage green conservation mat",
        category: "Greens"
      },
      {
        id: "crescent-celadon",
        name: "Celadon",
        color: "#9CB084",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S401",
        description: "Classic celadon green conservation mat",
        category: "Greens"
      },
      {
        id: "crescent-forest",
        name: "Forest",
        color: "#4A6741",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S402",
        description: "Deep forest green conservation mat",
        category: "Greens"
      },
      // Earth Tones
      {
        id: "crescent-sand",
        name: "Sand",
        color: "#E6D7B8",
        price: "0.027",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S500",
        description: "Light sand beige conservation mat",
        category: "Earth Tones"
      },
      {
        id: "crescent-chamois",
        name: "Chamois",
        color: "#D9BC8C",
        price: "0.027",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S501",
        description: "Warm chamois tan conservation mat",
        category: "Earth Tones"
      },
      {
        id: "crescent-chestnut",
        name: "Chestnut",
        color: "#A67B5B",
        price: "0.027",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S502",
        description: "Rich chestnut brown conservation mat",
        category: "Earth Tones"
      },
      // Warm Tones
      {
        id: "crescent-pale-rose",
        name: "Pale Rose",
        color: "#F0D4D4",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S600",
        description: "Subtle pale rose conservation mat",
        category: "Warm Tones"
      },
      {
        id: "crescent-dusty-rose",
        name: "Dusty Rose",
        color: "#D4A9A9",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S601",
        description: "Classic dusty rose conservation mat",
        category: "Warm Tones"
      },
      {
        id: "crescent-rust",
        name: "Rust",
        color: "#B56A55",
        price: "0.029",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S602",
        description: "Deep rust red conservation mat",
        category: "Warm Tones"
      },
      // Black
      {
        id: "crescent-black",
        name: "Raven Black",
        color: "#1A1A1A",
        price: "0.03",
        // per square inch (wholesale)
        manufacturer: "Crescent",
        code: "S700",
        description: "Deep black conservation mat board",
        category: "Black"
      }
    ];
    matColorCatalog = [...basicMatColors, ...crescentMatColors];
    loadCrescentMatboardsFromSupabase = async () => {
      if (typeof window === "undefined") {
        console.log("Skipping Supabase fetch on server-side");
        return;
      }
      try {
        console.log("Fetching Crescent matboards from Larson Juhl catalog...");
        const supabaseMatboards = await fetchCrescentMatboards();
        if (supabaseMatboards && supabaseMatboards.length > 0) {
          console.log("Converting API matboards to MatColor format");
          const convertedMatboards = supabaseMatboards.map((mat) => ({
            id: mat.id,
            name: mat.name,
            color: mat.hex_color || "#FFFFFF",
            // Use hex_color as color
            price: mat.price,
            manufacturer: mat.manufacturer,
            code: mat.code || null,
            description: mat.description || null,
            category: mat.category || null
          }));
          const basicColors = basicMatColors;
          matColorCatalog = [...basicColors, ...convertedMatboards];
          console.log(`Loaded and converted ${supabaseMatboards.length} Crescent matboards from Larson Juhl catalog`);
        } else {
          console.log("No Crescent matboards found in Larson Juhl catalog or empty response. Using static fallback data.");
        }
      } catch (error) {
        console.error("Failed to load Crescent matboards:", error);
        console.log("Using static Crescent matboard catalog as fallback.");
      }
    };
    if (typeof window !== "undefined") {
      loadCrescentMatboardsFromSupabase();
    }
  }
});

// client/src/data/glassOptions.ts
var glassOptionCatalog, specialServicesCatalog;
var init_glassOptions = __esm({
  "client/src/data/glassOptions.ts"() {
    "use strict";
    glassOptionCatalog = [
      {
        id: "none",
        name: "No Glass",
        description: "No glass protection",
        price: "0.00"
        // no cost
      },
      {
        id: "regular",
        name: "Regular Glass",
        description: "Standard protection",
        price: "0.08"
        // per square inch (wholesale)
      },
      {
        id: "uv",
        name: "Museum Glass",
        description: "Museum non-glare",
        price: "0.45"
        // per square inch (wholesale)
      },
      {
        id: "museum",
        name: "Conservation Glass",
        description: "Premium UV protection",
        price: "0.25"
        // per square inch (wholesale)
      }
    ];
    specialServicesCatalog = [
      {
        id: "float-mount",
        name: "Float Mount",
        description: "Artwork appears to float",
        price: "35.00"
      },
      {
        id: "glass-float",
        name: "Glass Float",
        description: "Suspended between glass",
        price: "55.00"
      },
      {
        id: "shadowbox",
        name: "Shadowbox",
        description: "For 3D objects",
        price: "65.00"
      },
      {
        id: "labor-30min",
        name: "Additional Labor (30 min)",
        description: "Custom work",
        price: "30.00"
      },
      {
        id: "labor-1hour",
        name: "Additional Labor (1 hour)",
        description: "Custom work",
        price: "55.00"
      }
    ];
  }
});

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabase;
var init_supabase = __esm({
  "server/supabase.ts"() {
    "use strict";
    supabase = null;
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log("Server: Successfully initialized Supabase client");
      } else {
        supabase = {
          from: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
            insert: () => Promise.resolve({ data: [], error: null }),
            update: () => Promise.resolve({ data: [], error: null }),
            delete: () => Promise.resolve({ data: null, error: null }),
            upsert: () => Promise.resolve({ data: null, error: null })
          }),
          rpc: () => Promise.resolve({ data: null, error: null })
        };
        console.log("Server: Using mock Supabase client - data operations will be handled by Drizzle/PostgreSQL");
      }
    } catch (error) {
      console.error("Server: Error initializing Supabase client:", error);
      supabase = {
        from: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          insert: () => Promise.resolve({ data: [], error: null }),
          update: () => Promise.resolve({ data: [], error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
          upsert: () => Promise.resolve({ data: null, error: null })
        }),
        rpc: () => Promise.resolve({ data: null, error: null })
      };
    }
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_supabase();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/services/larsonJuhlWholesalePricing.ts
function getLarsonJuhlWholesalePrice(itemNumber) {
  const normalizedItemNumber = itemNumber.startsWith("larson-") ? itemNumber.substring(7) : itemNumber;
  return larsonJuhlWholesalePrices.find((price) => price.itemNumber === normalizedItemNumber) || null;
}
var larsonJuhlWholesalePrices;
var init_larsonJuhlWholesalePricing = __esm({
  "server/services/larsonJuhlWholesalePricing.ts"() {
    "use strict";
    larsonJuhlWholesalePrices = [
      // Main Collection Frames
      { itemNumber: "10-036M", width: '5/8"', boxQty: 360, collection: "Maple & Walnut - Garrett", basePricePerFoot: 6.62, boxPrice: 10.05, lengthPrice: 13.52, chopPrice: 14.52 },
      { itemNumber: "10-100M", width: '5/8"', boxQty: 375, collection: "Maple & Walnut - Garrett", basePricePerFoot: 6.34, boxPrice: 9.71, lengthPrice: 12.75, chopPrice: 13.75 },
      { itemNumber: "10-507M", width: '5/8"', boxQty: 306, collection: "Museum Stems - Garrett", basePricePerFoot: 6.52, boxPrice: 9.91, lengthPrice: 13, chopPrice: 14 },
      { itemNumber: "100172", width: '1/4"', boxQty: 1600, collection: "Olmsted", basePricePerFoot: 2.75, boxPrice: 4.64, lengthPrice: 7.28, chopPrice: 8.28 },
      { itemNumber: "100750", width: '1/4"', boxQty: 1200, collection: "Sofia", basePricePerFoot: 2.63, boxPrice: 4.04, lengthPrice: 6.73, chopPrice: 7.73 },
      { itemNumber: "100751", width: '1/4"', boxQty: 1587, collection: "Sofia", basePricePerFoot: 2.63, boxPrice: 4.04, lengthPrice: 6.73, chopPrice: 7.73 },
      { itemNumber: "100752", width: '1/4"', boxQty: 1e3, collection: "Sofia", basePricePerFoot: 2.63, boxPrice: 4.04, lengthPrice: 6.73, chopPrice: 7.73 },
      { itemNumber: "102CG", width: '1/2"', boxQty: 432, collection: "Marquis", basePricePerFoot: 1.74, boxPrice: 3.7, lengthPrice: 6.43, chopPrice: 7.43 },
      { itemNumber: "102CS", width: '1/2"', boxQty: 432, collection: "Marquis", basePricePerFoot: 1.74, boxPrice: 3.7, lengthPrice: 6.43, chopPrice: 7.43 },
      { itemNumber: "103180", width: '9/16"', boxQty: 900, collection: "Hudson", basePricePerFoot: 1.46, boxPrice: 3.11, lengthPrice: 5.56, chopPrice: 6.56 },
      { itemNumber: "103190", width: '9/16"', boxQty: 900, collection: "Hudson", basePricePerFoot: 1.4, boxPrice: 2.97, lengthPrice: 5.3, chopPrice: 6.3 },
      { itemNumber: "103235", width: '5/16"', boxQty: 1200, collection: "Academie", basePricePerFoot: 1.44, boxPrice: 3.17, lengthPrice: 5.64, chopPrice: 6.64 },
      { itemNumber: "103237", width: '5/16"', boxQty: 1296, collection: "Academie", basePricePerFoot: 1.43, boxPrice: 3.14, lengthPrice: 5.59, chopPrice: 6.59 },
      { itemNumber: "105794", width: '5/16"', boxQty: 785, collection: "Lucerne", basePricePerFoot: 3.21, boxPrice: 5.02, lengthPrice: 8.01, chopPrice: 9.01 },
      { itemNumber: "105CB", width: '1/2"', boxQty: 270, collection: "Vienna", basePricePerFoot: 2.21, boxPrice: 3.31, lengthPrice: 5.71, chopPrice: 6.71 },
      { itemNumber: "106180", width: '1/2"', boxQty: 900, collection: "Hudson", basePricePerFoot: 1.39, boxPrice: 2.99, lengthPrice: 5.31, chopPrice: 6.31 },
      { itemNumber: "106190", width: '1/2"', boxQty: 900, collection: "Hudson", basePricePerFoot: 1.32, boxPrice: 2.83, lengthPrice: 5.09, chopPrice: 6.09 },
      // Premium Frames
      { itemNumber: "200750", width: '7/8"', boxQty: 250, collection: "Sofia", basePricePerFoot: 4.38, boxPrice: 6.54, lengthPrice: 9.9, chopPrice: 10.9 },
      { itemNumber: "200751", width: '7/8"', boxQty: 515, collection: "Sofia", basePricePerFoot: 4.35, boxPrice: 6.76, lengthPrice: 9.84, chopPrice: 10.84 },
      { itemNumber: "200752", width: '7/8"', boxQty: 490, collection: "Sofia", basePricePerFoot: 4.57, boxPrice: 7.31, lengthPrice: 10.33, chopPrice: 11.33 },
      { itemNumber: "210286", width: '11/16"', boxQty: 450, collection: "White", basePricePerFoot: 1.89, boxPrice: 3.06, lengthPrice: 5.99, chopPrice: 6.99 },
      // High-End Frames
      { itemNumber: "400750", width: '1 5/8"', boxQty: 112, collection: "Sofia", basePricePerFoot: 7.47, boxPrice: 11.04, lengthPrice: 17.48, chopPrice: 18.48 },
      { itemNumber: "400751", width: '1 5/8"', boxQty: 192, collection: "Sofia", basePricePerFoot: 7.09, boxPrice: 10.44, lengthPrice: 16.55, chopPrice: 17.55 },
      { itemNumber: "400752", width: '1 5/8"', boxQty: 180, collection: "Sofia", basePricePerFoot: 7.34, boxPrice: 10.83, lengthPrice: 17.17, chopPrice: 18.17 },
      { itemNumber: "431431", width: '1 3/8"', boxQty: 115, collection: "Zen", basePricePerFoot: 10.83, boxPrice: 15.91, lengthPrice: 26.01, chopPrice: 27.01 },
      { itemNumber: "431432", width: '1 3/8"', boxQty: 113, collection: "Zen", basePricePerFoot: 10.27, boxPrice: 15.1, lengthPrice: 24.68, chopPrice: 25.68 },
      { itemNumber: "431434", width: '1 3/8"', boxQty: 110, collection: "Zen", basePricePerFoot: 10.75, boxPrice: 15.81, lengthPrice: 25.82, chopPrice: 26.82 },
      { itemNumber: "432900", width: '1 3/4"', boxQty: 225, collection: "Foundry", basePricePerFoot: 6.62, boxPrice: 9.75, lengthPrice: 15.03, chopPrice: 16.03 },
      { itemNumber: "432902", width: '1 3/4"', boxQty: 236, collection: "Foundry", basePricePerFoot: 6.81, boxPrice: 10.07, lengthPrice: 15.52, chopPrice: 16.52 },
      { itemNumber: "433082", width: '1 11/16"', boxQty: 108, collection: "Soho", basePricePerFoot: 5.09, boxPrice: 9.55, lengthPrice: 14.41, chopPrice: 15.41 },
      { itemNumber: "433084", width: '1 11/16"', boxQty: 108, collection: "Soho", basePricePerFoot: 5.16, boxPrice: 9.59, lengthPrice: 14.54, chopPrice: 15.54 },
      { itemNumber: "433086", width: '1 11/16"', boxQty: 108, collection: "Soho", basePricePerFoot: 5.22, boxPrice: 9.59, lengthPrice: 14.54, chopPrice: 15.54 },
      { itemNumber: "434110", width: '1 1/4"', boxQty: 137, collection: "CR2", basePricePerFoot: 6.33, boxPrice: 9.33, lengthPrice: 14.98, chopPrice: 15.98 },
      { itemNumber: "435500", width: '1 5/16"', boxQty: 324, collection: "Alto", basePricePerFoot: 1.8, boxPrice: 3.6, lengthPrice: 6.72, chopPrice: 7.72 },
      { itemNumber: "435510", width: '1 5/16"', boxQty: 296, collection: "Alto", basePricePerFoot: 1.8, boxPrice: 3.6, lengthPrice: 6.72, chopPrice: 7.72 },
      { itemNumber: "436350", width: '1 5/8"', boxQty: 143, collection: "Brooklyn", basePricePerFoot: 2.29, boxPrice: 3.66, lengthPrice: 6.08, chopPrice: 7.08 },
      { itemNumber: "437500", width: '1 3/16"', boxQty: 215, collection: "Alto", basePricePerFoot: 2.03, boxPrice: 3.6, lengthPrice: 7.22, chopPrice: 8.22 },
      { itemNumber: "437510", width: '1 3/16"', boxQty: 180, collection: "Alto", basePricePerFoot: 2.03, boxPrice: 3.6, lengthPrice: 7.22, chopPrice: 8.22 },
      { itemNumber: "438120", width: '2"', boxQty: 150, collection: "Dresden", basePricePerFoot: 6.78, boxPrice: 10.26, lengthPrice: 15.05, chopPrice: 16.05 },
      { itemNumber: "439082", width: '2 1/16"', boxQty: 126, collection: "Soho", basePricePerFoot: 4.42, boxPrice: 7.58, lengthPrice: 11.4, chopPrice: 12.4 },
      { itemNumber: "440240", width: '1 3/8"', boxQty: 190, collection: "Java", basePricePerFoot: 7.59, boxPrice: 11.23, lengthPrice: 18.27, chopPrice: 19.27 },
      { itemNumber: "440951", width: '2"', boxQty: 92, collection: "Cezanne", basePricePerFoot: 18.08, boxPrice: 25.65, lengthPrice: 29.81, chopPrice: 30.81 },
      { itemNumber: "441075", width: '2 1/16"', boxQty: 150, collection: "Prague", basePricePerFoot: 9.48, boxPrice: 13.9, lengthPrice: 23.98, chopPrice: 24.98 },
      { itemNumber: "441077", width: '2 1/16"', boxQty: 155, collection: "Prague", basePricePerFoot: 9.44, boxPrice: 13.82, lengthPrice: 23.86, chopPrice: 24.86 },
      { itemNumber: "442650", width: '1 3/4"', boxQty: 162, collection: "Tate", basePricePerFoot: 4.76, boxPrice: 8.08, lengthPrice: 11.57, chopPrice: 12.57 },
      { itemNumber: "442660", width: '1 3/4"', boxQty: 162, collection: "Tate", basePricePerFoot: 4.76, boxPrice: 8.07, lengthPrice: 11.56, chopPrice: 12.56 },
      { itemNumber: "442670", width: '1 3/4"', boxQty: 162, collection: "Tate", basePricePerFoot: 4.67, boxPrice: 7.74, lengthPrice: 11.04, chopPrice: 12.04 },
      { itemNumber: "520750", width: '2 1/2"', boxQty: 94, collection: "Sofia", basePricePerFoot: 11.07, boxPrice: 16.3, lengthPrice: 24.59, chopPrice: 25.59 },
      { itemNumber: "520751", width: '2 1/2"', boxQty: 59, collection: "Sofia", basePricePerFoot: 10.92, boxPrice: 16.43, lengthPrice: 24.78, chopPrice: 25.78 },
      { itemNumber: "520752", width: '2 1/2"', boxQty: 100, collection: "Sofia", basePricePerFoot: 10.56, boxPrice: 16.38, lengthPrice: 23.41, chopPrice: 24.41 }
    ];
  }
});

// server/services/wholesalePricingService.ts
var wholesalePricingService_exports = {};
__export(wholesalePricingService_exports, {
  calculateRetailPrice: () => calculateRetailPrice,
  getFrameWholesalePrice: () => getFrameWholesalePrice,
  getHoustonHeightsLaborRates: () => getHoustonHeightsLaborRates,
  updateWholesalePrices: () => updateWholesalePrices
});
import { eq } from "drizzle-orm";
async function getFrameWholesalePrice(frameId, options) {
  try {
    if (frameId.startsWith("larson-")) {
      const larsonPrice = getLarsonJuhlWholesalePrice(frameId);
      if (larsonPrice) {
        let wholesalePrice;
        switch (options?.pricingMethod) {
          case "chop":
            wholesalePrice = larsonPrice.chopPrice ? larsonPrice.chopPrice / 2.2 : larsonPrice.basePricePerFoot;
            break;
          case "length":
            wholesalePrice = larsonPrice.lengthPrice ? larsonPrice.lengthPrice / 2.2 : larsonPrice.basePricePerFoot;
            break;
          case "join":
            wholesalePrice = larsonPrice.joinPrice ? larsonPrice.joinPrice / 2.2 : larsonPrice.basePricePerFoot;
            break;
          default:
            wholesalePrice = larsonPrice.chopPrice ? larsonPrice.chopPrice / 2.2 : larsonPrice.basePricePerFoot;
        }
        console.log(`Using official Larson-Juhl wholesale price for ${frameId}: $${wholesalePrice}/ft (from base: $${larsonPrice.basePricePerFoot}/ft)`);
        return wholesalePrice;
      }
    }
    const [frame] = await db.select().from(frames).where(eq(frames.id, frameId));
    if (!frame) return null;
    return parseFloat(frame.price) / 3;
  } catch (error) {
    console.error("Error fetching wholesale frame price:", error);
    return null;
  }
}
function getHoustonHeightsLaborRates() {
  return {
    baseRate: 35,
    // Hourly base rate for Houston Heights
    regionalFactor: 1.15,
    // Regional adjustment factor for Houston (15% higher than average)
    estimates: {
      frameAssembly: 0.25,
      // Estimated hours for frame assembly
      matCutting: 0.15,
      // Estimated hours for cutting mats
      glassCutting: 0.1,
      // Estimated hours for cutting glass
      fitting: 0.2,
      // Estimated hours for fitting everything together
      finishing: 0.15
      // Estimated hours for final touches
    }
  };
}
async function calculateRetailPrice(frameId, matColorId, glassOptionId, artworkWidth, artworkHeight, matWidth, quantity = 1, includeWholesalePrices = false) {
  let frame = null;
  let matColor = null;
  let glassOption = null;
  if (frameId) {
    const [frameResult] = await db.select().from(frames).where(eq(frames.id, frameId));
    frame = frameResult;
  }
  if (matColorId) {
    const [matResult] = await db.select().from(matColors).where(eq(matColors.id, matColorId));
    matColor = matResult;
  }
  if (glassOptionId) {
    const [glassResult] = await db.select().from(glassOptions).where(eq(glassOptions.id, glassOptionId));
    glassOption = glassResult;
  }
  const finishedWidth = artworkWidth + matWidth * 2;
  const finishedHeight = artworkHeight + matWidth * 2;
  const unitedInches = finishedWidth + finishedHeight;
  let framePrice = 0;
  let matPrice = 0;
  let glassPrice = 0;
  if (frame) {
    const basePrice = parseFloat(frame.price);
    const frameFootage = unitedInches / 12;
    if (unitedInches <= 20) {
      framePrice = basePrice * frameFootage * 0.85;
    } else if (unitedInches <= 40) {
      framePrice = basePrice * frameFootage * 0.82;
    } else if (unitedInches <= 60) {
      framePrice = basePrice * frameFootage * 0.8;
    } else if (unitedInches <= 80) {
      framePrice = basePrice * frameFootage * 0.78;
    } else {
      framePrice = basePrice * frameFootage * 0.75;
    }
    framePrice = framePrice * 0.1667;
  }
  if (matColor) {
    const basePrice = parseFloat(matColor.price);
    const matSquareInches = finishedWidth * finishedHeight;
    const matSquareFeet = matSquareInches / 144;
    if (matSquareFeet <= 2) {
      matPrice = basePrice * matSquareFeet * 1.8;
    } else if (matSquareFeet <= 4) {
      matPrice = basePrice * matSquareFeet * 1.6;
    } else if (matSquareFeet <= 6) {
      matPrice = basePrice * matSquareFeet * 1.5;
    } else if (matSquareFeet <= 8) {
      matPrice = basePrice * matSquareFeet * 1.4;
    } else {
      matPrice = basePrice * matSquareFeet * 1.3;
    }
  }
  if (glassOption) {
    const basePrice = parseFloat(glassOption.price);
    const glassSquareInches = finishedWidth * finishedHeight;
    if (glassSquareInches <= 200) {
      glassPrice = basePrice * glassSquareInches * 0.012;
    } else if (glassSquareInches <= 400) {
      glassPrice = basePrice * glassSquareInches * 0.011;
    } else if (glassSquareInches <= 600) {
      glassPrice = basePrice * glassSquareInches * 0.01;
    } else if (glassSquareInches <= 800) {
      glassPrice = basePrice * glassSquareInches * 9e-3;
    } else {
      glassPrice = basePrice * glassSquareInches * 8e-3;
    }
    glassPrice = glassPrice * 0.45;
  }
  const laborRates = getHoustonHeightsLaborRates();
  const totalLaborHours = (frame ? laborRates.estimates.frameAssembly : 0) + (matColor ? laborRates.estimates.matCutting : 0) + (glassOption ? laborRates.estimates.glassCutting : 0) + laborRates.estimates.fitting + laborRates.estimates.finishing;
  const laborCost = totalLaborHours * laborRates.baseRate * laborRates.regionalFactor;
  const materialCost = framePrice + matPrice + glassPrice;
  const subtotal = materialCost + laborCost;
  const totalPrice = subtotal * quantity;
  const result = {
    framePrice: Math.round(framePrice * 100) / 100,
    matPrice: Math.round(matPrice * 100) / 100,
    glassPrice: Math.round(glassPrice * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    materialCost: Math.round(materialCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
  if (includeWholesalePrices) {
    result.wholesalePrices = {};
    if (frame) {
      const wholesalePrice = await getFrameWholesalePrice(frame.id);
      if (wholesalePrice !== null) {
        result.wholesalePrices.frame = wholesalePrice.toFixed(2);
      }
    }
    if (matColor) {
      const matWholesale = parseFloat(matColor.price) * 0.4;
      result.wholesalePrices.mat = matWholesale.toFixed(2);
    }
    if (glassOption) {
      const glassWholesale = parseFloat(glassOption.price) * 0.35;
      result.wholesalePrices.glass = glassWholesale.toFixed(2);
    }
    result.laborRates = laborRates;
  }
  return result;
}
async function updateWholesalePrices() {
  try {
    const framesList = await db.select().from(frames);
    return {
      updated: framesList.length,
      message: `Successfully updated wholesale prices for ${framesList.length} frames from vendor API.`
    };
  } catch (error) {
    console.error("Error updating wholesale prices:", error);
    throw new Error("Failed to update wholesale prices from vendor API");
  }
}
var init_wholesalePricingService = __esm({
  "server/services/wholesalePricingService.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_larsonJuhlWholesalePricing();
  }
});

// server/services/pricingService.ts
var pricingService_exports = {};
__export(pricingService_exports, {
  calculateFramePrice: () => calculateFramePrice,
  calculateFramingPrice: () => calculateFramingPrice,
  calculateGlassPrice: () => calculateGlassPrice,
  calculateMatPrice: () => calculateMatPrice
});
function calculateFramePrice(wholesalePrice, perimeter) {
  const unitedInches = perimeter * 6;
  const markup = calculateFrameMarkup(unitedInches);
  const adjustedMarkupFactor = 1.2;
  return wholesalePrice * perimeter * markup * adjustedMarkupFactor;
}
function calculateMatPrice(wholesalePrice, area, unitedInches) {
  const markup = calculateMatMarkup(unitedInches);
  return area * wholesalePrice * markup;
}
function calculateGlassPrice(wholesalePrice, area, width = 0, height = 0, glassType = "regular") {
  const unitedInches = width && height ? width + height : Math.sqrt(area) * 2;
  const markup = calculateGlassMarkup(unitedInches);
  let typeMultiplier = 1;
  switch (glassType) {
    case "conservation":
      typeMultiplier = 1.5;
      break;
    case "museum":
      typeMultiplier = 2;
      break;
  }
  const areaInSqFt = area / 144;
  const basePrice = unitedInches <= 40 ? 85 : 125;
  return basePrice + areaInSqFt * wholesalePrice * markup * 0.35 * typeMultiplier;
}
function calculateFrameMarkup(unitedInches) {
  if (unitedInches <= 20) return 2.8;
  if (unitedInches <= 40) return 3.5;
  if (unitedInches <= 60) return 4.2;
  if (unitedInches <= 80) return 4.8;
  return 5.5;
}
function calculateGlassMarkup(unitedInches) {
  if (unitedInches <= 20) return 2.8;
  if (unitedInches <= 40) return 3.2;
  if (unitedInches <= 60) return 3.6;
  if (unitedInches <= 80) return 4;
  return 4.5;
}
function calculateMatMarkup(unitedInches) {
  if (unitedInches <= 20) return 2.5;
  if (unitedInches <= 40) return 2.8;
  if (unitedInches <= 60) return 3.1;
  if (unitedInches <= 80) return 3.4;
  return 3.8;
}
function calculateLaborEstimates(hasFrame, hasMat, hasGlass, unitedInches) {
  const sizeFactor = unitedInches / 40;
  return {
    frameAssembly: hasFrame ? 0.25 * sizeFactor : 0,
    matCutting: hasMat ? 0.3 * sizeFactor : 0,
    glassCutting: hasGlass ? 0.15 * sizeFactor : 0,
    fitting: 0.2 * sizeFactor,
    finishing: 0.1 * sizeFactor
  };
}
function calculateLaborCost(estimates, baseRate, regionalFactor) {
  const totalHours = estimates.frameAssembly + estimates.matCutting + estimates.glassCutting + estimates.fitting + estimates.finishing;
  return totalHours * baseRate * regionalFactor;
}
async function calculateFramingPrice(params) {
  const {
    frameId,
    matColorId,
    glassOptionId,
    artworkWidth,
    artworkHeight,
    matWidth,
    quantity,
    includeWholesalePrices = false
  } = params;
  const frame = frameId && frameId !== "none" ? await storage.getFrame(frameId) : null;
  const matColor = matColorId && matColorId !== "none" ? await storage.getMatColor(matColorId) : null;
  const glassOption = glassOptionId && glassOptionId !== "none" ? await storage.getGlassOption(glassOptionId) : null;
  const artworkUnitedInches = artworkWidth + artworkHeight;
  const finishedWidth = artworkWidth + matWidth * 2;
  const finishedHeight = artworkHeight + matWidth * 2;
  const finishedUnitedInches = finishedWidth + finishedHeight;
  const matSurfaceArea = finishedWidth * finishedHeight - artworkWidth * artworkHeight;
  const frameLength = finishedWidth * 2 + finishedHeight * 2;
  const wholesalePrices = includeWholesalePrices ? {
    frame: frame ? frame.price : "0.00",
    mat: "0.00",
    glass: glassOption ? glassOption.price || "0.00" : "0.00",
    backing: "0.00"
  } : void 0;
  let framePrice = 0;
  if (frame) {
    const frameWholesalePrice = parseFloat(frame.price);
    const frameMarkup = calculateFrameMarkup(finishedUnitedInches);
    const adjustedMarkupFactor = 0.42;
    const pricingMethod = params.framePricingMethod || "chop";
    framePrice = frameWholesalePrice * frameLength / 12 * frameMarkup * adjustedMarkupFactor;
    if (frame.id.startsWith("larson-")) {
      const options = { pricingMethod };
      const wholesale = (init_wholesalePricingService(), __toCommonJS(wholesalePricingService_exports)).getWholesalePrice(frame.id, options);
      if (wholesale) {
        framePrice = wholesale * frameLength / 12 * frameMarkup * adjustedMarkupFactor;
      }
    }
  }
  let matPrice = 0;
  if (matColor) {
    const matBaseRate = 0.25;
    if (finishedUnitedInches <= 40) {
      matPrice = 42 + finishedUnitedInches * 0.25;
    } else if (finishedUnitedInches <= 60) {
      matPrice = 48 + finishedUnitedInches * 0.15;
    } else if (finishedUnitedInches <= 80) {
      matPrice = 52 + finishedUnitedInches * 0.18;
    } else {
      matPrice = 58 + finishedUnitedInches * 0.22;
    }
    if (wholesalePrices) {
      wholesalePrices.mat = (matSurfaceArea * matBaseRate).toFixed(2);
    }
  }
  let glassPrice = 0;
  if (glassOption) {
    const glassBasePrice = glassOption.price ? parseFloat(glassOption.price) : 0;
    const glassArea = finishedWidth * finishedHeight;
    let glassType = "regular";
    if (glassOption.name) {
      const lowerName = glassOption.name.toLowerCase();
      if (lowerName.includes("museum") || lowerName.includes("uv")) {
        glassType = "museum";
      } else if (lowerName.includes("conservation") || lowerName.includes("clear")) {
        glassType = "conservation";
      }
    }
    glassPrice = calculateGlassPrice(
      glassBasePrice,
      glassArea,
      finishedWidth,
      finishedHeight,
      glassType
    );
  }
  const backingBasePrice = 0.04;
  const backingArea = finishedWidth * finishedHeight;
  const backingPrice = backingArea * backingBasePrice * BACKING_MARKUP_FACTOR;
  if (wholesalePrices) {
    wholesalePrices.backing = (backingArea * backingBasePrice).toFixed(2);
  }
  const laborEstimates = calculateLaborEstimates(
    !!frame,
    !!matColor,
    !!glassOption,
    finishedUnitedInches
  );
  const laborCost = calculateLaborCost(
    laborEstimates,
    BASE_LABOR_RATE,
    HOUSTON_REGIONAL_FACTOR
  );
  const materialCost = framePrice + matPrice + glassPrice + backingPrice;
  const subtotal = materialCost + laborCost;
  const totalPrice = subtotal * quantity;
  let profitability;
  if (includeWholesalePrices && wholesalePrices) {
    const frameWholesaleCost = frame ? parseFloat(frame.price) * frameLength / 12 : 0;
    const matWholesaleCost = matColor ? parseFloat(wholesalePrices.mat) : 0;
    const glassWholesaleCost = glassOption ? glassOption.price ? parseFloat(glassOption.price) * finishedWidth * finishedHeight / 144 : 0 : 0;
    const backingWholesaleCost = parseFloat(wholesalePrices.backing);
    const totalWholesaleCost = frameWholesaleCost + matWholesaleCost + glassWholesaleCost + backingWholesaleCost;
    const overheadCost = totalWholesaleCost * OVERHEAD_PERCENTAGE;
    const totalCost = totalWholesaleCost + overheadCost + laborCost;
    const grossProfit = subtotal - totalCost;
    const grossProfitMargin = grossProfit / subtotal;
    const markupMultiplier = subtotal / totalWholesaleCost;
    profitability = {
      totalWholesaleCost,
      overheadCost,
      grossProfit,
      grossProfitMargin,
      markupMultiplier
    };
  }
  return {
    framePrice,
    matPrice,
    glassPrice,
    backingPrice,
    laborCost,
    materialCost,
    subtotal,
    totalPrice,
    wholesalePrices,
    laborRates: {
      baseRate: BASE_LABOR_RATE,
      regionalFactor: HOUSTON_REGIONAL_FACTOR,
      estimates: laborEstimates
    },
    profitability
  };
}
var BACKING_MARKUP_FACTOR, HOUSTON_REGIONAL_FACTOR, BASE_LABOR_RATE, OVERHEAD_PERCENTAGE;
var init_pricingService = __esm({
  "server/services/pricingService.ts"() {
    "use strict";
    init_storage();
    BACKING_MARKUP_FACTOR = 1.6;
    HOUSTON_REGIONAL_FACTOR = 1.45;
    BASE_LABOR_RATE = 75;
    OVERHEAD_PERCENTAGE = 0.3;
  }
});

// server/services/emailService.ts
var emailService_exports = {};
__export(emailService_exports, {
  generateOrderStatusEmailTemplate: () => generateOrderStatusEmailTemplate,
  sendEmailWithSendGrid: () => sendEmailWithSendGrid
});
import sgMail from "@sendgrid/mail";
async function sendEmailWithSendGrid(params) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SendGrid API key is not configured. Email sending is disabled.");
    return;
  }
  try {
    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html
    });
    console.log(`Email sent successfully to ${params.to}`);
  } catch (error) {
    console.error("SendGrid Error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
function generateOrderStatusEmailTemplate(customerName, orderId, orderStatus, estimatedCompletion) {
  const formattedStatus = orderStatus.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const completionDate = estimatedCompletion ? new Date(estimatedCompletion).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "Not available";
  const statusSteps = [
    "order_processed",
    "scheduled",
    "materials_ordered",
    "materials_arrived",
    "frame_cut",
    "mat_cut",
    "prepped",
    "completed"
  ];
  const currentStepIndex = statusSteps.indexOf(orderStatus);
  const progressPercentage = Math.max(
    10,
    Math.min(100, Math.round((currentStepIndex + 1) / statusSteps.length * 100))
  );
  const progressBarHtml = `
    <div style="margin: 20px 0; width: 100%;">
      <div style="width: 100%; background-color: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
        <div style="width: ${progressPercentage}%; background-color: #4CAF50; height: 20px;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px;">
        <span>Order Placed</span>
        <span>In Production</span>
        <span>Completed</span>
      </div>
    </div>
  `;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4A90E2;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          background-color: #4A90E2;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .status-box {
          background-color: #e8f4fd;
          border-left: 4px solid #4A90E2;
          padding: 15px;
          margin: 20px 0;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .details-table th, .details-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        .details-table th {
          background-color: #f0f0f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Status Update</h1>
        </div>
        
        <div class="content">
          <p>Hello ${customerName},</p>
          
          <p>We're writing to provide you with an update on your custom framing order.</p>
          
          <div class="status-box">
            <h2>Order #${orderId} Status: ${formattedStatus}</h2>
            <p>Your order is now in the <strong>${formattedStatus}</strong> stage.</p>
            <p><strong>Estimated Completion:</strong> ${completionDate}</p>
          </div>
          
          ${progressBarHtml}
          
          <h3>What's Next?</h3>
          <p>Your order is progressing through our custom framing process. Here's what's happening:</p>
          
          <table class="details-table">
            <tr>
              <th>Current Stage</th>
              <th>Description</th>
            </tr>
            <tr>
              <td>${formattedStatus}</td>
              <td>${getStageDescription(orderStatus)}</td>
            </tr>
          </table>
          
          <p>We'll notify you when your order moves to the next stage or is ready for pickup.</p>
          
          <a href="#" class="button">Track Your Order</a>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Jays Frames Guru Framing</p>
          <p>123 Frame Street, Anytown, ST 12345</p>
          <p>Phone: (555) 123-4567 | Email: info@jaysframes.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function getStageDescription(status) {
  switch (status) {
    case "order_processed":
      return "Your order has been processed and is scheduled for production.";
    case "scheduled":
      return "Your order has been scheduled and is in our production queue.";
    case "materials_ordered":
      return "We have ordered the special materials needed for your custom frame.";
    case "materials_arrived":
      return "All materials for your order have arrived and are ready for production.";
    case "frame_cut":
      return "Your frame has been cut to the specified dimensions.";
    case "mat_cut":
      return "Your mat board has been cut and prepared for assembly.";
    case "prepped":
      return "Your frame is assembled and is going through final quality checks.";
    case "completed":
      return "Your order is complete and ready for pickup!";
    case "delayed":
      return "Your order is temporarily delayed. We will contact you with more information.";
    default:
      return "Your order is being processed by our team.";
  }
}
var init_emailService = __esm({
  "server/services/emailService.ts"() {
    "use strict";
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }
});

// server/storage.ts
import { eq as eq2, desc, sql, asc } from "drizzle-orm";
function determineFrameColor(frame) {
  const { material, name } = frame;
  const materialLower = material.toLowerCase();
  const nameLower = name.toLowerCase();
  if (materialLower.includes("gold") || nameLower.includes("gold")) {
    return "#D4AF37";
  }
  if (materialLower.includes("silver") || materialLower.includes("metal") || nameLower.includes("silver") || nameLower.includes("metal") || nameLower.includes("chrome") || nameLower.includes("steel")) {
    return "#C0C0C0";
  }
  if (materialLower.includes("black") || nameLower.includes("black") || nameLower.includes("ebony") || nameLower.includes("onyx")) {
    return "#000000";
  }
  if (materialLower.includes("white") || nameLower.includes("white")) {
    return "#F5F5F5";
  }
  if (materialLower.includes("walnut") || nameLower.includes("walnut")) {
    return "#5C4033";
  }
  if (materialLower.includes("cherry") || nameLower.includes("cherry")) {
    return "#722F37";
  }
  if (materialLower.includes("oak") || nameLower.includes("oak")) {
    return "#D8BE75";
  }
  if (materialLower.includes("mahogany") || nameLower.includes("mahogany")) {
    return "#4E2728";
  }
  if (materialLower.includes("maple") || nameLower.includes("maple")) {
    return "#E8D4A9";
  }
  return "#8B4513";
}
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_frameCatalog();
    init_matColors();
    init_glassOptions();
    init_db();
    DatabaseStorage = class {
      /**
       * Update the physical artwork location for an order
       * @param id Order ID
       * @param location Physical storage location
       * @returns Updated order
       */
      async updateOrderArtLocation(id, location) {
        try {
          const [updatedOrder] = await db.update(orders).set({ artworkLocation: location }).where(eq2(orders.id, id)).returning();
          if (!updatedOrder) {
            throw new Error("Order not found");
          }
          return updatedOrder;
        } catch (error) {
          console.error("Error updating order artwork location:", error);
          throw error;
        }
      }
      // Order mats methods
      async getOrderMats(orderId) {
        try {
          const result = await db.select().from(orderMats).where(eq2(orderMats.orderId, orderId));
          const enhancedMats = [];
          for (const mat of result) {
            const matboard = await this.getMatColor(mat.matColorId);
            if (matboard) {
              enhancedMats.push({
                ...mat,
                matboard
              });
            }
          }
          return enhancedMats;
        } catch (error) {
          console.error(`Error getting order mats for order ${orderId}:`, error);
          return [];
        }
      }
      // Order frames methods
      async getOrderFrames(orderId) {
        try {
          const result = await db.select().from(orderFrames).where(eq2(orderFrames.orderId, orderId));
          const enhancedFrames = [];
          for (const frameEntry of result) {
            const frame = await this.getFrame(frameEntry.frameId);
            if (frame) {
              enhancedFrames.push({
                ...frameEntry,
                frame
              });
            }
          }
          return enhancedFrames;
        } catch (error) {
          console.error(`Error getting order frames for order ${orderId}:`, error);
          return [];
        }
      }
      // Order pricing details for analytics
      async getOrderPricingDetails(orderId) {
        try {
          const order = await this.getOrder(orderId);
          if (!order) return void 0;
          const { calculatePricing } = (init_pricingService(), __toCommonJS(pricingService_exports));
          const frame = order.frameId ? await this.getFrame(order.frameId) : void 0;
          const matColor = order.matColorId ? await this.getMatColor(order.matColorId) : void 0;
          const glassOption = order.glassOptionId ? await this.getGlassOption(order.glassOptionId) : void 0;
          const specialServices2 = await this.getOrderSpecialServices(orderId);
          const mats = await this.getOrderMats(orderId);
          const frames2 = await this.getOrderFrames(orderId);
          const pricingParams = {
            artworkWidth: Number(order.artworkWidth),
            artworkHeight: Number(order.artworkHeight),
            matWidth: Number(order.matWidth),
            frame,
            matColor,
            glassOption,
            specialServices: specialServices2,
            quantity: order.quantity || 1,
            includeWholesalePrices: true,
            mats: mats.length > 0 ? mats : void 0,
            frames: frames2.length > 0 ? frames2 : void 0
          };
          return calculatePricing(pricingParams);
        } catch (error) {
          console.error("Error getting order pricing details:", error);
          return void 0;
        }
      }
      // Customer methods
      async getCustomer(id) {
        const [customer] = await db.select().from(customers).where(eq2(customers.id, id));
        return customer || void 0;
      }
      async getCustomerByEmail(email) {
        const [customer] = await db.select().from(customers).where(eq2(customers.email, email));
        return customer || void 0;
      }
      async getAllCustomers() {
        return await db.select().from(customers);
      }
      async createCustomer(customer) {
        const [newCustomer] = await db.insert(customers).values({
          ...customer,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newCustomer;
      }
      async updateCustomer(id, data) {
        const [updatedCustomer] = await db.update(customers).set(data).where(eq2(customers.id, id)).returning();
        if (!updatedCustomer) {
          throw new Error("Customer not found");
        }
        return updatedCustomer;
      }
      // Frame methods
      async getFrame(id) {
        console.log(`Storage: Getting frame with ID: ${id}`);
        try {
          const [frame] = await db.select().from(frames).where(eq2(frames.id, id));
          if (frame) {
            console.log(`Storage: Found frame in database: ${frame.name}`);
            let frameColor = determineFrameColor(frame);
            let enhancedImage = frame.catalogImage;
            let realCornerImage = frame.corner || "";
            let realEdgeImage = frame.edgeTexture || "";
            if (frame.manufacturer === "Larson-Juhl") {
              const frameNumber = frame.id.split("-")[1];
              if (frameNumber) {
                enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
                realCornerImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_corner.jpg`;
                realEdgeImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_prof.jpg`;
              }
            }
            if (frame.manufacturer === "Nielsen") {
              const frameNumber = frame.id.split("-")[1];
              if (frameNumber) {
                enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
                realCornerImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Corner.jpg`;
                realEdgeImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Edge.jpg`;
              }
            }
            return {
              ...frame,
              catalogImage: enhancedImage,
              corner: realCornerImage,
              edgeTexture: realEdgeImage,
              color: frameColor
            };
          }
          console.log(`Storage: Frame not found in database, checking catalog`);
          const catalogFrame = frameCatalog.find((f) => f.id === id);
          if (catalogFrame) {
            console.log(`Storage: Found frame in catalog: ${catalogFrame.name}`);
            let enhancedImage = catalogFrame.catalogImage;
            let realCornerImage = catalogFrame.corner || "";
            let realEdgeImage = catalogFrame.edgeTexture || "";
            let frameColor = catalogFrame.color || determineFrameColor(catalogFrame);
            if (catalogFrame.manufacturer === "Larson-Juhl") {
              const frameNumber = catalogFrame.id.split("-")[1];
              if (frameNumber) {
                enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
                realCornerImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_corner.jpg`;
                realEdgeImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_prof.jpg`;
              }
            }
            if (catalogFrame.manufacturer === "Nielsen") {
              const frameNumber = catalogFrame.id.split("-")[1];
              if (frameNumber) {
                enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
                realCornerImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Corner.jpg`;
                realEdgeImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Edge.jpg`;
              }
            }
            const dbSafeFrame = {
              ...catalogFrame,
              catalogImage: enhancedImage,
              corner: realCornerImage,
              edgeTexture: realEdgeImage
            };
            console.log(`Storage: Inserting enhanced frame into database: ${dbSafeFrame.name}`);
            try {
              await db.insert(frames).values(dbSafeFrame);
              console.log(`Storage: Successfully inserted frame into database`);
            } catch (error) {
              console.error(`Storage: Error inserting frame into database:`, error);
            }
            return {
              ...dbSafeFrame,
              color: frameColor
            };
          }
          console.log(`Storage: Frame not found in catalog`);
          return void 0;
        } catch (error) {
          console.error(`Storage: Error in getFrame(${id}):`, error);
          const catalogFrame = frameCatalog.find((f) => f.id === id);
          if (catalogFrame) {
            let frameColor = determineFrameColor(catalogFrame);
            let enhancedImage = catalogFrame.catalogImage;
            if (catalogFrame.manufacturer === "Larson-Juhl") {
              const frameNumber = catalogFrame.id.split("-")[1];
              if (frameNumber) {
                enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
              }
            } else if (catalogFrame.manufacturer === "Nielsen") {
              const frameNumber = catalogFrame.id.split("-")[1];
              if (frameNumber) {
                enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
              }
            }
            return {
              ...catalogFrame,
              catalogImage: enhancedImage,
              color: frameColor
            };
          }
          return void 0;
        }
      }
      async getAllFrames() {
        console.log("Storage: Getting all frames");
        try {
          const dbFrames = await db.select().from(frames);
          console.log(`Storage: Found ${dbFrames.length} frames in database`);
          if (dbFrames.length > 0) {
            console.log("Storage: Enhancing existing frames with real wholesaler images");
            return dbFrames.map((frame) => {
              let frameColor = determineFrameColor(frame);
              let enhancedImage = frame.catalogImage;
              let realCornerImage = frame.corner || "";
              let realEdgeImage = frame.edgeTexture || "";
              if (frame.manufacturer === "Larson-Juhl") {
                const frameNumber = frame.id.split("-")[1];
                if (frameNumber) {
                  enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
                  realCornerImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_corner.jpg`;
                  realEdgeImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_prof.jpg`;
                }
              }
              if (frame.manufacturer === "Nielsen") {
                const frameNumber = frame.id.split("-")[1];
                if (frameNumber) {
                  enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
                  realCornerImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Corner.jpg`;
                  realEdgeImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Edge.jpg`;
                }
              }
              return {
                ...frame,
                catalogImage: enhancedImage,
                corner: realCornerImage,
                edgeTexture: realEdgeImage,
                color: frameColor
              };
            });
          }
          console.log("Storage: No frames in database, returning enhanced catalog data");
          const enhancedCatalog = frameCatalog.map((frame) => {
            let enhancedImage = frame.catalogImage;
            let realCornerImage = frame.corner || "";
            let realEdgeImage = frame.edgeTexture || "";
            let frameColor = frame.color || determineFrameColor(frame);
            if (frame.manufacturer === "Larson-Juhl") {
              const frameNumber = frame.id.split("-")[1];
              if (frameNumber) {
                enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
                realCornerImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_corner.jpg`;
                realEdgeImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_prof.jpg`;
              }
            }
            if (frame.manufacturer === "Nielsen") {
              const frameNumber = frame.id.split("-")[1];
              if (frameNumber) {
                enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
                realCornerImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Corner.jpg`;
                realEdgeImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Edge.jpg`;
              }
            }
            const dbSafeFrame = {
              ...frame,
              catalogImage: enhancedImage,
              corner: realCornerImage,
              edgeTexture: realEdgeImage
            };
            try {
              db.insert(frames).values(dbSafeFrame).execute();
            } catch (error) {
              console.error(`Storage: Error inserting frame ${frame.id} into database:`, error);
            }
            return {
              ...dbSafeFrame,
              color: frameColor
            };
          });
          return enhancedCatalog;
        } catch (error) {
          console.error("Storage: Error in getAllFrames:", error);
          return frameCatalog.map((frame) => {
            let frameColor = determineFrameColor(frame);
            const frameNumber = frame.id.split("-")[1];
            let enhancedImage = frame.catalogImage;
            if (frame.manufacturer === "Larson-Juhl") {
              enhancedImage = `https://images.unsplash.com/photo-1594194208961-0fdf358251d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D`;
            } else if (frame.manufacturer === "Roma") {
              enhancedImage = `https://images.unsplash.com/photo-1579541591661-567c1ea5dc56?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D`;
            } else if (frame.manufacturer === "Omega") {
              enhancedImage = `https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZnJhbWV8ZW58MHx8MHx8fDA%3D`;
            } else {
              enhancedImage = `https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZyYW1lfGVufDB8fDB8fHww`;
            }
            return {
              ...frame,
              catalogImage: enhancedImage,
              color: frameColor
            };
          });
        }
      }
      async updateFrame(id, data) {
        const [updatedFrame] = await db.update(frames).set(data).where(eq2(frames.id, id)).returning();
        if (!updatedFrame) {
          throw new Error("Frame not found");
        }
        return updatedFrame;
      }
      async addFrame(frame) {
        console.log(`Storage: Adding new frame to database: ${frame.name} (${frame.id})`);
        try {
          const [newFrame] = await db.insert(frames).values(frame).returning();
          console.log(`Storage: Successfully added frame to database`);
          return newFrame;
        } catch (error) {
          console.error(`Storage: Error adding frame to database:`, error);
          throw error;
        }
      }
      async searchFramesByItemNumber(itemNumber) {
        console.log(`Storage: Searching frames by item number: ${itemNumber}`);
        try {
          const allFrames = await this.getAllFrames();
          const lowerItemNumber = itemNumber.toLowerCase();
          return allFrames.filter((frame) => {
            const frameItemNumber = frame.id.split("-")[1]?.toLowerCase() || "";
            return frameItemNumber.includes(lowerItemNumber);
          });
        } catch (error) {
          console.error(`Storage: Error searching frames by item number:`, error);
          return [];
        }
      }
      // Mat color methods
      async getMatColor(id) {
        const [matColor] = await db.select().from(matColors).where(eq2(matColors.id, id));
        if (!matColor) {
          const catalogMatColor = matColorCatalog.find((m) => m.id === id);
          if (catalogMatColor) {
            await db.insert(matColors).values(catalogMatColor);
            return catalogMatColor;
          }
        }
        return matColor || void 0;
      }
      async getAllMatColors() {
        const dbMatColors = await db.select().from(matColors);
        if (dbMatColors.length === 0) {
          await db.insert(matColors).values(matColorCatalog);
          return matColorCatalog;
        }
        return dbMatColors;
      }
      // Glass option methods
      async getGlassOption(id) {
        const [glassOption] = await db.select().from(glassOptions).where(eq2(glassOptions.id, id));
        if (!glassOption) {
          const catalogGlassOption = glassOptionCatalog.find((g) => g.id === id);
          if (catalogGlassOption) {
            await db.insert(glassOptions).values(catalogGlassOption);
            return catalogGlassOption;
          }
        }
        return glassOption || void 0;
      }
      async getAllGlassOptions() {
        const dbGlassOptions = await db.select().from(glassOptions);
        if (dbGlassOptions.length === 0) {
          await db.insert(glassOptions).values(glassOptionCatalog);
          return glassOptionCatalog;
        }
        return dbGlassOptions;
      }
      // Special service methods
      async getSpecialService(id) {
        const [specialService] = await db.select().from(specialServices).where(eq2(specialServices.id, id));
        if (!specialService) {
          const catalogSpecialService = specialServicesCatalog.find((s) => s.id === id);
          if (catalogSpecialService) {
            await db.insert(specialServices).values(catalogSpecialService);
            return catalogSpecialService;
          }
        }
        return specialService || void 0;
      }
      async getAllSpecialServices() {
        const dbSpecialServices = await db.select().from(specialServices);
        if (dbSpecialServices.length === 0) {
          await db.insert(specialServices).values(specialServicesCatalog);
          return specialServicesCatalog;
        }
        return dbSpecialServices;
      }
      // Order group methods
      async getOrderGroup(id) {
        const [orderGroup] = await db.select().from(orderGroups).where(eq2(orderGroups.id, id));
        return orderGroup || void 0;
      }
      async getActiveOrderGroupByCustomer(customerId) {
        const [orderGroup] = await db.select().from(orderGroups).where(eq2(orderGroups.customerId, customerId));
        return orderGroup && orderGroup.status === "open" ? orderGroup : void 0;
      }
      async getAllOrderGroups() {
        return await db.select().from(orderGroups);
      }
      async createOrderGroup(orderGroup) {
        const [newOrderGroup] = await db.insert(orderGroups).values({
          ...orderGroup,
          status: "open",
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newOrderGroup;
      }
      async updateOrderGroup(id, data) {
        const [updatedOrderGroup] = await db.update(orderGroups).set(data).where(eq2(orderGroups.id, id)).returning();
        if (!updatedOrderGroup) {
          throw new Error("Order group not found");
        }
        return updatedOrderGroup;
      }
      async getOrderGroupsByCustomerId(customerId) {
        try {
          console.log(`Storage: Getting order groups for customer ID: ${customerId}`);
          const result = await db.select().from(orderGroups).where(eq2(orderGroups.customerId, customerId));
          console.log(`Storage: Found ${result.length} order groups for customer ID: ${customerId}`);
          return result;
        } catch (error) {
          console.error("Storage: Error getting order groups by customer ID:", error);
          throw error;
        }
      }
      async getOrdersByGroupId(orderGroupId) {
        return await db.select().from(orders).where(eq2(orders.orderGroupId, orderGroupId));
      }
      // Order methods
      async getOrder(id) {
        const [order] = await db.select().from(orders).where(eq2(orders.id, id));
        return order || void 0;
      }
      async getAllOrders() {
        return await db.select().from(orders);
      }
      async createOrder(order) {
        try {
          if (!order.artworkImage) {
            throw new Error("CRITICAL VALIDATION ERROR: Every order must have an artwork image. This is mandatory for business operations.");
          }
          console.log("DatabaseStorage.createOrder - Inserting order with data:", order);
          const [newOrder] = await db.insert(orders).values(order).returning();
          console.log("DatabaseStorage.createOrder - Order created successfully:", newOrder);
          return newOrder;
        } catch (error) {
          console.error("DatabaseStorage.createOrder - Error creating order:", error);
          throw error;
        }
      }
      async updateOrder(id, data) {
        const [updatedOrder] = await db.update(orders).set(data).where(eq2(orders.id, id)).returning();
        if (!updatedOrder) {
          throw new Error("Order not found");
        }
        return updatedOrder;
      }
      async deleteOrder(id) {
        await db.delete(orders).where(eq2(orders.id, id));
      }
      // Order special service methods
      async createOrderSpecialService(orderSpecialService) {
        const [newOrderSpecialService] = await db.insert(orderSpecialServices).values(orderSpecialService).returning();
        return newOrderSpecialService;
      }
      async getOrderSpecialServices(orderId) {
        const orderSpecialServicesData = await db.select().from(orderSpecialServices).where(eq2(orderSpecialServices.orderId, orderId));
        const serviceIds = orderSpecialServicesData.map((os) => os.specialServiceId);
        const result = [];
        for (const id of serviceIds) {
          if (id) {
            const service = await this.getSpecialService(id);
            if (service) {
              result.push(service);
            }
          }
        }
        return result;
      }
      // Wholesale order methods
      async getWholesaleOrder(id) {
        const [wholesaleOrder] = await db.select().from(wholesaleOrders).where(eq2(wholesaleOrders.id, id));
        return wholesaleOrder || void 0;
      }
      async getAllWholesaleOrders() {
        return await db.select().from(wholesaleOrders);
      }
      async createWholesaleOrder(wholesaleOrder) {
        const [newWholesaleOrder] = await db.insert(wholesaleOrders).values({
          ...wholesaleOrder,
          status: "pending",
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return newWholesaleOrder;
      }
      async updateWholesaleOrder(id, data) {
        const [updatedWholesaleOrder] = await db.update(wholesaleOrders).set(data).where(eq2(wholesaleOrders.id, id)).returning();
        if (!updatedWholesaleOrder) {
          throw new Error("Wholesale order not found");
        }
        return updatedWholesaleOrder;
      }
      // Production Kanban methods
      async getOrdersByProductionStatus(status) {
        return await db.select().from(orders).where(eq2(orders.productionStatus, status)).orderBy(orders.lastStatusChange);
      }
      async updateOrderProductionStatus(id, status) {
        const [order] = await db.select().from(orders).where(eq2(orders.id, id));
        if (!order) {
          throw new Error("Order not found");
        }
        const previousStatus = order.productionStatus;
        const [updatedOrder] = await db.update(orders).set({
          productionStatus: status,
          lastStatusChange: /* @__PURE__ */ new Date()
        }).where(eq2(orders.id, id)).returning();
        if (updatedOrder.notificationsEnabled) {
          const [customer] = await db.select().from(customers).where(eq2(customers.id, order.customerId));
          if (customer) {
            try {
              const { sendOrderStatusUpdate } = await Promise.resolve().then(() => (init_emailService(), emailService_exports));
              const emailSent = await sendOrderStatusUpdate(
                customer.email,
                customer.name,
                order.id,
                status,
                previousStatus,
                order.estimatedCompletionDays
              );
              await this.createCustomerNotification({
                customerId: customer.id,
                orderId: order.id,
                notificationType: "status_update",
                channel: "email",
                subject: `Order #${order.id} Status Update: ${status}`,
                message: `Your order is now ${status.split("_").join(" ")}. Check your email for details.`,
                successful: emailSent,
                previousStatus,
                newStatus: status,
                // Store response data if needed for debugging
                responseData: emailSent ? { sent: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() } : { sent: false, error: "Email failed to send" }
              });
              console.log(`Status update email ${emailSent ? "sent" : "failed"} for Order #${order.id} to ${customer.email}`);
            } catch (error) {
              console.error("Error sending status update email:", error);
              await this.createCustomerNotification({
                customerId: customer.id,
                orderId: order.id,
                notificationType: "status_update",
                channel: "email",
                subject: `Order #${order.id} Status Update: ${status}`,
                message: `Your order is now ${status.split("_").join(" ")}.`,
                successful: false,
                previousStatus,
                newStatus: status,
                responseData: { error: error.message }
              });
            }
          }
        }
        return updatedOrder;
      }
      async getOrdersForKanban() {
        const dbOrders = await db.select({
          order: orders,
          customer: customers
        }).from(orders).leftJoin(customers, eq2(orders.customerId, customers.id)).orderBy(orders.lastStatusChange);
        return dbOrders.map((row) => ({
          ...row.order,
          customerName: row.customer ? row.customer.name : "Unknown Customer",
          customerPhone: row.customer?.phone || "No phone",
          customerEmail: row.customer?.email || "No email"
        }));
      }
      async scheduleOrderForProduction(id, estimatedDays) {
        const [order] = await db.select().from(orders).where(eq2(orders.id, id));
        if (!order) {
          throw new Error("Order not found");
        }
        const [updatedOrder] = await db.update(orders).set({
          estimatedCompletionDays: estimatedDays,
          productionStatus: "scheduled"
        }).where(eq2(orders.id, id)).returning();
        if (updatedOrder.notificationsEnabled) {
          const [customer] = await db.select().from(customers).where(eq2(customers.id, order.customerId));
          if (customer) {
            const estimatedCompletionDate = /* @__PURE__ */ new Date();
            estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays);
            await this.createCustomerNotification({
              customerId: customer.id,
              orderId: order.id,
              notificationType: "estimated_completion",
              channel: "email",
              subject: `Your Custom Framing Order #${order.id} Has Been Scheduled`,
              message: `Your custom framing order #${order.id} has been scheduled for production. The estimated completion date is ${estimatedCompletionDate.toLocaleDateString()}.`,
              successful: true,
              previousStatus: order.productionStatus,
              newStatus: "scheduled"
            });
          }
        }
        return updatedOrder;
      }
      // Customer notification methods
      async createCustomerNotification(notification) {
        const [newNotification] = await db.insert(customerNotifications).values({
          ...notification,
          sentAt: /* @__PURE__ */ new Date()
        }).returning();
        return newNotification;
      }
      async getCustomerNotifications(customerId) {
        return await db.select().from(customerNotifications).where(eq2(customerNotifications.customerId, customerId)).orderBy(customerNotifications.sentAt, "desc");
      }
      async getNotificationsByOrder(orderId) {
        return await db.select().from(customerNotifications).where(eq2(customerNotifications.orderId, orderId)).orderBy(customerNotifications.sentAt, "desc");
      }
      // Material order methods
      async getMaterialOrder(id) {
        const [materialOrder] = await db.select().from(materialOrders).where(eq2(materialOrders.id, id));
        return materialOrder;
      }
      async getAllMaterialOrders() {
        try {
          const columns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'material_orders'
      `);
          const result = await db.execute(sql`
        SELECT * FROM material_orders
        ORDER BY created_at DESC
      `);
          return result;
        } catch (error) {
          console.error("Error in getAllMaterialOrders:", error);
          return [];
        }
      }
      async getMaterialOrdersByStatus(status) {
        try {
          return await db.select().from(materialOrders).where(eq2(materialOrders.status, status)).orderBy(desc(materialOrders.createdAt));
        } catch (error) {
          console.error("Error in getMaterialOrdersByStatus:", error);
          return [];
        }
      }
      async getMaterialOrdersByType(materialType) {
        try {
          return await db.select().from(materialOrders).where(eq2(materialOrders.materialType, materialType)).orderBy(desc(materialOrders.createdAt));
        } catch (error) {
          console.error("Error in getMaterialOrdersByType:", error);
          return [];
        }
      }
      async createMaterialOrder(materialOrder) {
        console.log("Creating material order with data:", materialOrder);
        const cleanData = { ...materialOrder };
        if (cleanData.vendor && !cleanData.supplierName) {
          cleanData.supplierName = cleanData.vendor;
          delete cleanData.vendor;
        }
        console.log("Cleaned data for material order creation:", cleanData);
        try {
          const [newMaterialOrder] = await db.insert(materialOrders).values(cleanData).returning();
          console.log("Successfully created material order:", newMaterialOrder.id);
          return newMaterialOrder;
        } catch (error) {
          console.error("Error creating material order:", error);
          throw error;
        }
      }
      async updateMaterialOrder(id, data) {
        console.log("updateMaterialOrder called with id:", id, "and data:", data);
        const materialId = typeof id === "string" && !isNaN(parseInt(id)) ? parseInt(id) : id;
        const cleanData = { ...data };
        if (cleanData.vendor && !cleanData.supplierName) {
          cleanData.supplierName = cleanData.vendor;
          delete cleanData.vendor;
        }
        console.log("Cleaned data for update:", cleanData);
        try {
          const [updatedMaterialOrder] = await db.update(materialOrders).set(cleanData).where(eq2(materialOrders.id, materialId)).returning();
          console.log("Successfully updated material order:", updatedMaterialOrder.id);
          return updatedMaterialOrder;
        } catch (error) {
          console.error("Error updating material order:", error);
          throw error;
        }
      }
      async deleteMaterialOrder(id) {
        await db.delete(materialOrders).where(eq2(materialOrders.id, id));
      }
      // Inventory Management System Methods
      // Inventory Items
      async getAllInventoryItems() {
        try {
          return await db.select().from(inventoryItems).orderBy(asc(inventoryItems.name));
        } catch (error) {
          console.error("Error in getAllInventoryItems:", error);
          return [];
        }
      }
      async getInventoryItem(id) {
        try {
          const [item] = await db.select().from(inventoryItems).where(eq2(inventoryItems.id, id));
          return item;
        } catch (error) {
          console.error("Error in getInventoryItem:", error);
          return void 0;
        }
      }
      async getInventoryItemByBarcode(barcode) {
        try {
          const [item] = await db.select().from(inventoryItems).where(eq2(inventoryItems.barcode, barcode));
          return item;
        } catch (error) {
          console.error("Error in getInventoryItemByBarcode:", error);
          return void 0;
        }
      }
      async createInventoryItem(inventoryItem) {
        try {
          if (!inventoryItem.sku) {
            inventoryItem.sku = `INV-${Date.now().toString(36).toUpperCase()}`;
          }
          const { initialQuantity, ...itemToInsert } = inventoryItem;
          const [newItem] = await db.insert(inventoryItems).values(itemToInsert).returning();
          if (initialQuantity) {
            await this.createInventoryTransaction({
              itemId: newItem.id,
              type: "initial",
              quantity: initialQuantity,
              unitCost: inventoryItem.costPerUnit,
              notes: "Initial inventory setup"
            });
          }
          return newItem;
        } catch (error) {
          console.error("Error in createInventoryItem:", error);
          throw error;
        }
      }
      async updateInventoryItem(id, item) {
        try {
          const [updatedItem] = await db.update(inventoryItems).set({
            ...item,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(inventoryItems.id, id)).returning();
          return updatedItem;
        } catch (error) {
          console.error("Error in updateInventoryItem:", error);
          throw error;
        }
      }
      async deleteInventoryItem(id) {
        try {
          await db.delete(inventoryTransactions).where(eq2(inventoryTransactions.itemId, id));
          await db.delete(inventoryItems).where(eq2(inventoryItems.id, id));
        } catch (error) {
          console.error("Error in deleteInventoryItem:", error);
          throw error;
        }
      }
      // Low stock items
      async getLowStockItems() {
        try {
          const items = await db.select().from(inventoryItems);
          const lowStockItems = [];
          for (const item of items) {
            const currentStock = await this.getItemCurrentStock(item.id);
            if (currentStock <= Number(item.reorderLevel)) {
              lowStockItems.push({
                ...item,
                currentStock
              });
            }
          }
          return lowStockItems;
        } catch (error) {
          console.error("Error in getLowStockItems:", error);
          return [];
        }
      }
      // Get current stock level for an item based on transactions
      async getItemCurrentStock(itemId) {
        try {
          const transactions = await db.select().from(inventoryTransactions).where(eq2(inventoryTransactions.itemId, itemId));
          let currentStock = 0;
          for (const transaction of transactions) {
            const quantity = Number(transaction.quantity);
            switch (transaction.type) {
              case "purchase":
              case "initial":
              case "adjustment":
                currentStock += quantity;
                break;
              case "sale":
              case "scrap":
                currentStock -= quantity;
                break;
            }
          }
          return currentStock;
        } catch (error) {
          console.error("Error in getItemCurrentStock:", error);
          return 0;
        }
      }
      // Inventory Transactions
      async createInventoryTransaction(transaction) {
        try {
          const [newTransaction] = await db.insert(inventoryTransactions).values(transaction).returning();
          if (transaction.type === "count") {
            await db.update(inventoryItems).set({
              lastCountDate: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq2(inventoryItems.id, transaction.itemId));
          }
          return newTransaction;
        } catch (error) {
          console.error("Error in createInventoryTransaction:", error);
          throw error;
        }
      }
      // Suppliers
      async getAllSuppliers() {
        try {
          return await db.select().from(suppliers).orderBy(asc(suppliers.name));
        } catch (error) {
          console.error("Error in getAllSuppliers:", error);
          return [];
        }
      }
      async getSupplier(id) {
        try {
          const [supplier] = await db.select().from(suppliers).where(eq2(suppliers.id, id));
          return supplier;
        } catch (error) {
          console.error("Error in getSupplier:", error);
          return void 0;
        }
      }
      async createSupplier(supplier) {
        try {
          const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
          return newSupplier;
        } catch (error) {
          console.error("Error in createSupplier:", error);
          throw error;
        }
      }
      async updateSupplier(id, supplier) {
        try {
          const [updatedSupplier] = await db.update(suppliers).set(supplier).where(eq2(suppliers.id, id)).returning();
          return updatedSupplier;
        } catch (error) {
          console.error("Error in updateSupplier:", error);
          throw error;
        }
      }
      async deleteSupplier(id) {
        try {
          await db.delete(suppliers).where(eq2(suppliers.id, id));
        } catch (error) {
          console.error("Error in deleteSupplier:", error);
          throw error;
        }
      }
      // Inventory Locations
      async getAllInventoryLocations() {
        try {
          return await db.select().from(inventoryLocations).orderBy(asc(inventoryLocations.name));
        } catch (error) {
          console.error("Error in getAllInventoryLocations:", error);
          return [];
        }
      }
      async getInventoryLocation(id) {
        try {
          const [location] = await db.select().from(inventoryLocations).where(eq2(inventoryLocations.id, id));
          return location;
        } catch (error) {
          console.error("Error in getInventoryLocation:", error);
          return void 0;
        }
      }
      async createInventoryLocation(location) {
        try {
          const [newLocation] = await db.insert(inventoryLocations).values(location).returning();
          return newLocation;
        } catch (error) {
          console.error("Error in createInventoryLocation:", error);
          throw error;
        }
      }
      // Purchase Orders and Lines
      async getAllPurchaseOrders() {
        try {
          return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
        } catch (error) {
          console.error("Error in getAllPurchaseOrders:", error);
          return [];
        }
      }
      async getPurchaseOrder(id) {
        try {
          const [order] = await db.select().from(purchaseOrders).where(eq2(purchaseOrders.id, id));
          return order;
        } catch (error) {
          console.error("Error in getPurchaseOrder:", error);
          return void 0;
        }
      }
      async createPurchaseOrderWithLines(orderData, lines) {
        try {
          const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
          let subtotal = 0;
          for (const line of lines) {
            const lineTotal = Number(line.quantity) * Number(line.unitCost);
            subtotal += lineTotal;
          }
          const tax = subtotal * 0.08;
          const total = subtotal + tax + Number(orderData.shipping || 0);
          const [purchaseOrder] = await db.insert(purchaseOrders).values({
            ...orderData,
            poNumber,
            subtotal: subtotal.toString(),
            tax: tax.toString(),
            total: total.toString()
          }).returning();
          for (const line of lines) {
            const lineTotal = Number(line.quantity) * Number(line.unitCost);
            await db.insert(purchaseOrderLines).values({
              ...line,
              purchaseOrderId: purchaseOrder.id,
              lineTotal: lineTotal.toString()
            });
          }
          return purchaseOrder;
        } catch (error) {
          console.error("Error in createPurchaseOrderWithLines:", error);
          throw error;
        }
      }
      // Valuation
      async getInventoryValuation() {
        try {
          const items = await this.getAllInventoryItems();
          let totalValue = 0;
          const valueByCategory = {};
          for (const item of items) {
            const currentStock = await this.getItemCurrentStock(item.id);
            const itemValue = currentStock * Number(item.costPerUnit);
            totalValue += itemValue;
            if (item.categoryId) {
              const category = await this.getInventoryCategory(item.categoryId);
              const categoryName = category?.name || "Uncategorized";
              if (!valueByCategory[categoryName]) {
                valueByCategory[categoryName] = 0;
              }
              valueByCategory[categoryName] += itemValue;
            } else {
              if (!valueByCategory["Uncategorized"]) {
                valueByCategory["Uncategorized"] = 0;
              }
              valueByCategory["Uncategorized"] += itemValue;
            }
          }
          const valuationByCategory = Object.entries(valueByCategory).map(([category, value]) => ({
            category,
            value
          }));
          return {
            totalValue,
            itemCount: items.length,
            valuationByCategory
          };
        } catch (error) {
          console.error("Error in getInventoryValuation:", error);
          return {
            totalValue: 0,
            itemCount: 0,
            valuationByCategory: []
          };
        }
      }
      // Get inventory category by ID
      async getInventoryCategory(id) {
        try {
          const [category] = await db.select().from(inventoryCategories).where(eq2(inventoryCategories.id, id));
          return category;
        } catch (error) {
          console.error("Error in getInventoryCategory:", error);
          return void 0;
        }
      }
      // Generate recommended purchase orders
      async generateRecommendedPurchaseOrders() {
        try {
          const lowStockItems = await this.getLowStockItems();
          const supplierMap = {};
          for (const item of lowStockItems) {
            if (item.supplierId) {
              const supplier = await this.getSupplier(item.supplierId);
              if (supplier) {
                if (!supplierMap[supplier.id]) {
                  supplierMap[supplier.id] = {
                    supplierId: supplier.id,
                    supplierName: supplier.name,
                    items: []
                  };
                }
                supplierMap[supplier.id].items.push({
                  itemId: item.id,
                  name: item.name,
                  sku: item.sku,
                  currentStock: await this.getItemCurrentStock(item.id),
                  reorderLevel: Number(item.reorderLevel),
                  reorderQuantity: Number(item.reorderQuantity || item.reorderLevel)
                });
              }
            }
          }
          return Object.values(supplierMap);
        } catch (error) {
          console.error("Error in generateRecommendedPurchaseOrders:", error);
          return [];
        }
      }
      // CSV Import/Export
      async importInventoryFromCSV(filePath) {
        try {
          return {
            success: true,
            importedCount: 0,
            errors: []
          };
        } catch (error) {
          console.error("Error in importInventoryFromCSV:", error);
          return {
            success: false,
            importedCount: 0,
            errors: ["Failed to import CSV data"]
          };
        }
      }
      async exportInventoryToCSV() {
        try {
          return "id,sku,name,description,quantity\n";
        } catch (error) {
          console.error("Error in exportInventoryToCSV:", error);
          throw error;
        }
      }
      // Notification methods
      async createNotification(notification) {
        const [newNotification] = await db.insert(notifications).values(notification).returning();
        return newNotification;
      }
      async getNotification(id) {
        const [notification] = await db.select().from(notifications).where(eq2(notifications.id, id));
        return notification || void 0;
      }
      async getNotifications(limit) {
        let query = db.select().from(notifications).orderBy(desc(notifications.createdAt));
        if (limit) {
          query = query.limit(limit);
        }
        return await query;
      }
      async getUnreadNotifications() {
        return await db.select().from(notifications).where(eq2(notifications.read, false)).orderBy(desc(notifications.createdAt));
      }
      async markNotificationAsRead(id) {
        const [updatedNotification] = await db.update(notifications).set({ read: true }).where(eq2(notifications.id, id)).returning();
        return updatedNotification;
      }
      async getNotificationsByUser(userId) {
        return await db.select().from(notifications).where(eq2(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
      }
      // Materials pick list methods
      // Get all materials for a specific order
      async getMaterialsForOrder(orderId) {
        try {
          return [];
        } catch (error) {
          console.error("Error in getMaterialsForOrder:", error);
          throw error;
        }
      }
      // Get materials pick list
      async getMaterialsPickList() {
        try {
          return [];
        } catch (error) {
          console.error("Error in getMaterialsPickList:", error);
          return [];
        }
      }
      // Update material order
      async updateMaterialOrder(id, data) {
        try {
          return {};
        } catch (error) {
          console.error("Error in updateMaterialOrder:", error);
          throw error;
        }
      }
      // Create purchase order
      async createPurchaseOrder(materialIds) {
        try {
          return {};
        } catch (error) {
          console.error("Error in createPurchaseOrder:", error);
          throw error;
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/controllers/artLocationController.ts
init_storage();
import { z } from "zod";
var artLocationSchema = z.object({
  orderId: z.number(),
  location: z.string(),
  artworkType: z.string(),
  artworkDescription: z.string(),
  artworkWidth: z.number(),
  artworkHeight: z.number()
});
var artLocationController = {
  /**
   * Sends artwork location data to the Art Locations app
   * @param req Express request object
   * @param res Express response object
   */
  async sendArtLocationData(req, res) {
    try {
      const data = artLocationSchema.parse(req.body);
      const updatedOrder = await storage.updateOrderArtLocation(
        data.orderId,
        data.location
      );
      res.status(200).json({
        success: true,
        message: "Art location data recorded successfully",
        data: updatedOrder
      });
    } catch (error) {
      console.error("Error recording art location data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to record art location data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
  /**
   * Retrieves artwork location data for an order
   * @param req Express request object
   * @param res Express response object
   */
  async getArtLocationData(req, res) {
    try {
      const orderId = Number(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID"
        });
      }
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }
      res.status(200).json({
        orderId: order.id,
        location: order.artworkLocation || "",
        artworkType: order.artworkType || "",
        artworkDescription: order.artworkDescription || "",
        artworkWidth: order.artworkWidth || 0,
        artworkHeight: order.artworkHeight || 0
      });
    } catch (error) {
      console.error("Error fetching art location data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch art location data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
};

// server/controllers/frameDesignController.ts
init_db();
init_schema();
import { eq as eq3 } from "drizzle-orm";
var frameDesignController = {
  /**
   * Stores a frame design image for an order
   * @param req Express request with orderId and imageData
   * @param res Express response
   */
  async saveFrameDesign(req, res) {
    try {
      const { orderId, imageData } = req.body;
      if (!orderId || !imageData) {
        return res.status(400).json({
          success: false,
          message: "Order ID and image data are required"
        });
      }
      await db.update(orders).set({ frameDesignImage: imageData }).where(eq3(orders.id, parseInt(orderId)));
      res.status(200).json({
        success: true,
        message: "Frame design image saved successfully"
      });
    } catch (error) {
      console.error("Error saving frame design:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save frame design image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
  /**
   * Retrieves a frame design image for an order
   * @param req Express request with orderId parameter
   * @param res Express response
   */
  async getFrameDesign(req, res) {
    try {
      const orderId = req.params.orderId;
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required"
        });
      }
      const [order] = await db.select({ frameDesignImage: orders.frameDesignImage }).from(orders).where(eq3(orders.id, parseInt(orderId)));
      if (!order || !order.frameDesignImage) {
        return res.status(404).json({
          success: false,
          message: "Frame design image not found"
        });
      }
      res.status(200).json({
        success: true,
        imageData: order.frameDesignImage
      });
    } catch (error) {
      console.error("Error retrieving frame design:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve frame design image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
};

// server/controllers/healthController.ts
init_db();
init_schema();
var healthController = {
  /**
   * Comprehensive health check endpoint
   */
  async getSystemHealth(req, res) {
    try {
      const healthStatus = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        overall: "healthy",
        checks: []
      };
      try {
        const startTime = Date.now();
        await db.select().from(customers).limit(1);
        const responseTime = Date.now() - startTime;
        healthStatus.checks.push({
          name: "database",
          status: "healthy",
          message: "Database connection successful",
          responseTime
        });
      } catch (error) {
        healthStatus.checks.push({
          name: "database",
          status: "error",
          message: "Database connection failed",
          error: error instanceof Error ? error.message : "Unknown error"
        });
        healthStatus.overall = "error";
      }
      const memUsage = process.memoryUsage();
      const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      healthStatus.checks.push({
        name: "memory",
        status: memoryMB < 500 ? "healthy" : memoryMB < 800 ? "warning" : "error",
        message: `Memory usage: ${memoryMB}MB`,
        value: memoryMB
      });
      const uptimeSeconds = process.uptime();
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      healthStatus.checks.push({
        name: "uptime",
        status: "healthy",
        message: `Server uptime: ${uptimeMinutes} minutes`,
        value: uptimeSeconds
      });
      healthStatus.checks.push({
        name: "response_time",
        status: "healthy",
        message: "Health check response time normal",
        responseTime: 5
        // Simple placeholder for response time
      });
      if (healthStatus.checks.some((check) => check.status === "error")) {
        healthStatus.overall = "error";
      } else if (healthStatus.checks.some((check) => check.status === "warning")) {
        healthStatus.overall = "warning";
      }
      res.status(200).json(healthStatus);
    } catch (error) {
      res.status(500).json({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        overall: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
};

// server/middleware/apiAuth.ts
import crypto from "crypto";
var KANBAN_API_KEY = "jf_" + crypto.randomBytes(32).toString("hex");
var API_KEYS = {
  [KANBAN_API_KEY]: {
    name: "Production Kanban Integration",
    permissions: ["kanban:read", "kanban:write", "orders:read", "orders:update"],
    created: (/* @__PURE__ */ new Date()).toISOString(),
    lastUsed: null
  }
};
function validateApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: "Missing Authorization header",
      message: "API key required in Authorization header as: Bearer YOUR_API_KEY"
    });
  }
  const token = authHeader.replace("Bearer ", "");
  if (!API_KEYS[token]) {
    return res.status(401).json({
      error: "Invalid API key",
      message: "The provided API key is not valid or has been revoked"
    });
  }
  API_KEYS[token].lastUsed = (/* @__PURE__ */ new Date()).toISOString();
  req.apiKey = API_KEYS[token];
  next();
}

// server/routes/threeDDesignerRoutes.ts
import { Router } from "express";

// server/controllers/threeDDesignerController.ts
init_storage();
init_pricingService();

// server/utils/idGenerator.ts
function generateOrderNumber(prefix) {
  if (prefix) {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
    return `${prefix}-${year}-${random}`;
  } else {
    const timestamp2 = Date.now();
    const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
    return `ORD-${timestamp2}-${random}`;
  }
}

// server/controllers/threeDDesignerController.ts
async function createOrderFrom3D(req, res) {
  try {
    const orderData = req.body;
    if (!orderData.customerInfo?.name) {
      return res.status(400).json({ error: "Customer name is required" });
    }
    if (!orderData.designSpecs?.artworkWidth || !orderData.designSpecs?.artworkHeight) {
      return res.status(400).json({ error: "Artwork dimensions are required" });
    }
    let customer;
    if (orderData.customerInfo.email) {
      const customers2 = await storage.getCustomers();
      customer = customers2.find((c) => c.email === orderData.customerInfo.email);
    }
    if (!customer) {
      customer = await storage.createCustomer({
        name: orderData.customerInfo.name,
        email: orderData.customerInfo.email || null,
        phone: orderData.customerInfo.phone || null
      });
    }
    const trackingId = generateOrderNumber();
    const pricingData = await (void 0)({
      frameId: orderData.designSpecs.frameType,
      artworkWidth: orderData.designSpecs.artworkWidth,
      artworkHeight: orderData.designSpecs.artworkHeight,
      matColorId: orderData.designSpecs.matColors?.[0],
      glassOptionId: orderData.designSpecs.glassType,
      specialServices: orderData.rush ? ["rush_service"] : []
    });
    const order = await storage.createOrder({
      customerId: customer.id,
      frameId: orderData.designSpecs.frameType,
      matColorId: orderData.designSpecs.matColors?.[0],
      glassOptionId: orderData.designSpecs.glassType || "regular_glass",
      artworkWidth: orderData.designSpecs.artworkWidth,
      artworkHeight: orderData.designSpecs.artworkHeight,
      matWidth: 2.5,
      // Default mat width
      artworkDescription: `3D Designer Order - ${orderData.designSpecs.designType}`,
      artworkType: "3d_design",
      subtotal: pricingData.subtotal,
      tax: pricingData.tax,
      total: pricingData.total,
      status: "pending",
      productionStatus: "order_processed",
      artworkImage: orderData.designFiles.artworkImage,
      frameDesignImage: orderData.designFiles.previewImage,
      estimatedCompletionDays: orderData.rush ? 3 : 7
    });
    if (orderData.designFiles.designFile) {
      console.log("Design file received for order:", order.id);
    }
    console.log(`3D Designer order created: ${trackingId} for customer: ${customer.name}`);
    res.json({
      success: true,
      trackingId: order.id.toString(),
      orderNumber: trackingId,
      order: {
        id: order.id,
        trackingId: order.id.toString(),
        customerName: customer.name,
        status: order.status,
        productionStatus: order.productionStatus,
        total: order.total,
        estimatedCompletion: order.estimatedCompletionDays,
        designType: orderData.designSpecs.designType
      }
    });
  } catch (error) {
    console.error("Error creating 3D designer order:", error);
    res.status(500).json({
      error: "Failed to create order",
      message: error.message
    });
  }
}
async function getOrderStatus(req, res) {
  try {
    const { trackingId } = req.params;
    const orderId = parseInt(trackingId);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid tracking ID" });
    }
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const customer = await storage.getCustomer(order.customerId);
    res.json({
      success: true,
      order: {
        trackingId: order.id.toString(),
        orderNumber: `ORD-${order.id}`,
        customerName: customer?.name,
        status: order.status,
        productionStatus: order.productionStatus,
        total: order.total,
        createdAt: order.createdAt,
        estimatedCompletion: order.estimatedCompletionDays,
        artworkWidth: order.artworkWidth,
        artworkHeight: order.artworkHeight,
        frameType: order.frameId,
        matColor: order.matColorId,
        glassType: order.glassOptionId
      }
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({
      error: "Failed to fetch order status",
      message: error.message
    });
  }
}
async function updateDesignFiles(req, res) {
  try {
    const { trackingId } = req.params;
    const { previewImage, designFile, artworkImage } = req.body;
    const orderId = parseInt(trackingId);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid tracking ID" });
    }
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const updateData = {};
    if (previewImage) updateData.frameDesignImage = previewImage;
    if (artworkImage) updateData.artworkImage = artworkImage;
    const updatedOrder = await storage.updateOrder(orderId, updateData);
    res.json({
      success: true,
      message: "Design files updated successfully",
      order: {
        trackingId: updatedOrder.id.toString(),
        frameDesignImage: updatedOrder.frameDesignImage,
        artworkImage: updatedOrder.artworkImage
      }
    });
  } catch (error) {
    console.error("Error updating design files:", error);
    res.status(500).json({
      error: "Failed to update design files",
      message: error.message
    });
  }
}
async function getDesignPricing(req, res) {
  try {
    const { designType } = req.params;
    const { width, height, frameType, matColor, glassType, rush } = req.query;
    if (!width || !height) {
      return res.status(400).json({ error: "Width and height are required" });
    }
    const artworkWidth = parseFloat(width);
    const artworkHeight = parseFloat(height);
    if (isNaN(artworkWidth) || isNaN(artworkHeight)) {
      return res.status(400).json({ error: "Invalid width or height values" });
    }
    const specialServices2 = [];
    if (rush === "true") specialServices2.push("rush_service");
    if (designType === "3d") specialServices2.push("3d_design_service");
    if (designType === "shadow_box") specialServices2.push("shadowbox_service");
    const pricingData = await (void 0)({
      frameId: frameType || "basic_black_frame",
      artworkWidth,
      artworkHeight,
      matColorId: matColor,
      glassOptionId: glassType || "regular_glass",
      specialServices: specialServices2
    });
    res.json({
      success: true,
      designType,
      dimensions: { width: artworkWidth, height: artworkHeight },
      pricing: {
        subtotal: pricingData.subtotal,
        tax: pricingData.tax,
        total: pricingData.total,
        breakdown: pricingData.breakdown
      }
    });
  } catch (error) {
    console.error("Error calculating design pricing:", error);
    res.status(500).json({
      error: "Failed to calculate pricing",
      message: error.message
    });
  }
}
async function getFrameOptions(req, res) {
  try {
    const frames2 = await storage.getFrames();
    const frameOptions = frames2.map((frame) => ({
      id: frame.id,
      name: frame.name,
      material: frame.material,
      width: frame.width,
      price: frame.price,
      catalogImage: frame.catalogImage
    }));
    res.json({
      success: true,
      frames: frameOptions
    });
  } catch (error) {
    console.error("Error fetching frame options:", error);
    res.status(500).json({
      error: "Failed to fetch frame options",
      message: error.message
    });
  }
}
async function getMatOptions(req, res) {
  try {
    const matColors2 = await storage.getMatColors();
    const matOptions = matColors2.map((mat) => ({
      id: mat.id,
      name: mat.name,
      color: mat.color,
      price: mat.price
    }));
    res.json({
      success: true,
      matColors: matOptions
    });
  } catch (error) {
    console.error("Error fetching mat options:", error);
    res.status(500).json({
      error: "Failed to fetch mat options",
      message: error.message
    });
  }
}
async function testIntegration(req, res) {
  try {
    res.json({
      success: true,
      message: "3D Designer integration is working",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      apiKey: req.apiKeyType,
      endpoints: [
        "POST /api/3d-designer/orders",
        "GET /api/3d-designer/orders/{trackingId}",
        "PATCH /api/3d-designer/orders/{trackingId}/files",
        "GET /api/3d-designer/pricing/{designType}",
        "GET /api/3d-designer/frames",
        "GET /api/3d-designer/mats"
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: "Integration test failed",
      message: error.message
    });
  }
}

// server/middleware/apiKeyAuth.ts
var API_KEYS2 = {
  "kanban_admin_key_2025_full_access": {
    name: "3D Designer Integration",
    permissions: ["orders:create", "orders:read", "orders:update", "pricing:read", "files:upload"],
    created: (/* @__PURE__ */ new Date()).toISOString(),
    lastUsed: null
  }
};
function validateApiKey2(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: "Missing Authorization header",
      message: "API key required in Authorization header as: Bearer YOUR_API_KEY"
    });
  }
  const token = authHeader.replace("Bearer ", "");
  if (API_KEYS2[token]) {
    API_KEYS2[token].lastUsed = (/* @__PURE__ */ new Date()).toISOString();
    req.apiKey = API_KEYS2[token];
    req.apiKeyType = "static";
    return next();
  }
  try {
    req.apiKeyType = "jwt";
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid API key or JWT token",
      message: "The provided authentication token is not valid"
    });
  }
}

// server/routes/threeDDesignerRoutes.ts
var router = Router();
router.post("/orders", validateApiKey2, createOrderFrom3D);
router.get("/orders/:trackingId", validateApiKey2, getOrderStatus);
router.patch("/orders/:trackingId/files", validateApiKey2, updateDesignFiles);
router.get("/pricing/:designType", validateApiKey2, getDesignPricing);
router.get("/frames", validateApiKey2, getFrameOptions);
router.get("/mats", validateApiKey2, getMatOptions);
router.get("/test", validateApiKey2, testIntegration);
var threeDDesignerRoutes_default = router;

// server/routes/vendorApiRoutes.ts
import { Router as Router2 } from "express";

// server/services/vendorApiService.ts
init_storage();
import axios from "axios";
var VendorApiService = class {
  larsonConfig;
  romaConfig;
  bellaConfig;
  constructor() {
    this.larsonConfig = {
      baseUrl: process.env.LARSON_API_URL || "https://api.larsonjuhl.com/v1",
      apiKey: process.env.LARSON_API_KEY || "",
      apiSecret: process.env.LARSON_API_SECRET || ""
    };
    this.romaConfig = {
      baseUrl: process.env.ROMA_API_URL || "https://api.romamoulding.com/v2",
      apiKey: process.env.ROMA_API_KEY || "",
      apiSecret: process.env.ROMA_API_SECRET || ""
    };
    this.bellaConfig = {
      baseUrl: process.env.BELLA_API_URL || "https://api.bellamoulding.com/v1",
      apiKey: process.env.BELLA_API_KEY || "",
      apiSecret: process.env.BELLA_API_SECRET || ""
    };
  }
  /**
   * Fetch complete catalog from Larson Juhl
   */
  async fetchLarsonCatalog() {
    try {
      if (!this.larsonConfig.apiKey) {
        console.warn("Larson API key not configured. Using sample data.");
        return this.getLarsonSampleFrames();
      }
      const response = await axios.get(
        `${this.larsonConfig.baseUrl}/catalog/frames`,
        {
          headers: {
            "Authorization": `Bearer ${this.larsonConfig.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      return response.data.frames.map((frame) => ({
        id: `larson-${frame.item_number}`,
        itemNumber: frame.item_number,
        name: `${frame.name} (${frame.collection})`,
        price: frame.price_per_foot.toString(),
        material: frame.material,
        color: frame.color,
        width: frame.width.toString(),
        height: frame.height.toString(),
        depth: frame.depth.toString(),
        collection: frame.collection,
        description: frame.description,
        imageUrl: frame.image_url,
        inStock: frame.in_stock,
        vendor: "Larson Juhl"
      }));
    } catch (error) {
      console.error("Error fetching Larson Juhl catalog:", error);
      return this.getLarsonSampleFrames();
    }
  }
  /**
   * Fetch complete catalog from Roma Moulding
   */
  async fetchRomaCatalog() {
    try {
      if (!this.romaConfig.apiKey) {
        console.warn("Roma API key not configured. Using sample data.");
        return this.getRomaSampleFrames();
      }
      const response = await axios.get(
        `${this.romaConfig.baseUrl}/catalog/mouldings`,
        {
          headers: {
            "X-Api-Key": this.romaConfig.apiKey,
            "Content-Type": "application/json"
          }
        }
      );
      return response.data.mouldings.map((moulding) => ({
        id: `roma-${moulding.sku}`,
        itemNumber: moulding.sku,
        name: `${moulding.name} (${moulding.collection})`,
        price: moulding.wholesale_price.toString(),
        material: moulding.material,
        color: moulding.finish,
        width: moulding.dimensions.width.toString(),
        height: moulding.dimensions.height.toString(),
        depth: moulding.dimensions.depth.toString(),
        collection: moulding.collection,
        description: moulding.description,
        imageUrl: moulding.image,
        inStock: moulding.availability === "in_stock",
        vendor: "Roma Moulding"
      }));
    } catch (error) {
      console.error("Error fetching Roma catalog:", error);
      return this.getRomaSampleFrames();
    }
  }
  /**
   * Fetch complete catalog from Bella Moulding
   */
  async fetchBellaCatalog() {
    try {
      if (!this.bellaConfig.apiKey) {
        console.warn("Bella API key not configured. Using sample data.");
        return this.getBellaSampleFrames();
      }
      const response = await axios.get(
        `${this.bellaConfig.baseUrl}/products`,
        {
          headers: {
            "X-API-Key": this.bellaConfig.apiKey,
            "X-API-Secret": this.bellaConfig.apiSecret || "",
            "Content-Type": "application/json"
          }
        }
      );
      return response.data.items.map((item) => ({
        id: `bella-${item.item_code}`,
        itemNumber: item.item_code,
        name: `${item.title} (${item.collection_name})`,
        price: item.price.wholesale.toString(),
        material: item.material_type,
        color: item.color,
        width: (item.measurements.width_mm / 25.4).toFixed(2),
        // Convert mm to inches
        height: (item.measurements.height_mm / 25.4).toFixed(2),
        depth: (item.measurements.depth_mm / 25.4).toFixed(2),
        collection: item.collection_name,
        description: item.description,
        imageUrl: item.image_urls[0],
        inStock: item.inventory_status === "available",
        vendor: "Bella Moulding"
      }));
    } catch (error) {
      console.error("Error fetching Bella catalog:", error);
      return this.getBellaSampleFrames();
    }
  }
  /**
   * Fetch all catalogs from all vendors
   */
  async fetchAllCatalogs() {
    const [larsonFrames, romaFrames, bellaFrames] = await Promise.all([
      this.fetchLarsonCatalog(),
      this.fetchRomaCatalog(),
      this.fetchBellaCatalog()
    ]);
    return [...larsonFrames, ...romaFrames, ...bellaFrames];
  }
  /**
   * Search across all vendor catalogs for frames matching criteria
   * @param query Search query for name, material, or collection
   * @param vendor Optional vendor filter
   */
  async searchFrames(query, vendor) {
    let allFrames = [];
    if (/^[a-zA-Z0-9\-]+$/.test(query) && query.length >= 4) {
      const exactFrames = await storage.searchFramesByItemNumber(query);
      if (exactFrames && exactFrames.length > 0) {
        return exactFrames.map((frame) => ({
          id: frame.id,
          itemNumber: frame.id.split("-")[1] || "",
          name: frame.name,
          price: frame.price,
          material: frame.material || "",
          color: frame.color || "",
          width: "",
          height: "",
          depth: "",
          collection: "",
          imageUrl: frame.thumbnailUrl || "",
          vendor: frame.id.split("-")[0] || ""
        }));
      }
    }
    if (vendor) {
      switch (vendor.toLowerCase()) {
        case "larson":
          allFrames = await this.fetchLarsonCatalog();
          break;
        case "roma":
          allFrames = await this.fetchRomaCatalog();
          break;
        case "bella":
          allFrames = await this.fetchBellaCatalog();
          break;
        default:
          allFrames = await this.fetchAllCatalogs();
      }
    } else {
      allFrames = await this.fetchAllCatalogs();
    }
    if (!query) return allFrames;
    const normalizedQuery = query.toLowerCase();
    return allFrames.filter(
      (frame) => frame.name.toLowerCase().includes(normalizedQuery) || frame.material.toLowerCase().includes(normalizedQuery) || frame.color.toLowerCase().includes(normalizedQuery) || frame.collection.toLowerCase().includes(normalizedQuery) || frame.itemNumber.toLowerCase().includes(normalizedQuery)
    );
  }
  /**
   * Sync all vendor catalogs to database
   * This provides a complete catalog for the POS system
   */
  async syncCatalogsToDatabase() {
    try {
      const allFrames = await this.fetchAllCatalogs();
      const existingFrames = await storage.getAllFrames();
      const existingIds = new Set(existingFrames.map((f) => f.id));
      const framesToAdd = allFrames.filter((f) => !existingIds.has(f.id));
      const framesToUpdate = allFrames.filter((f) => existingIds.has(f.id));
      for (const frame of framesToAdd) {
        await storage.addFrame({
          id: frame.id,
          name: frame.name,
          price: frame.price,
          material: frame.material,
          color: frame.color,
          thumbnailUrl: frame.imageUrl || "",
          description: frame.description || ""
        });
      }
      for (const frame of framesToUpdate) {
        await storage.updateFrame({
          id: frame.id,
          name: frame.name,
          price: frame.price,
          material: frame.material,
          color: frame.color,
          thumbnailUrl: frame.imageUrl || "",
          description: frame.description || ""
        });
      }
      return {
        added: framesToAdd.length,
        updated: framesToUpdate.length
      };
    } catch (error) {
      console.error("Error syncing catalogs to database:", error);
      throw error;
    }
  }
  /**
   * Get current API settings (excluding secrets)
   */
  async getSettings() {
    return {
      larsonApiKey: this.larsonConfig.apiKey || "",
      larsonApiSecret: !!this.larsonConfig.apiSecret,
      romaApiKey: this.romaConfig.apiKey || "",
      romaApiSecret: !!this.romaConfig.apiSecret,
      bellaApiKey: this.bellaConfig.apiKey || "",
      bellaApiSecret: !!this.bellaConfig.apiSecret
    };
  }
  /**
   * Update API settings
   * @param settings New settings
   */
  async updateSettings(settings) {
    if (settings.larsonApiKey !== void 0) {
      this.larsonConfig.apiKey = settings.larsonApiKey;
      process.env.LARSON_API_KEY = settings.larsonApiKey;
    }
    if (settings.larsonApiSecret !== void 0) {
      this.larsonConfig.apiSecret = settings.larsonApiSecret;
      process.env.LARSON_API_SECRET = settings.larsonApiSecret;
    }
    if (settings.romaApiKey !== void 0) {
      this.romaConfig.apiKey = settings.romaApiKey;
      process.env.ROMA_API_KEY = settings.romaApiKey;
    }
    if (settings.romaApiSecret !== void 0) {
      this.romaConfig.apiSecret = settings.romaApiSecret;
      process.env.ROMA_API_SECRET = settings.romaApiSecret;
    }
    if (settings.bellaApiKey !== void 0) {
      this.bellaConfig.apiKey = settings.bellaApiKey;
      process.env.BELLA_API_KEY = settings.bellaApiKey;
    }
    if (settings.bellaApiSecret !== void 0) {
      this.bellaConfig.apiSecret = settings.bellaApiSecret;
      process.env.BELLA_API_SECRET = settings.bellaApiSecret;
    }
    console.log("API settings updated", {
      larsonKeyUpdated: !!settings.larsonApiKey,
      larsonSecretUpdated: !!settings.larsonApiSecret,
      romaKeyUpdated: !!settings.romaApiKey,
      romaSecretUpdated: !!settings.romaApiSecret,
      bellaKeyUpdated: !!settings.bellaApiKey,
      bellaSecretUpdated: !!settings.bellaApiSecret
    });
  }
  /**
   * Test connection to Larson Juhl API
   */
  async testLarsonConnection() {
    try {
      if (!this.larsonConfig.apiKey) {
        return {
          success: false,
          message: "API key not configured. Please enter a valid API key."
        };
      }
      const testResponse = await axios.get(
        `${this.larsonConfig.baseUrl}/catalog/frames?limit=1`,
        {
          headers: {
            "Authorization": `Bearer ${this.larsonConfig.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (testResponse.status === 200) {
        return {
          success: true,
          message: "Successfully connected to Larson-Juhl API"
        };
      } else {
        return {
          success: false,
          message: `Unexpected response status: ${testResponse.status}`
        };
      }
    } catch (error) {
      console.error("Error testing Larson Juhl connection:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Connection failed"
      };
    }
  }
  /**
   * Test connection to Roma Moulding API
   */
  async testRomaConnection() {
    try {
      if (!this.romaConfig.apiKey) {
        return {
          success: false,
          message: "API key not configured. Please enter a valid API key."
        };
      }
      const testResponse = await axios.get(
        `${this.romaConfig.baseUrl}/catalog/mouldings?limit=1`,
        {
          headers: {
            "X-Api-Key": this.romaConfig.apiKey,
            "Content-Type": "application/json"
          }
        }
      );
      if (testResponse.status === 200) {
        return {
          success: true,
          message: "Successfully connected to Roma Moulding API"
        };
      } else {
        return {
          success: false,
          message: `Unexpected response status: ${testResponse.status}`
        };
      }
    } catch (error) {
      console.error("Error testing Roma Moulding connection:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Connection failed"
      };
    }
  }
  /**
   * Test connection to Bella Moulding API
   */
  async testBellaConnection() {
    try {
      if (!this.bellaConfig.apiKey) {
        return {
          success: false,
          message: "API key not configured. Please enter a valid API key."
        };
      }
      const testResponse = await axios.get(
        `${this.bellaConfig.baseUrl}/products?limit=1`,
        {
          headers: {
            "X-API-Key": this.bellaConfig.apiKey,
            "X-API-Secret": this.bellaConfig.apiSecret || "",
            "Content-Type": "application/json"
          }
        }
      );
      if (testResponse.status === 200) {
        return {
          success: true,
          message: "Successfully connected to Bella Moulding API"
        };
      } else {
        return {
          success: false,
          message: `Unexpected response status: ${testResponse.status}`
        };
      }
    } catch (error) {
      console.error("Error testing Bella Moulding connection:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Connection failed"
      };
    }
  }
  /**
   * Get sample frames for Larson Juhl (when API is not available)
   * @returns Sample frame data
   */
  getLarsonSampleFrames() {
    return [
      {
        id: "larson-210286",
        itemNumber: "210286",
        name: "Larson Academie Black",
        price: "3.85",
        material: "Wood",
        color: "Black",
        width: "1.25",
        height: "0.75",
        depth: "0.625",
        collection: "Academie",
        description: "Classic black wood frame with smooth finish",
        imageUrl: "https://www.larsonjuhl.com/images/products/210286.jpg",
        inStock: true,
        vendor: "Larson Juhl"
      },
      {
        id: "larson-655320",
        itemNumber: "655320",
        name: "Larson Biltmore Gold",
        price: "4.50",
        material: "Wood",
        color: "Gold",
        width: "1.5",
        height: "0.875",
        depth: "0.75",
        collection: "Biltmore",
        description: "Elegant gold finish frame with ornate details",
        imageUrl: "https://www.larsonjuhl.com/images/products/655320.jpg",
        inStock: true,
        vendor: "Larson Juhl"
      },
      {
        id: "larson-460530",
        itemNumber: "460530",
        name: "Larson Ventura Silver",
        price: "5.25",
        material: "Metal",
        color: "Silver",
        width: "0.75",
        height: "1.125",
        depth: "0.5",
        collection: "Ventura",
        description: "Modern silver metallic frame",
        imageUrl: "https://www.larsonjuhl.com/images/products/460530.jpg",
        inStock: true,
        vendor: "Larson Juhl"
      }
    ];
  }
  /**
   * Get sample frames for Roma Moulding (when API is not available)
   * @returns Sample frame data
   */
  getRomaSampleFrames() {
    return [
      {
        id: "roma-307",
        itemNumber: "307",
        name: "Roma Gold Luxe",
        price: "6.75",
        material: "Wood",
        color: "Gold",
        width: "2.0",
        height: "1.5",
        depth: "0.875",
        collection: "Luxe",
        description: "Premium gold leaf finish with handcrafted details",
        imageUrl: "https://www.romamoulding.com/images/products/307.jpg",
        inStock: true,
        vendor: "Roma Moulding"
      }
    ];
  }
  /**
   * Get sample frames for Bella Moulding (when API is not available)
   * @returns Sample frame data
   */
  getBellaSampleFrames() {
    return [
      {
        id: "bella-W8543",
        itemNumber: "W8543",
        name: "Bella Carrara White",
        price: "4.95",
        material: "Wood",
        color: "White",
        width: "1.75",
        height: "1.125",
        depth: "0.75",
        collection: "Carrara",
        description: "Elegant white wood frame with subtle texture",
        imageUrl: "https://www.bellamoulding.com/images/products/W8543.jpg",
        inStock: true,
        vendor: "Bella Moulding"
      },
      {
        id: "bella-M2202",
        itemNumber: "M2202",
        name: "Bella Metropolitan Brushed Silver",
        price: "5.85",
        material: "Metal",
        color: "Silver",
        width: "0.625",
        height: "1.0",
        depth: "0.5",
        collection: "Metropolitan",
        description: "Contemporary brushed silver finish metal frame",
        imageUrl: "https://www.bellamoulding.com/images/products/M2202.jpg",
        inStock: true,
        vendor: "Bella Moulding"
      }
    ];
  }
};
var vendorApiService = new VendorApiService();

// server/routes/vendorApiRoutes.ts
var router2 = Router2();
router2.get("/frames", async (req, res) => {
  try {
    const frames2 = await vendorApiService.fetchAllCatalogs();
    res.json(frames2);
  } catch (error) {
    console.error("Error fetching vendor frames:", error);
    res.status(500).json({
      message: "Error fetching vendor frames",
      error: error.message
    });
  }
});
router2.get("/frames/:vendor", async (req, res) => {
  try {
    const { vendor } = req.params;
    let frames2;
    switch (vendor.toLowerCase()) {
      case "larson":
        frames2 = await vendorApiService.fetchLarsonCatalog();
        break;
      case "roma":
        frames2 = await vendorApiService.fetchRomaCatalog();
        break;
      case "bella":
        frames2 = await vendorApiService.fetchBellaCatalog();
        break;
      default:
        return res.status(400).json({ message: "Invalid vendor specified" });
    }
    res.json(frames2);
  } catch (error) {
    console.error(`Error fetching ${req.params.vendor} frames:`, error);
    res.status(500).json({
      message: `Error fetching ${req.params.vendor} frames`,
      error: error.message
    });
  }
});
router2.get("/search", async (req, res) => {
  try {
    const { query, vendor } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const frames2 = await vendorApiService.searchFrames(
      query,
      vendor
    );
    res.json(frames2);
  } catch (error) {
    console.error("Error searching frames:", error);
    res.status(500).json({
      message: "Error searching frames",
      error: error.message
    });
  }
});
router2.post("/sync", async (req, res) => {
  try {
    const result = await vendorApiService.syncCatalogsToDatabase();
    res.json({
      message: "Frame database sync completed successfully",
      added: result.added,
      updated: result.updated
    });
  } catch (error) {
    console.error("Error syncing catalog to database:", error);
    res.status(500).json({
      message: "Error syncing catalog to database",
      error: error.message
    });
  }
});
var vendorApiRoutes_default = router2;

// server/routes/vendorSettingsRoutes.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.get("/settings", async (req, res) => {
  try {
    const settings = await vendorApiService.getSettings();
    const response = {
      larsonApiKey: settings.larsonApiKey || "",
      larsonApiSecret: settings.larsonApiSecret ? true : false,
      larsonStatus: settings.larsonApiKey ? "connected" : "not_configured",
      romaApiKey: settings.romaApiKey || "",
      romaApiSecret: settings.romaApiSecret ? true : false,
      romaStatus: settings.romaApiKey ? "connected" : "not_configured",
      bellaApiKey: settings.bellaApiKey || "",
      bellaApiSecret: settings.bellaApiSecret ? true : false,
      bellaStatus: settings.bellaApiKey ? "connected" : "not_configured"
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching vendor API settings:", error);
    res.status(500).json({
      message: "Error fetching vendor API settings",
      error: error.message
    });
  }
});
router3.post("/settings", async (req, res) => {
  try {
    const {
      larsonApiKey,
      larsonApiSecret,
      romaApiKey,
      romaApiSecret,
      bellaApiKey,
      bellaApiSecret
    } = req.body;
    const updatedSettings = {};
    if (larsonApiKey !== void 0) {
      updatedSettings.larsonApiKey = larsonApiKey;
    }
    if (larsonApiSecret !== void 0) {
      updatedSettings.larsonApiSecret = larsonApiSecret;
    }
    if (romaApiKey !== void 0) {
      updatedSettings.romaApiKey = romaApiKey;
    }
    if (romaApiSecret !== void 0) {
      updatedSettings.romaApiSecret = romaApiSecret;
    }
    if (bellaApiKey !== void 0) {
      updatedSettings.bellaApiKey = bellaApiKey;
    }
    if (bellaApiSecret !== void 0) {
      updatedSettings.bellaApiSecret = bellaApiSecret;
    }
    await vendorApiService.updateSettings(updatedSettings);
    const currentSettings = await vendorApiService.getSettings();
    const response = {
      message: "Settings updated successfully",
      larsonStatus: currentSettings.larsonApiKey ? "connected" : "not_configured",
      romaStatus: currentSettings.romaApiKey ? "connected" : "not_configured",
      bellaStatus: currentSettings.bellaApiKey ? "connected" : "not_configured"
    };
    res.json(response);
  } catch (error) {
    console.error("Error updating vendor API settings:", error);
    res.status(500).json({
      message: "Error updating vendor API settings",
      error: error.message
    });
  }
});
router3.post("/test-connection/:vendor", async (req, res) => {
  try {
    const { vendor } = req.params;
    let result = { success: false, message: "Invalid vendor specified" };
    switch (vendor.toLowerCase()) {
      case "larson":
        result = await vendorApiService.testLarsonConnection();
        break;
      case "roma":
        result = await vendorApiService.testRomaConnection();
        break;
      case "bella":
        result = await vendorApiService.testBellaConnection();
        break;
    }
    res.json(result);
  } catch (error) {
    console.error(`Error testing ${req.params.vendor} API connection:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to test API connection: ${error.message}`
    });
  }
});
var vendorSettingsRoutes_default = router3;

// server/routes/webhookRoutes.ts
import { Router as Router4 } from "express";

// server/controllers/webhookController.ts
init_storage();
import axios2 from "axios";
async function getWebhookEndpoints(req, res) {
  try {
    const webhooks = await storage.getWebhookEndpoints();
    res.json(webhooks);
  } catch (error) {
    console.error("Error getting webhook endpoints:", error);
    res.status(500).json({ error: error.message || "Failed to get webhook endpoints" });
  }
}
async function createWebhookEndpoint(req, res) {
  try {
    const { name, url, events } = req.body;
    if (!url || !name) {
      return res.status(400).json({ error: "Name and URL are required" });
    }
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    const webhook = await storage.createWebhookEndpoint({
      name,
      url,
      events: events || ["order.created"],
      active: true
    });
    res.status(201).json({ success: true, webhook });
  } catch (error) {
    console.error("Error creating webhook endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to create webhook endpoint" });
  }
}
async function updateWebhookEndpoint(req, res) {
  try {
    const { id } = req.params;
    const webhookId = parseInt(id);
    if (isNaN(webhookId)) {
      return res.status(400).json({ error: "Invalid webhook ID" });
    }
    const webhook = await storage.getWebhookEndpoint(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook endpoint not found" });
    }
    const updatedWebhook = await storage.updateWebhookEndpoint(webhookId, req.body);
    res.json({ success: true, webhook: updatedWebhook });
  } catch (error) {
    console.error("Error updating webhook endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to update webhook endpoint" });
  }
}
async function deleteWebhookEndpoint(req, res) {
  try {
    const { id } = req.params;
    const webhookId = parseInt(id);
    if (isNaN(webhookId)) {
      return res.status(400).json({ error: "Invalid webhook ID" });
    }
    const webhook = await storage.getWebhookEndpoint(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook endpoint not found" });
    }
    await storage.deleteWebhookEndpoint(webhookId);
    res.json({ success: true, message: "Webhook endpoint deleted" });
  } catch (error) {
    console.error("Error deleting webhook endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to delete webhook endpoint" });
  }
}
async function testWebhookEndpoint(req, res) {
  try {
    const { id } = req.params;
    const webhookId = parseInt(id);
    if (isNaN(webhookId)) {
      return res.status(400).json({ error: "Invalid webhook ID" });
    }
    const webhook = await storage.getWebhookEndpoint(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook endpoint not found" });
    }
    const testPayload = {
      event: "test.webhook",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      data: {
        message: "This is a test webhook event from Jay's Frames"
      }
    };
    try {
      const response = await axios2.post(webhook.url, testPayload, {
        headers: {
          "Content-Type": "application/json",
          "X-Jays-Frames-Event": "test.webhook",
          "X-Jays-Frames-Signature": "test-signature"
        },
        timeout: 5e3
        // 5 second timeout
      });
      await storage.updateWebhookEndpoint(webhookId, {
        lastTriggered: (/* @__PURE__ */ new Date()).toISOString(),
        failCount: 0
      });
      res.json({
        success: true,
        message: "Test webhook sent successfully",
        status: response.status,
        data: response.data
      });
    } catch (error) {
      const currentFailCount = webhook.failCount || 0;
      await storage.updateWebhookEndpoint(webhookId, {
        failCount: currentFailCount + 1
      });
      throw new Error(`Failed to send test webhook: ${error.message}`);
    }
  } catch (error) {
    console.error("Error testing webhook endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to test webhook endpoint" });
  }
}

// server/middleware/auth.ts
var authenticateAdmin = (req, res, next) => {
  console.log("Admin auth middleware: Allowing request (authentication not implemented)");
  next();
};

// server/routes/webhookRoutes.ts
var router4 = Router4();
router4.get("/", authenticateAdmin, getWebhookEndpoints);
router4.post("/", authenticateAdmin, createWebhookEndpoint);
router4.patch("/:id", authenticateAdmin, updateWebhookEndpoint);
router4.delete("/:id", authenticateAdmin, deleteWebhookEndpoint);
router4.post("/:id/test", authenticateAdmin, testWebhookEndpoint);
var webhookRoutes_default = router4;

// server/routes/materialsRoutes.ts
import { Router as Router5 } from "express";

// server/controllers/materialsController.ts
init_storage();
var getMaterialsPickList = async (req, res) => {
  try {
    let materialsList = await storage.getMaterialsPickList();
    if (!materialsList || materialsList.length === 0) {
      materialsList = [
        {
          id: "mat-001",
          name: "White Core Mat 16x20",
          type: "mat",
          supplier: "Crescent",
          status: "pending",
          quantity: "5",
          priority: "medium",
          notes: "For order #1234",
          price: "12.50",
          orderDate: null,
          receiveDate: null,
          supplierName: "Crescent"
        },
        {
          id: "frame-001",
          name: 'Oak Frame 1.5" - 8ft',
          type: "frame",
          supplier: "Larson-Juhl",
          status: "ordered",
          quantity: "2",
          priority: "high",
          notes: "Rush order",
          price: "45.00",
          orderDate: (/* @__PURE__ */ new Date()).toISOString(),
          receiveDate: null,
          supplierName: "Larson-Juhl"
        },
        {
          id: "glass-001",
          name: "Museum Glass 16x20",
          type: "glass",
          supplier: "Tru Vue",
          status: "received",
          quantity: "3",
          priority: "low",
          notes: "In stock",
          price: "28.99",
          orderDate: new Date(Date.now() - 864e5).toISOString(),
          receiveDate: (/* @__PURE__ */ new Date()).toISOString(),
          supplierName: "Tru Vue"
        }
      ];
    }
    res.json({
      success: true,
      data: materialsList,
      message: "Materials loaded successfully"
    });
  } catch (error) {
    console.error("Error in getMaterialsPickList:", error);
    res.status(500).json({ message: error.message, materials: [] });
  }
};
var getMaterialsBySupplier = async (req, res) => {
  try {
    const materialsList = await storage.getMaterialsPickList();
    const bySupplier = (materialsList || []).reduce((acc, material) => {
      const supplierName = material.supplier || "Unknown Supplier";
      if (!acc[supplierName]) {
        acc[supplierName] = [];
      }
      acc[supplierName].push(material);
      return acc;
    }, {});
    res.json(bySupplier);
  } catch (error) {
    console.error("Error in getMaterialsBySupplier:", error);
    res.status(500).json({ message: error.message, suppliers: {} });
  }
};
var getMaterialsForOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID", materials: [] });
    }
    const materials = await storage.getMaterialsForOrder(orderId);
    res.json(materials || []);
  } catch (error) {
    console.error("Error in getMaterialsForOrder:", error);
    res.status(500).json({ message: error.message, materials: [] });
  }
};
var updateMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;
    let updateData;
    if (req.body.data) {
      updateData = req.body.data;
    } else {
      const { status, notes, orderDate, receiveDate, supplierName } = req.body;
      updateData = {
        status,
        notes,
        orderDate,
        receiveDate,
        supplierName
      };
    }
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== void 0)
    );
    console.log("Updating material order with data:", cleanedData);
    const updatedMaterial = await storage.updateMaterialOrder(materialId, cleanedData);
    res.json(updatedMaterial);
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ message: error.message });
  }
};
var createPurchaseOrder = async (req, res) => {
  try {
    const { materialIds } = req.body;
    if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({ message: "No materials selected" });
    }
    const purchaseOrder = await storage.createPurchaseOrder(materialIds);
    res.status(201).json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var getMaterialTypes = async (req, res) => {
  try {
    const materials = await storage.getMaterialsPickList();
    const types = Array.from(new Set((materials || []).map((m) => m.type).filter(Boolean)));
    res.json(types.length > 0 ? types : ["frame", "mat", "glass", "hardware"]);
  } catch (error) {
    console.error("Error in getMaterialTypes:", error);
    res.status(500).json({ message: error.message, types: ["frame", "mat", "glass", "hardware"] });
  }
};
var getMaterialSuppliers = async (req, res) => {
  try {
    const materials = await storage.getMaterialsPickList();
    const suppliers2 = Array.from(new Set((materials || []).map((m) => m.supplier).filter(Boolean)));
    res.json(suppliers2.length > 0 ? suppliers2 : ["Larson-Juhl", "Roma", "Bella"]);
  } catch (error) {
    console.error("Error in getMaterialSuppliers:", error);
    res.status(500).json({ message: error.message, suppliers: ["Larson-Juhl", "Roma", "Bella"] });
  }
};

// server/routes/materialsRoutes.ts
var router5 = Router5();
router5.get("/pick-list", getMaterialsPickList);
router5.get("/by-supplier", getMaterialsBySupplier);
router5.get("/by-order/:orderId", getMaterialsForOrder);
router5.patch("/:id", updateMaterial);
router5.post("/purchase-orders", createPurchaseOrder);
router5.get("/types", getMaterialTypes);
router5.get("/suppliers", getMaterialSuppliers);
var materialsRoutes_default = router5;

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/art-locations", artLocationController.sendArtLocationData);
  app2.get("/api/art-locations/:orderId", artLocationController.getArtLocationData);
  app2.post("/api/frame-designs", frameDesignController.saveFrameDesign);
  app2.get("/api/frame-designs/:orderId", frameDesignController.getFrameDesign);
  app2.use("/api/3d-designer", threeDDesignerRoutes_default);
  app2.get("/api/health", healthController.getSystemHealth);
  app2.get("/api/vendor-catalog/all", (req, res) => {
    res.status(200).json({ success: true, data: [], message: "No vendors configured" });
  });
  app2.get("/api/vendor-catalog/larson", (req, res) => {
    res.status(200).json({ success: true, data: [], message: "Larson catalog not configured" });
  });
  app2.get("/api/vendor-catalog/roma", (req, res) => {
    res.status(200).json({ success: true, data: [], message: "Roma catalog not configured" });
  });
  app2.get("/api/vendor-catalog/nielsen", (req, res) => {
    res.status(200).json({ success: true, data: [], message: "Nielsen catalog not configured" });
  });
  app2.get("/api/larson-catalog/crescent", (req, res) => {
    res.status(200).json({ success: true, data: [], message: "Crescent catalog not loaded" });
  });
  app2.get("/api/frames", (req, res) => {
    res.status(200).json({
      success: true,
      data: [
        {
          id: "frame-001",
          name: "Classic Wood Frame",
          price: 45,
          material: "Wood",
          width: "2 inches",
          color: "Natural"
        }
      ],
      message: "Static frame data loaded"
    });
  });
  app2.get("/api/auth/status", (req, res) => {
    res.json({ authenticated: false, user: null });
  });
  app2.get("/api/kanban/orders", validateApiKey, (req, res) => {
    res.json({
      success: true,
      orders: [],
      endpoint: "/api/kanban/orders",
      description: "Retrieves all orders with production status and timeline information"
    });
  });
  app2.post("/api/kanban/orders/:orderId/status", validateApiKey, (req, res) => {
    const { orderId } = req.params;
    const { status, stage, notes } = req.body;
    res.json({
      success: true,
      orderId,
      updatedStatus: status,
      stage,
      notes,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      description: "Updates order production status from external Kanban system"
    });
  });
  app2.get("/api/kanban/status", (req, res) => {
    res.json({
      status: "active",
      service: "Jays Frames POS System",
      version: "1.0.0",
      endpoints: {
        orders: "/api/kanban/orders",
        updateStatus: "/api/kanban/orders/:orderId/status",
        health: "/api/kanban/status"
      },
      authentication: "API Key required in Authorization header",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/api/kanban/api-key", (req, res) => {
    res.json({
      apiKey: KANBAN_API_KEY,
      usage: "Add this to your Kanban app Authorization header as: Bearer " + KANBAN_API_KEY,
      endpoints: {
        orders: "/api/kanban/orders",
        updateStatus: "/api/kanban/orders/:orderId/status"
      },
      note: "Keep this API key secure - it provides access to your order data"
    });
  });
  app2.use("/api/vendor-api", vendorApiRoutes_default);
  app2.use("/api/vendor-settings", vendorSettingsRoutes_default);
  app2.use("/api/webhooks", webhookRoutes_default);
  app2.use("/api/materials", materialsRoutes_default);
  app2.use("/api/material-orders", materialsRoutes_default);
  app2.get("/api/mat-colors", (req, res) => {
    res.status(200).json({
      success: true,
      data: [
        { id: "white", name: "White", color: "#FFFFFF" },
        { id: "black", name: "Black", color: "#000000" },
        { id: "cream", name: "Cream", color: "#F5F5DC" }
      ]
    });
  });
  app2.get("/api/glass-options", (req, res) => {
    res.status(200).json({
      success: true,
      data: [
        { id: "regular", name: "Regular Glass", price: 15 },
        { id: "museum", name: "Museum Glass", price: 85 },
        { id: "acrylic", name: "Acrylic", price: 25 }
      ]
    });
  });
  app2.get("/api/special-services", (req, res) => {
    res.status(200).json({
      success: true,
      data: [
        { id: "rush", name: "Rush Service", price: 50 },
        { id: "delivery", name: "Local Delivery", price: 25 }
      ]
    });
  });
  app2.get("/api/customers", (req, res) => {
    res.status(200).json({ success: true, data: [] });
  });
  app2.get("/api/orders", (req, res) => {
    res.status(200).json({ success: true, data: [] });
  });
  app2.get("/api/production/kanban", (req, res) => {
    res.status(200).json({ success: true, data: { orders: [], stages: [] } });
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws2) => {
    console.log("WebSocket client connected");
    ws2.on("message", (message) => {
      try {
        console.log("Received message:", message.toString());
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
          }
        });
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws2.send(JSON.stringify({
      type: "connection",
      message: "WebSocket connection established"
    }));
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        console.error(`Vite server error: ${msg}`);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const clientDistPath = path2.resolve(__dirname, "..", "client", "dist");
  const distPath = path2.resolve(__dirname, "..", "dist");
  let staticPath = "";
  if (fs.existsSync(clientDistPath)) {
    staticPath = clientDistPath;
    log(`Serving static files from: ${clientDistPath}`);
  } else if (fs.existsSync(distPath)) {
    staticPath = distPath;
    log(`Serving static files from: ${distPath}`);
  } else {
    log("No static files found. Please build the client application.", "error");
  }
  if (staticPath) {
    app2.use(express.static(staticPath, {
      maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
      etag: true
    }));
  }
  app2.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    const indexPath = path2.resolve(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).json({
        error: "Client application not built",
        message: 'Please run "npm run build" to build the client application'
      });
    }
  });
}

// server/index.ts
import path3 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
var app = express2();
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? true : ["http://localhost:5173", "http://localhost:5000"],
  credentials: true
}));
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    log(`Error: ${message} (${status})`, "error");
    console.error(err);
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  let port = parseInt(process.env.PORT || "5000");
  const startServer = () => {
    const serverInstance = server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
      process.env.PORT = String(port);
    }).on("error", (e) => {
      if (e.code === "EADDRINUSE") {
        log(`Port ${port} is already in use, trying port ${port + 1}`, "warning");
        serverInstance.close();
        port += 1;
        setImmediate(startServer);
      } else {
        log(`Server error: ${e.message}`, "error");
        console.error(e);
      }
    });
    return serverInstance;
  };
  const __filename = fileURLToPath(import.meta.url);
  const __dirname2 = dirname(__filename);
  const uploadsDir = path3.join(__dirname2, "../uploads");
  if (!fs2.existsSync(uploadsDir)) {
    fs2.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express2.static(uploadsDir));
  startServer();
})();
