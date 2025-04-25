import { 
  customers, type Customer, type InsertCustomer,
  frames, type Frame, type InsertFrame,
  matColors, type MatColor, type InsertMatColor,
  glassOptions, type GlassOption, type InsertGlassOption,
  specialServices, type SpecialService, type InsertSpecialService,
  orderGroups, type OrderGroup, type InsertOrderGroup,
  orders, type Order, type InsertOrder, type ProductionStatus,
  orderSpecialServices, type OrderSpecialService, type InsertOrderSpecialService,
  wholesaleOrders, type WholesaleOrder, type InsertWholesaleOrder,
  customerNotifications, type CustomerNotification, type InsertCustomerNotification,
  materialOrders, type MaterialOrder, type InsertMaterialOrder, type MaterialType, type MaterialOrderStatus,
  // Inventory system imports
  inventoryItems, type InventoryItem, type InsertInventoryItem,
  inventoryTransactions, type InventoryTransaction, type InsertInventoryTransaction,
  suppliers, type Supplier, type InsertSupplier,
  inventoryLocations, type InventoryLocation, type InsertInventoryLocation,
  inventoryCategories, type InventoryCategory,
  purchaseOrders, type PurchaseOrder, type InsertPurchaseOrder,
  purchaseOrderLines, type InsertPurchaseOrderLine,
  type MeasurementUnit
} from "@shared/schema";
import { frameCatalog } from "../client/src/data/frameCatalog";
import { matColorCatalog } from "../client/src/data/matColors";
import { glassOptionCatalog, specialServicesCatalog } from "../client/src/data/glassOptions";

/**
 * Determines an appropriate color for a frame based on material and name
 * @param {Frame} frame The frame to determine the color for
 * @returns {string} A hex color code
 */
function determineFrameColor(frame: Frame): string {
  const { material, name } = frame;
  const materialLower = material.toLowerCase();
  const nameLower = name.toLowerCase();
  
  // Gold frames
  if (materialLower.includes('gold') || nameLower.includes('gold')) {
    return '#D4AF37'; // Gold
  }
  
  // Silver or metal frames
  if (materialLower.includes('silver') || materialLower.includes('metal') || 
      nameLower.includes('silver') || nameLower.includes('metal') || 
      nameLower.includes('chrome') || nameLower.includes('steel')) {
    return '#C0C0C0'; // Silver
  }
  
  // Black frames
  if (materialLower.includes('black') || nameLower.includes('black') || 
      nameLower.includes('ebony') || nameLower.includes('onyx')) {
    return '#000000'; // True black for better contrast and visibility
  }
  
  // White frames
  if (materialLower.includes('white') || nameLower.includes('white')) {
    return '#F5F5F5'; // White
  }
  
  // Walnut frames
  if (materialLower.includes('walnut') || nameLower.includes('walnut')) {
    return '#5C4033'; // Walnut
  }
  
  // Cherry frames
  if (materialLower.includes('cherry') || nameLower.includes('cherry')) {
    return '#722F37'; // Cherry
  }
  
  // Oak frames
  if (materialLower.includes('oak') || nameLower.includes('oak')) {
    return '#D8BE75'; // Oak
  }
  
  // Mahogany frames
  if (materialLower.includes('mahogany') || nameLower.includes('mahogany')) {
    return '#4E2728'; // Mahogany
  }
  
  // Maple frames
  if (materialLower.includes('maple') || nameLower.includes('maple')) {
    return '#E8D4A9'; // Maple
  }
  
  // Default wood color for anything else
  return '#8B4513'; // Medium brown wood color
}

export interface IStorage {
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<Customer>): Promise<Customer>;

  // Frame methods
  getFrame(id: string): Promise<Frame | undefined>;
  getAllFrames(): Promise<Frame[]>;
  updateFrame(id: string, data: Partial<Frame>): Promise<Frame>;
  
  // Mat color methods
  getMatColor(id: string): Promise<MatColor | undefined>;
  getAllMatColors(): Promise<MatColor[]>;
  
  // Glass option methods
  getGlassOption(id: string): Promise<GlassOption | undefined>;
  getAllGlassOptions(): Promise<GlassOption[]>;
  
  // Special service methods
  getSpecialService(id: string): Promise<SpecialService | undefined>;
  getAllSpecialServices(): Promise<SpecialService[]>;
  
  // Order group methods
  getOrderGroup(id: number): Promise<OrderGroup | undefined>;
  getActiveOrderGroupByCustomer(customerId: number): Promise<OrderGroup | undefined>;
  getAllOrderGroups(): Promise<OrderGroup[]>;
  createOrderGroup(orderGroup: InsertOrderGroup): Promise<OrderGroup>;
  updateOrderGroup(id: number, data: Partial<OrderGroup>): Promise<OrderGroup>;
  getOrdersByGroupId(orderGroupId: number): Promise<Order[]>;
  getOrderGroupsByCustomerId(customerId: number): Promise<OrderGroup[]>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  
  // Order special service methods
  createOrderSpecialService(orderSpecialService: InsertOrderSpecialService): Promise<OrderSpecialService>;
  getOrderSpecialServices(orderId: number): Promise<SpecialService[]>;
  
  // Wholesale order methods
  getWholesaleOrder(id: number): Promise<WholesaleOrder | undefined>;
  getAllWholesaleOrders(): Promise<WholesaleOrder[]>;
  createWholesaleOrder(wholesaleOrder: InsertWholesaleOrder): Promise<WholesaleOrder>;
  updateWholesaleOrder(id: number, data: Partial<WholesaleOrder>): Promise<WholesaleOrder>;
  
  // Production Kanban methods
  getOrdersByProductionStatus(status: ProductionStatus): Promise<Order[]>;
  updateOrderProductionStatus(id: number, status: ProductionStatus): Promise<Order>;
  getOrdersForKanban(): Promise<Order[]>;
  scheduleOrderForProduction(id: number, estimatedDays: number): Promise<Order>;
  
  // Customer notification methods
  createCustomerNotification(notification: InsertCustomerNotification): Promise<CustomerNotification>;
  getCustomerNotifications(customerId: number): Promise<CustomerNotification[]>;
  getNotificationsByOrder(orderId: number): Promise<CustomerNotification[]>;
  
  // Material order methods
  getMaterialOrder(id: number): Promise<MaterialOrder | undefined>;
  getAllMaterialOrders(): Promise<MaterialOrder[]>;
  getMaterialOrdersByStatus(status: MaterialOrderStatus): Promise<MaterialOrder[]>;
  getMaterialOrdersByType(materialType: MaterialType): Promise<MaterialOrder[]>;
  createMaterialOrder(materialOrder: InsertMaterialOrder): Promise<MaterialOrder>;
  updateMaterialOrder(id: number, data: Partial<MaterialOrder>): Promise<MaterialOrder>;
  deleteMaterialOrder(id: number): Promise<void>;
  
  // Materials pick list methods
  getMaterialsPickList(): Promise<any[]>; // Materials for all orders that need processing
  getMaterialsForOrder(orderId: number): Promise<any[]>; // Materials for a specific order
  updateMaterialOrder(id: string, data: any): Promise<any>; // Update material status
  createPurchaseOrder(materialIds: string[]): Promise<any>; // Create a purchase order from materials
}

import { db } from "./db";
import { eq, desc, sql, asc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }
  
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        ...customer,
        createdAt: new Date()
      })
      .returning();
    return newCustomer;
  }
  
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(data)
      .where(eq(customers.id, id))
      .returning();
    
    if (!updatedCustomer) {
      throw new Error('Customer not found');
    }
    
    return updatedCustomer;
  }

  // Frame methods
  async getFrame(id: string): Promise<Frame | undefined> {
    console.log(`Storage: Getting frame with ID: ${id}`);
    try {
      // First try to get from the database
      const [frame] = await db.select().from(frames).where(eq(frames.id, id));
      
      // If found in database, enhance it with real images and color
      if (frame) {
        console.log(`Storage: Found frame in database: ${frame.name}`);
        
        // Determine color based on the frame's material and name
        let frameColor = determineFrameColor(frame);
        
        // Find a real catalog image based on manufacturer
        let enhancedImage = frame.catalogImage;
        let realCornerImage = frame.corner || '';
        let realEdgeImage = frame.edgeTexture || '';
        
        // Add more detailed wholesaler images for Larson-Juhl frames
        if (frame.manufacturer === 'Larson-Juhl') {
          // Extract the frame number from the ID (e.g., "larson-4512" -> "4512")
          const frameNumber = frame.id.split('-')[1];
          if (frameNumber) {
            // Use actual Larson-Juhl catalog images when available
            enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
            realCornerImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_corner.jpg`;
            realEdgeImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_prof.jpg`;
          }
        }
        
        // Add more detailed wholesaler images for Nielsen frames
        if (frame.manufacturer === 'Nielsen') {
          // Extract the frame number from the ID (e.g., "nielsen-71" -> "71")
          const frameNumber = frame.id.split('-')[1];
          if (frameNumber) {
            // Use actual Nielsen catalog images when available
            enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
            realCornerImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Corner.jpg`;
            realEdgeImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Edge.jpg`;
          }
        }
        
        // Return enhanced frame with proper images and color
        return {
          ...frame,
          catalogImage: enhancedImage,
          corner: realCornerImage,
          edgeTexture: realEdgeImage,
          color: frameColor
        };
      }
      
      // If not found in database, check catalog
      console.log(`Storage: Frame not found in database, checking catalog`);
      const catalogFrame = frameCatalog.find(f => f.id === id);
      if (catalogFrame) {
        console.log(`Storage: Found frame in catalog: ${catalogFrame.name}`);
        
        // Enhance the frame with real wholesaler images
        let enhancedImage = catalogFrame.catalogImage;
        let realCornerImage = catalogFrame.corner || '';
        let realEdgeImage = catalogFrame.edgeTexture || '';
        
        // Determine color based on the frame's material and name
        let frameColor = catalogFrame.color || determineFrameColor(catalogFrame);
        
        // Add more detailed wholesaler images for Larson-Juhl frames
        if (catalogFrame.manufacturer === 'Larson-Juhl') {
          // Extract the frame number from the ID (e.g., "larson-4512" -> "4512")
          const frameNumber = catalogFrame.id.split('-')[1];
          if (frameNumber) {
            // Use actual Larson-Juhl catalog images when available
            enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
            realCornerImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_corner.jpg`;
            realEdgeImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_prof.jpg`;
          }
        }
        
        // Add more detailed wholesaler images for Nielsen frames
        if (catalogFrame.manufacturer === 'Nielsen') {
          // Extract the frame number from the ID (e.g., "nielsen-71" -> "71")
          const frameNumber = catalogFrame.id.split('-')[1];
          if (frameNumber) {
            // Use actual Nielsen catalog images when available
            enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
            realCornerImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Corner.jpg`;
            realEdgeImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Edge.jpg`;
          }
        }
        
        // For database compatibility, don't include color in the object
        // saved to the database - only add it for UI rendering
        const dbSafeFrame = {
          ...catalogFrame,
          catalogImage: enhancedImage,
          corner: realCornerImage,
          edgeTexture: realEdgeImage
        };
        
        // Try to insert the database-safe frame
        console.log(`Storage: Inserting enhanced frame into database: ${dbSafeFrame.name}`);
        try {
          await db.insert(frames).values(dbSafeFrame);
          console.log(`Storage: Successfully inserted frame into database`);
        } catch (error) {
          console.error(`Storage: Error inserting frame into database:`, error);
          // Continue anyway, we'll return the enhanced frame
        }
        
        // Return enhanced frame with color added for UI rendering
        return {
          ...dbSafeFrame,
          color: frameColor
        };
      }
      
      console.log(`Storage: Frame not found in catalog`);
      return undefined;
    } catch (error) {
      console.error(`Storage: Error in getFrame(${id}):`, error);
      // Fallback to static catalog
      const catalogFrame = frameCatalog.find(f => f.id === id);
      if (catalogFrame) {
        // Add color based on frame material and name
        let frameColor = determineFrameColor(catalogFrame);
        let enhancedImage = catalogFrame.catalogImage;
        
        // Add wholesaler images based on manufacturer
        if (catalogFrame.manufacturer === 'Larson-Juhl') {
          const frameNumber = catalogFrame.id.split('-')[1];
          if (frameNumber) {
            enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
          }
        } else if (catalogFrame.manufacturer === 'Nielsen') {
          const frameNumber = catalogFrame.id.split('-')[1];
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
      return undefined;
    }
  }
  
  async getAllFrames(): Promise<Frame[]> {
    console.log("Storage: Getting all frames");
    try {
      // First get frames from database
      const dbFrames = await db.select().from(frames);
      console.log(`Storage: Found ${dbFrames.length} frames in database`);
      
      // If frames are in the database, enhance them with wholesaler images
      if (dbFrames.length > 0) {
        console.log("Storage: Enhancing existing frames with real wholesaler images");
        // Add additional data to frames from database
        return dbFrames.map(frame => {
          // Determine color based on the frame's material and name
          let frameColor = determineFrameColor(frame);
          
          // Find a real catalog image based on manufacturer
          let enhancedImage = frame.catalogImage;
          let realCornerImage = frame.corner || '';
          let realEdgeImage = frame.edgeTexture || '';
          
          // Add more detailed wholesaler images for Larson-Juhl frames
          if (frame.manufacturer === 'Larson-Juhl') {
            // Extract the frame number from the ID (e.g., "larson-4512" -> "4512")
            const frameNumber = frame.id.split('-')[1];
            if (frameNumber) {
              // Use actual Larson-Juhl catalog images when available
              enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
              realCornerImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_corner.jpg`;
              realEdgeImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_prof.jpg`;
            }
          }
          
          // Add more detailed wholesaler images for Nielsen frames
          if (frame.manufacturer === 'Nielsen') {
            // Extract the frame number from the ID (e.g., "nielsen-71" -> "71")
            const frameNumber = frame.id.split('-')[1];
            if (frameNumber) {
              // Use actual Nielsen catalog images when available
              enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
              realCornerImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Corner.jpg`;
              realEdgeImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Edge.jpg`;
            }
          }
          
          // Return the enhanced frame with additional properties
          return {
            ...frame,
            catalogImage: enhancedImage,
            corner: realCornerImage,
            edgeTexture: realEdgeImage,
            color: frameColor
          };
        });
      }
      
      // If no frames in database, return enhanced catalog data
      console.log("Storage: No frames in database, returning enhanced catalog data");
      // Add wholesale frame images from external sources
      const enhancedCatalog = frameCatalog.map(frame => {
        // Find a real catalog image based on manufacturer
        let enhancedImage = frame.catalogImage;
        let realCornerImage = frame.corner || '';
        let realEdgeImage = frame.edgeTexture || '';
        let frameColor = frame.color || determineFrameColor(frame);
        
        // Add more detailed wholesaler images for Larson-Juhl frames
        if (frame.manufacturer === 'Larson-Juhl') {
          // Extract the frame number from the ID (e.g., "larson-4512" -> "4512")
          const frameNumber = frame.id.split('-')[1];
          if (frameNumber) {
            // Use actual Larson-Juhl catalog images when available
            enhancedImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_fab.jpg`;
            realCornerImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_corner.jpg`;
            realEdgeImage = `https://www.larsonjuhl.com/contentassets/products/mouldings/${frameNumber}_prof.jpg`;
          }
        }
        
        // Add more detailed wholesaler images for Nielsen frames
        if (frame.manufacturer === 'Nielsen') {
          // Extract the frame number from the ID (e.g., "nielsen-71" -> "71")
          const frameNumber = frame.id.split('-')[1];
          if (frameNumber) {
            // Use actual Nielsen catalog images when available
            enhancedImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Detail.jpg`;
            realCornerImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Corner.jpg`;
            realEdgeImage = `https://www.nielsenbainbridge.com/images/products/detail/${frameNumber}-Edge.jpg`;
          }
        }
        
        // For database compatibility, don't include color in the object
        // saved to the database - only add it for UI rendering
        const dbSafeFrame = {
          ...frame,
          catalogImage: enhancedImage,
          corner: realCornerImage,
          edgeTexture: realEdgeImage
        };
        
        // Try to save to the database if possible - in smaller batches
        try {
          db.insert(frames).values(dbSafeFrame).execute();
        } catch (error) {
          console.error(`Storage: Error inserting frame ${frame.id} into database:`, error);
          // Continue with the next frame, we'll still return the enhanced frame
        }
        
        // Return the enhanced frame to the client with the color included
        return {
          ...dbSafeFrame,
          color: frameColor
        };
      });
      
      return enhancedCatalog;
    } catch (error) {
      console.error("Storage: Error in getAllFrames:", error);
      // Fallback to return enhanced static catalog data if database access fails
      return frameCatalog.map(frame => {
        // Add color based on frame material or name
        let frameColor = determineFrameColor(frame);
        
        // Add consistent fallback images that don't depend on external sites
        const frameNumber = frame.id.split('-')[1];
        let enhancedImage = frame.catalogImage;
        
        // No longer using direct links to wholesaler websites as they cause CORS issues
        // Instead, using placeholder images with consistent URLs that look like frame corners
        if (frame.manufacturer === 'Larson-Juhl') {
          enhancedImage = `https://images.unsplash.com/photo-1594194208961-0fdf358251d3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D`;
        } else if (frame.manufacturer === 'Roma') {
          enhancedImage = `https://images.unsplash.com/photo-1579541591661-567c1ea5dc56?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBpY3R1cmUlMjBmcmFtZXxlbnwwfHwwfHx8MA%3D%3D`;
        } else if (frame.manufacturer === 'Omega') {
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
  
  async updateFrame(id: string, data: Partial<Frame>): Promise<Frame> {
    const [updatedFrame] = await db
      .update(frames)
      .set(data)
      .where(eq(frames.id, id))
      .returning();
    
    if (!updatedFrame) {
      throw new Error('Frame not found');
    }
    
    return updatedFrame;
  }
  
  // Mat color methods
  async getMatColor(id: string): Promise<MatColor | undefined> {
    // First try to get from the database
    const [matColor] = await db.select().from(matColors).where(eq(matColors.id, id));
    
    // If not found in database, check catalog
    if (!matColor) {
      const catalogMatColor = matColorCatalog.find(m => m.id === id);
      if (catalogMatColor) {
        // Insert into database
        await db.insert(matColors).values(catalogMatColor);
        return catalogMatColor;
      }
    }
    
    return matColor || undefined;
  }
  
  async getAllMatColors(): Promise<MatColor[]> {
    // First get mat colors from database
    const dbMatColors = await db.select().from(matColors);
    
    // If no mat colors in database, initialize with catalog
    if (dbMatColors.length === 0) {
      // Insert all catalog mat colors
      await db.insert(matColors).values(matColorCatalog);
      return matColorCatalog;
    }
    
    return dbMatColors;
  }
  
  // Glass option methods
  async getGlassOption(id: string): Promise<GlassOption | undefined> {
    // First try to get from the database
    const [glassOption] = await db.select().from(glassOptions).where(eq(glassOptions.id, id));
    
    // If not found in database, check catalog
    if (!glassOption) {
      const catalogGlassOption = glassOptionCatalog.find(g => g.id === id);
      if (catalogGlassOption) {
        // Insert into database
        await db.insert(glassOptions).values(catalogGlassOption);
        return catalogGlassOption;
      }
    }
    
    return glassOption || undefined;
  }
  
  async getAllGlassOptions(): Promise<GlassOption[]> {
    // First get glass options from database
    const dbGlassOptions = await db.select().from(glassOptions);
    
    // If no glass options in database, initialize with catalog
    if (dbGlassOptions.length === 0) {
      // Insert all catalog glass options
      await db.insert(glassOptions).values(glassOptionCatalog);
      return glassOptionCatalog;
    }
    
    return dbGlassOptions;
  }
  
  // Special service methods
  async getSpecialService(id: string): Promise<SpecialService | undefined> {
    // First try to get from the database
    const [specialService] = await db.select().from(specialServices).where(eq(specialServices.id, id));
    
    // If not found in database, check catalog
    if (!specialService) {
      const catalogSpecialService = specialServicesCatalog.find(s => s.id === id);
      if (catalogSpecialService) {
        // Insert into database
        await db.insert(specialServices).values(catalogSpecialService);
        return catalogSpecialService;
      }
    }
    
    return specialService || undefined;
  }
  
  async getAllSpecialServices(): Promise<SpecialService[]> {
    // First get special services from database
    const dbSpecialServices = await db.select().from(specialServices);
    
    // If no special services in database, initialize with catalog
    if (dbSpecialServices.length === 0) {
      // Insert all catalog special services
      await db.insert(specialServices).values(specialServicesCatalog);
      return specialServicesCatalog;
    }
    
    return dbSpecialServices;
  }
  
  // Order group methods
  async getOrderGroup(id: number): Promise<OrderGroup | undefined> {
    const [orderGroup] = await db.select().from(orderGroups).where(eq(orderGroups.id, id));
    return orderGroup || undefined;
  }
  
  async getActiveOrderGroupByCustomer(customerId: number): Promise<OrderGroup | undefined> {
    const [orderGroup] = await db
      .select()
      .from(orderGroups)
      .where(eq(orderGroups.customerId, customerId));
    
    // Filter in memory for the open status
    return orderGroup && orderGroup.status === 'open' ? orderGroup : undefined;
  }
  
  async getAllOrderGroups(): Promise<OrderGroup[]> {
    return await db.select().from(orderGroups);
  }
  
  async createOrderGroup(orderGroup: InsertOrderGroup): Promise<OrderGroup> {
    const [newOrderGroup] = await db
      .insert(orderGroups)
      .values({
        ...orderGroup,
        status: 'open',
        createdAt: new Date()
      })
      .returning();
    return newOrderGroup;
  }
  
  async updateOrderGroup(id: number, data: Partial<OrderGroup>): Promise<OrderGroup> {
    const [updatedOrderGroup] = await db
      .update(orderGroups)
      .set(data)
      .where(eq(orderGroups.id, id))
      .returning();
    
    if (!updatedOrderGroup) {
      throw new Error('Order group not found');
    }
    
    return updatedOrderGroup;
  }
  
  async getOrderGroupsByCustomerId(customerId: number): Promise<OrderGroup[]> {
    try {
      console.log(`Storage: Getting order groups for customer ID: ${customerId}`);
      const result = await db.select().from(orderGroups).where(eq(orderGroups.customerId, customerId));
      console.log(`Storage: Found ${result.length} order groups for customer ID: ${customerId}`);
      return result;
    } catch (error) {
      console.error("Storage: Error getting order groups by customer ID:", error);
      throw error;
    }
  }
  
  async getOrdersByGroupId(orderGroupId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.orderGroupId, orderGroupId));
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      console.log('DatabaseStorage.createOrder - Inserting order with data:', order);
      const [newOrder] = await db
        .insert(orders)
        .values({
          ...order,
          status: 'pending',
          createdAt: new Date()
        })
        .returning();
      console.log('DatabaseStorage.createOrder - Order created successfully:', newOrder);
      return newOrder;
    } catch (error) {
      console.error('DatabaseStorage.createOrder - Error creating order:', error);
      throw error;
    }
  }
  
  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set(data)
      .where(eq(orders.id, id))
      .returning();
    
    if (!updatedOrder) {
      throw new Error('Order not found');
    }
    
    return updatedOrder;
  }
  
  async deleteOrder(id: number): Promise<void> {
    await db
      .delete(orders)
      .where(eq(orders.id, id));
  }
  
  // Order special service methods
  async createOrderSpecialService(orderSpecialService: InsertOrderSpecialService): Promise<OrderSpecialService> {
    const [newOrderSpecialService] = await db
      .insert(orderSpecialServices)
      .values(orderSpecialService)
      .returning();
    return newOrderSpecialService;
  }
  
  async getOrderSpecialServices(orderId: number): Promise<SpecialService[]> {
    const orderSpecialServicesData = await db
      .select()
      .from(orderSpecialServices)
      .where(eq(orderSpecialServices.orderId, orderId));
    
    const serviceIds = orderSpecialServicesData.map(os => os.specialServiceId);
    
    const result: SpecialService[] = [];
    for (const id of serviceIds) {
      if (id) { // Make sure id is not null
        const service = await this.getSpecialService(id);
        if (service) {
          result.push(service);
        }
      }
    }
    
    return result;
  }
  
  // Wholesale order methods
  async getWholesaleOrder(id: number): Promise<WholesaleOrder | undefined> {
    const [wholesaleOrder] = await db.select().from(wholesaleOrders).where(eq(wholesaleOrders.id, id));
    return wholesaleOrder || undefined;
  }
  
  async getAllWholesaleOrders(): Promise<WholesaleOrder[]> {
    return await db.select().from(wholesaleOrders);
  }
  
  async createWholesaleOrder(wholesaleOrder: InsertWholesaleOrder): Promise<WholesaleOrder> {
    const [newWholesaleOrder] = await db
      .insert(wholesaleOrders)
      .values({
        ...wholesaleOrder,
        status: 'pending',
        createdAt: new Date()
      })
      .returning();
    return newWholesaleOrder;
  }
  
  async updateWholesaleOrder(id: number, data: Partial<WholesaleOrder>): Promise<WholesaleOrder> {
    const [updatedWholesaleOrder] = await db
      .update(wholesaleOrders)
      .set(data)
      .where(eq(wholesaleOrders.id, id))
      .returning();
    
    if (!updatedWholesaleOrder) {
      throw new Error('Wholesale order not found');
    }
    
    return updatedWholesaleOrder;
  }

  // Production Kanban methods
  async getOrdersByProductionStatus(status: ProductionStatus): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.productionStatus, status))
      .orderBy(orders.lastStatusChange);
  }

  async updateOrderProductionStatus(id: number, status: ProductionStatus): Promise<Order> {
    // First get the order to check current status
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Record the status change
    const previousStatus = order.productionStatus;
    
    // Update the order with new status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        productionStatus: status,
        lastStatusChange: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    
    // Check if notifications are enabled for this order
    if (updatedOrder.notificationsEnabled) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, order.customerId));
      
      if (customer) {
        try {
          // Import email service here to avoid circular dependencies
          const { sendOrderStatusUpdate } = await import('./services/emailService');
          
          // Actually send the email notification
          const emailSent = await sendOrderStatusUpdate(
            customer.email,
            customer.name,
            order.id,
            status,
            previousStatus,
            order.estimatedCompletionDays
          );
          
          // Create a notification record in the database
          await this.createCustomerNotification({
            customerId: customer.id,
            orderId: order.id,
            notificationType: 'status_update',
            channel: 'email',
            subject: `Order #${order.id} Status Update: ${status}`,
            message: `Your order is now ${status.split('_').join(' ')}. Check your email for details.`,
            successful: emailSent,
            previousStatus,
            newStatus: status,
            // Store response data if needed for debugging
            responseData: emailSent ? { sent: true, timestamp: new Date().toISOString() } : { sent: false, error: 'Email failed to send' }
          });
          
          console.log(`Status update email ${emailSent ? 'sent' : 'failed'} for Order #${order.id} to ${customer.email}`);
        } catch (error) {
          console.error('Error sending status update email:', error);
          
          // Still record the notification attempt even if email failed
          await this.createCustomerNotification({
            customerId: customer.id,
            orderId: order.id,
            notificationType: 'status_update',
            channel: 'email',
            subject: `Order #${order.id} Status Update: ${status}`,
            message: `Your order is now ${status.split('_').join(' ')}.`,
            successful: false,
            previousStatus,
            newStatus: status,
            responseData: { error: (error as Error).message }
          });
        }
      }
    }
    
    return updatedOrder;
  }

  async getOrdersForKanban(): Promise<Order[]> {
    // Get all orders with associated customer data for the kanban board
    const dbOrders = await db
      .select({
        order: orders,
        customer: customers
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(orders.lastStatusChange);
    
    // Return formatted data with customer details included
    return dbOrders.map(row => ({
      ...row.order,
      customerName: row.customer ? row.customer.name : 'Unknown Customer',
      customerPhone: row.customer?.phone || 'No phone',
      customerEmail: row.customer?.email || 'No email'
    })) as Order[];
  }

  async scheduleOrderForProduction(id: number, estimatedDays: number): Promise<Order> {
    // Get order to make sure it exists
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Update the estimated completion days
    const [updatedOrder] = await db
      .update(orders)
      .set({
        estimatedCompletionDays: estimatedDays,
        productionStatus: 'scheduled' as ProductionStatus
      })
      .where(eq(orders.id, id))
      .returning();
    
    // Create a notification about the scheduled production
    if (updatedOrder.notificationsEnabled) {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, order.customerId));
      
      if (customer) {
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays);
        
        await this.createCustomerNotification({
          customerId: customer.id,
          orderId: order.id,
          notificationType: 'estimated_completion',
          channel: 'email',
          subject: `Your Custom Framing Order #${order.id} Has Been Scheduled`,
          message: `Your custom framing order #${order.id} has been scheduled for production. The estimated completion date is ${estimatedCompletionDate.toLocaleDateString()}.`,
          successful: true,
          previousStatus: order.productionStatus,
          newStatus: 'scheduled'
        });
      }
    }
    
    return updatedOrder;
  }

  // Customer notification methods
  async createCustomerNotification(notification: InsertCustomerNotification): Promise<CustomerNotification> {
    const [newNotification] = await db
      .insert(customerNotifications)
      .values({
        ...notification,
        sentAt: new Date()
      })
      .returning();
    
    return newNotification;
  }

  async getCustomerNotifications(customerId: number): Promise<CustomerNotification[]> {
    return await db
      .select()
      .from(customerNotifications)
      .where(eq(customerNotifications.customerId, customerId))
      .orderBy(customerNotifications.sentAt, 'desc');
  }

  async getNotificationsByOrder(orderId: number): Promise<CustomerNotification[]> {
    return await db
      .select()
      .from(customerNotifications)
      .where(eq(customerNotifications.orderId, orderId))
      .orderBy(customerNotifications.sentAt, 'desc');
  }

  // Material order methods
  async getMaterialOrder(id: number): Promise<MaterialOrder | undefined> {
    const [materialOrder] = await db
      .select()
      .from(materialOrders)
      .where(eq(materialOrders.id, id));
    return materialOrder;
  }

  async getAllMaterialOrders(): Promise<MaterialOrder[]> {
    try {
      // First try to get the column names from the table
      const columns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'material_orders'
      `);
      
      // Use only the columns that exist in the database
      const result = await db.execute<MaterialOrder[]>(sql`
        SELECT * FROM material_orders
        ORDER BY created_at DESC
      `);
      
      return result;
    } catch (error) {
      console.error('Error in getAllMaterialOrders:', error);
      // If there's an error with missing columns, return an empty array
      // This provides graceful degradation until all schema migrations are complete
      return [];
    }
  }

  async getMaterialOrdersByStatus(status: MaterialOrderStatus): Promise<MaterialOrder[]> {
    try {
      return await db
        .select()
        .from(materialOrders)
        .where(eq(materialOrders.status, status))
        .orderBy(desc(materialOrders.createdAt));
    } catch (error) {
      console.error('Error in getMaterialOrdersByStatus:', error);
      return [];
    }
  }

  async getMaterialOrdersByType(materialType: MaterialType): Promise<MaterialOrder[]> {
    try {
      return await db
        .select()
        .from(materialOrders)
        .where(eq(materialOrders.materialType, materialType))
        .orderBy(desc(materialOrders.createdAt));
    } catch (error) {
      console.error('Error in getMaterialOrdersByType:', error);
      return [];
    }
  }

  async createMaterialOrder(materialOrder: InsertMaterialOrder): Promise<MaterialOrder> {
    console.log('Creating material order with data:', materialOrder);
    
    // Clean up any properties that shouldn't be sent to database
    const cleanData = { ...materialOrder };
    
    // If vendor is present but supplierName is not, use vendor as supplierName
    if (cleanData.vendor && !cleanData.supplierName) {
      cleanData.supplierName = cleanData.vendor;
      delete cleanData.vendor; // Remove vendor as it doesn't exist in DB
    }
    
    console.log('Cleaned data for material order creation:', cleanData);
    
    try {
      const [newMaterialOrder] = await db
        .insert(materialOrders)
        .values(cleanData)
        .returning();
        
      console.log('Successfully created material order:', newMaterialOrder.id);
      return newMaterialOrder;
    } catch (error) {
      console.error('Error creating material order:', error);
      throw error;
    }
  }

  async updateMaterialOrder(id: string | number, data: Partial<MaterialOrder>): Promise<MaterialOrder> {
    console.log('updateMaterialOrder called with id:', id, 'and data:', data);
    
    // Convert id to number if it's a string representing a number
    const materialId = typeof id === 'string' && !isNaN(parseInt(id)) 
      ? parseInt(id) 
      : id;
      
    // Clean up any properties that shouldn't be sent to database
    const cleanData = { ...data };
    // If vendor is present but supplierName is not, use vendor as supplierName
    if (cleanData.vendor && !cleanData.supplierName) {
      cleanData.supplierName = cleanData.vendor;
      delete cleanData.vendor; // Remove vendor as it doesn't exist in DB
    }
    
    console.log('Cleaned data for update:', cleanData);
    
    try {
      const [updatedMaterialOrder] = await db
        .update(materialOrders)
        .set(cleanData)
        .where(eq(materialOrders.id, materialId as number))
        .returning();
        
      console.log('Successfully updated material order:', updatedMaterialOrder.id);
      return updatedMaterialOrder;
    } catch (error) {
      console.error('Error updating material order:', error);
      throw error;
    }
  }

  async deleteMaterialOrder(id: number): Promise<void> {
    await db
      .delete(materialOrders)
      .where(eq(materialOrders.id, id));
  }

  // Inventory Management System Methods

  // Inventory Items
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    try {
      return await db
        .select()
        .from(inventoryItems)
        .orderBy(asc(inventoryItems.name));
    } catch (error) {
      console.error('Error in getAllInventoryItems:', error);
      return [];
    }
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    try {
      const [item] = await db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.id, id));
      return item;
    } catch (error) {
      console.error('Error in getInventoryItem:', error);
      return undefined;
    }
  }

  async getInventoryItemByBarcode(barcode: string): Promise<InventoryItem | undefined> {
    try {
      const [item] = await db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.barcode, barcode));
      return item;
    } catch (error) {
      console.error('Error in getInventoryItemByBarcode:', error);
      return undefined;
    }
  }

  async createInventoryItem(inventoryItem: InsertInventoryItem & { initialQuantity?: string }): Promise<InventoryItem> {
    try {
      // Generate SKU if not provided
      if (!inventoryItem.sku) {
        inventoryItem.sku = `INV-${Date.now().toString(36).toUpperCase()}`;
      }
      
      // Extract initialQuantity before inserting since it's not part of the schema
      const { initialQuantity, ...itemToInsert } = inventoryItem;

      const [newItem] = await db
        .insert(inventoryItems)
        .values(itemToInsert)
        .returning();
      
      // Create an initial inventory transaction if initialQuantity was provided
      if (initialQuantity) {
        await this.createInventoryTransaction({
          itemId: newItem.id,
          type: 'initial',
          quantity: initialQuantity,
          unitCost: inventoryItem.costPerUnit,
          notes: 'Initial inventory setup'
        });
      }
      
      return newItem;
    } catch (error) {
      console.error('Error in createInventoryItem:', error);
      throw error;
    }
  }

  async updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const [updatedItem] = await db
        .update(inventoryItems)
        .set({
          ...item,
          updatedAt: new Date()
        })
        .where(eq(inventoryItems.id, id))
        .returning();
      return updatedItem;
    } catch (error) {
      console.error('Error in updateInventoryItem:', error);
      throw error;
    }
  }

  async deleteInventoryItem(id: number): Promise<void> {
    try {
      // First delete all transactions related to this item
      await db
        .delete(inventoryTransactions)
        .where(eq(inventoryTransactions.itemId, id));
      
      // Then delete the item itself
      await db
        .delete(inventoryItems)
        .where(eq(inventoryItems.id, id));
    } catch (error) {
      console.error('Error in deleteInventoryItem:', error);
      throw error;
    }
  }

  // Low stock items
  async getLowStockItems(): Promise<(InventoryItem & { currentStock: number })[]> {
    try {
      // Get all items where current stock is at or below reorder level
      const items = await db.select().from(inventoryItems);
      const lowStockItems: (InventoryItem & { currentStock: number })[] = [];
      
      for (const item of items) {
        const currentStock = await this.getItemCurrentStock(item.id);
        if (currentStock <= Number(item.reorderLevel)) {
          // Use type assertion to add the currentStock property
          lowStockItems.push({
            ...item,
            currentStock
          });
        }
      }
      
      return lowStockItems;
    } catch (error) {
      console.error('Error in getLowStockItems:', error);
      return [];
    }
  }

  // Get current stock level for an item based on transactions
  async getItemCurrentStock(itemId: number): Promise<number> {
    try {
      const transactions = await db
        .select()
        .from(inventoryTransactions)
        .where(eq(inventoryTransactions.itemId, itemId));
      
      let currentStock = 0;
      for (const transaction of transactions) {
        const quantity = Number(transaction.quantity);
        switch (transaction.type) {
          case 'purchase':
          case 'initial':
          case 'adjustment':
            currentStock += quantity;
            break;
          case 'sale':
          case 'scrap':
            currentStock -= quantity;
            break;
          // For transfers, we'd need to track from/to locations
          // but we're keeping it simple for now
        }
      }
      
      return currentStock;
    } catch (error) {
      console.error('Error in getItemCurrentStock:', error);
      return 0;
    }
  }

  // Inventory Transactions
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    try {
      const [newTransaction] = await db
        .insert(inventoryTransactions)
        .values(transaction)
        .returning();
      
      // Update last count date if this is a count transaction
      if (transaction.type === 'count') {
        await db
          .update(inventoryItems)
          .set({ 
            lastCountDate: new Date(),
            updatedAt: new Date()
          })
          .where(eq(inventoryItems.id, transaction.itemId));
      }
      
      return newTransaction;
    } catch (error) {
      console.error('Error in createInventoryTransaction:', error);
      throw error;
    }
  }

  // Suppliers
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      return await db
        .select()
        .from(suppliers)
        .orderBy(asc(suppliers.name));
    } catch (error) {
      console.error('Error in getAllSuppliers:', error);
      return [];
    }
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    try {
      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, id));
      return supplier;
    } catch (error) {
      console.error('Error in getSupplier:', error);
      return undefined;
    }
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    try {
      const [newSupplier] = await db
        .insert(suppliers)
        .values(supplier)
        .returning();
      return newSupplier;
    } catch (error) {
      console.error('Error in createSupplier:', error);
      throw error;
    }
  }

  async updateSupplier(id: number, supplier: Partial<Supplier>): Promise<Supplier> {
    try {
      const [updatedSupplier] = await db
        .update(suppliers)
        .set(supplier)
        .where(eq(suppliers.id, id))
        .returning();
      return updatedSupplier;
    } catch (error) {
      console.error('Error in updateSupplier:', error);
      throw error;
    }
  }

  async deleteSupplier(id: number): Promise<void> {
    try {
      await db
        .delete(suppliers)
        .where(eq(suppliers.id, id));
    } catch (error) {
      console.error('Error in deleteSupplier:', error);
      throw error;
    }
  }

  // Inventory Locations
  async getAllInventoryLocations(): Promise<InventoryLocation[]> {
    try {
      return await db
        .select()
        .from(inventoryLocations)
        .orderBy(asc(inventoryLocations.name));
    } catch (error) {
      console.error('Error in getAllInventoryLocations:', error);
      return [];
    }
  }

  async getInventoryLocation(id: number): Promise<InventoryLocation | undefined> {
    try {
      const [location] = await db
        .select()
        .from(inventoryLocations)
        .where(eq(inventoryLocations.id, id));
      return location;
    } catch (error) {
      console.error('Error in getInventoryLocation:', error);
      return undefined;
    }
  }

  async createInventoryLocation(location: InsertInventoryLocation): Promise<InventoryLocation> {
    try {
      const [newLocation] = await db
        .insert(inventoryLocations)
        .values(location)
        .returning();
      return newLocation;
    } catch (error) {
      console.error('Error in createInventoryLocation:', error);
      throw error;
    }
  }

  // Purchase Orders and Lines
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      return await db
        .select()
        .from(purchaseOrders)
        .orderBy(desc(purchaseOrders.createdAt));
    } catch (error) {
      console.error('Error in getAllPurchaseOrders:', error);
      return [];
    }
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    try {
      const [order] = await db
        .select()
        .from(purchaseOrders)
        .where(eq(purchaseOrders.id, id));
      return order;
    } catch (error) {
      console.error('Error in getPurchaseOrder:', error);
      return undefined;
    }
  }

  async createPurchaseOrderWithLines(
    orderData: Omit<InsertPurchaseOrder, 'poNumber'>, 
    lines: InsertPurchaseOrderLine[]
  ): Promise<PurchaseOrder> {
    try {
      // Generate a PO number
      const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
      
      // Calculate totals
      let subtotal = 0;
      for (const line of lines) {
        const lineTotal = Number(line.quantity) * Number(line.unitCost);
        subtotal += lineTotal;
      }
      
      // Calculate tax and total
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax + Number(orderData.shipping || 0);
      
      // Create the purchase order
      const [purchaseOrder] = await db
        .insert(purchaseOrders)
        .values({
          ...orderData,
          poNumber,
          subtotal: subtotal.toString(),
          tax: tax.toString(),
          total: total.toString()
        })
        .returning();
      
      // Create each line item
      for (const line of lines) {
        const lineTotal = Number(line.quantity) * Number(line.unitCost);
        await db
          .insert(purchaseOrderLines)
          .values({
            ...line,
            purchaseOrderId: purchaseOrder.id,
            lineTotal: lineTotal.toString()
          });
      }
      
      return purchaseOrder;
    } catch (error) {
      console.error('Error in createPurchaseOrderWithLines:', error);
      throw error;
    }
  }

  // Valuation
  async getInventoryValuation(): Promise<{
    totalValue: number;
    itemCount: number;
    valuationByCategory: { category: string; value: number }[];
  }> {
    try {
      const items = await this.getAllInventoryItems();
      let totalValue = 0;
      const valueByCategory: Record<string, number> = {};
      
      for (const item of items) {
        const currentStock = await this.getItemCurrentStock(item.id);
        const itemValue = currentStock * Number(item.costPerUnit);
        totalValue += itemValue;
        
        // Add to category valuation
        if (item.categoryId) {
          const category = await this.getInventoryCategory(item.categoryId);
          const categoryName = category?.name || 'Uncategorized';
          
          if (!valueByCategory[categoryName]) {
            valueByCategory[categoryName] = 0;
          }
          
          valueByCategory[categoryName] += itemValue;
        } else {
          if (!valueByCategory['Uncategorized']) {
            valueByCategory['Uncategorized'] = 0;
          }
          valueByCategory['Uncategorized'] += itemValue;
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
      console.error('Error in getInventoryValuation:', error);
      return {
        totalValue: 0,
        itemCount: 0,
        valuationByCategory: []
      };
    }
  }

  // Get inventory category by ID
  async getInventoryCategory(id: number): Promise<InventoryCategory | undefined> {
    try {
      const [category] = await db
        .select()
        .from(inventoryCategories)
        .where(eq(inventoryCategories.id, id));
      return category;
    } catch (error) {
      console.error('Error in getInventoryCategory:', error);
      return undefined;
    }
  }

  // Generate recommended purchase orders
  async generateRecommendedPurchaseOrders(): Promise<{
    supplierId: number;
    supplierName: string;
    items: {
      itemId: number;
      name: string;
      sku: string;
      currentStock: number;
      reorderLevel: number;
      reorderQuantity: number;
    }[];
  }[]> {
    try {
      const lowStockItems = await this.getLowStockItems();
      const supplierMap: Record<number, {
        supplierId: number;
        supplierName: string;
        items: {
          itemId: number;
          name: string;
          sku: string;
          currentStock: number;
          reorderLevel: number;
          reorderQuantity: number;
        }[];
      }> = {};
      
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
      console.error('Error in generateRecommendedPurchaseOrders:', error);
      return [];
    }
  }

  // CSV Import/Export
  async importInventoryFromCSV(filePath: string): Promise<{ 
    success: boolean; 
    importedCount: number;
    errors: string[] 
  }> {
    try {
      // This would normally be implemented with a CSV parsing library
      // For now we'll just return a placeholder
      return {
        success: true,
        importedCount: 0,
        errors: []
      };
    } catch (error) {
      console.error('Error in importInventoryFromCSV:', error);
      return {
        success: false,
        importedCount: 0,
        errors: ['Failed to import CSV data']
      };
    }
  }

  async exportInventoryToCSV(): Promise<string> {
    try {
      // This would normally generate a CSV file from inventory data
      // For now we'll just return a placeholder
      return 'id,sku,name,description,quantity\n';
    } catch (error) {
      console.error('Error in exportInventoryToCSV:', error);
      throw error;
    }
  }

  // Materials pick list methods
  async getMaterialsPickList(): Promise<any[]> {
    try {
      // Format material orders into a format suitable for the pick list UI
      const materials = await db.select().from(materialOrders);
      
      // Transform MaterialOrder objects into MaterialItem objects for the UI
      return materials.map(material => ({
        id: material.id.toString(),
        orderIds: material.sourceOrderId ? [material.sourceOrderId] : [],
        name: material.materialName,
        sku: material.materialId,
        supplier: material.supplierName || 'Unknown',
        type: material.materialType,
        quantity: Number(material.quantity),
        status: material.status,
        orderDate: material.orderDate?.toISOString() || undefined,
        receiveDate: material.actualArrival?.toISOString() || undefined,
        priority: material.priority === 'high' ? 'high' : 
                 material.priority === 'low' ? 'low' : 'medium',
        notes: material.notes
      }));
    } catch (error) {
      console.error("Error getting materials pick list:", error);
      return [];
    }
  }
  
  async getMaterialsForOrder(orderId: number): Promise<any[]> {
    try {
      // Get materials for a specific order
      const materials = await db.select()
        .from(materialOrders)
        .where(eq(materialOrders.sourceOrderId, orderId));
      
      // Transform MaterialOrder objects into MaterialItem objects for the UI
      return materials.map(material => ({
        id: material.id.toString(),
        orderIds: [orderId],
        name: material.materialName,
        sku: material.materialId,
        supplier: material.supplierName || 'Unknown',
        type: material.materialType,
        quantity: Number(material.quantity),
        status: material.status,
        orderDate: material.orderDate?.toISOString() || undefined,
        receiveDate: material.actualArrival?.toISOString() || undefined,
        priority: material.priority === 'high' ? 'high' : 
                 material.priority === 'low' ? 'low' : 'medium',
        notes: material.notes
      }));
    } catch (error) {
      console.error(`Error getting materials for order ${orderId}:`, error);
      return [];
    }
  }
  
  async updateMaterialOrder(id: string | number, data: any): Promise<any> {
    try {
      const materialId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Update the material order in the database
      const [updatedMaterial] = await db
        .update(materialOrders)
        .set({
          status: data.status,
          notes: data.notes,
          orderDate: data.orderDate ? new Date(data.orderDate) : undefined,
          actualArrival: data.receiveDate ? new Date(data.receiveDate) : undefined
        })
        .where(eq(materialOrders.id, materialId))
        .returning();
      
      if (!updatedMaterial) {
        throw new Error(`Material order with ID ${id} not found`);
      }
      
      // Return the updated material in UI format
      return {
        id: updatedMaterial.id.toString(),
        orderIds: updatedMaterial.sourceOrderId ? [updatedMaterial.sourceOrderId] : [],
        name: updatedMaterial.materialName,
        sku: updatedMaterial.materialId,
        supplier: updatedMaterial.supplierName || 'Unknown',
        type: updatedMaterial.materialType,
        quantity: Number(updatedMaterial.quantity),
        status: updatedMaterial.status,
        orderDate: updatedMaterial.orderDate?.toISOString() || undefined,
        receiveDate: updatedMaterial.actualArrival?.toISOString() || undefined,
        priority: updatedMaterial.priority === 'high' ? 'high' : 
                 updatedMaterial.priority === 'low' ? 'low' : 'medium',
        notes: updatedMaterial.notes
      };
    } catch (error) {
      console.error(`Error updating material order ${id}:`, error);
      throw error;
    }
  }
  
  async createPurchaseOrder(materialIds: string[]): Promise<any> {
    try {
      // Convert string IDs to numbers
      const numericIds = materialIds.map(id => parseInt(id, 10));
      
      // Get the material orders to include in the purchase order
      const materialsToOrder = await db.select()
        .from(materialOrders)
        .where(sql`${materialOrders.id} IN (${numericIds.join(', ')})`);
      
      if (materialsToOrder.length === 0) {
        throw new Error('No material orders found with the provided IDs');
      }
      
      // Group materials by supplier
      const supplierGroups: Record<string, MaterialOrder[]> = {};
      for (const material of materialsToOrder) {
        const supplier = material.supplierName || 'Unknown';
        if (!supplierGroups[supplier]) {
          supplierGroups[supplier] = [];
        }
        supplierGroups[supplier].push(material);
      }
      
      // Create purchase orders for each supplier
      const purchaseOrders = [];
      
      for (const supplier in supplierGroups) {
        // Create a new purchase order
        const [purchaseOrder] = await db.insert(purchaseOrders)
          .values({
            supplier: supplier,
            status: 'pending',
            totalAmount: supplierGroups[supplier].reduce(
              (sum, material) => sum + Number(material.totalCost || 0), 
              0
            ),
            notes: `Auto-generated purchase order for ${supplierGroups[supplier].length} items`
          })
          .returning();
          
        // Create purchase order lines for each material
        for (const material of supplierGroups[supplier]) {
          // Find the inventory item corresponding to the material
          const [inventoryItem] = await db.select()
            .from(inventoryItems)
            .where(sql`${inventoryItems.sku} = ${material.materialId}`);
            
          const itemId = inventoryItem?.id || null;
          
          // Create a purchase order line
          await db.insert(purchaseOrderLines)
            .values({
              purchaseOrderId: purchaseOrder.id,
              itemId: itemId,
              quantity: material.quantity,
              unitCost: material.costPerUnit || 0,
              lineTotal: material.totalCost || 0,
              notes: material.notes
            });
          
          // Update the material order status to 'ordered'
          await db.update(materialOrders)
            .set({
              status: 'ordered',
              orderDate: new Date()
            })
            .where(eq(materialOrders.id, material.id));
        }
        
        purchaseOrders.push(purchaseOrder);
      }
      
      return {
        success: true,
        message: `Created ${purchaseOrders.length} purchase orders`,
        purchaseOrders
      };
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
