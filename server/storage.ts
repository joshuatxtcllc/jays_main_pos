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
  customerNotifications, type CustomerNotification, type InsertCustomerNotification
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
    return '#2D2D2D'; // Black
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
}

import { db } from "./db";
import { eq } from "drizzle-orm";

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
        // Create a notification about the status change
        await this.createCustomerNotification({
          customerId: customer.id,
          orderId: order.id,
          notificationType: 'status_update',
          channel: 'email', // Default to email
          subject: `Order #${order.id} Status Update: ${status}`,
          message: `Your custom framing order #${order.id} has been updated to status: ${status.replace('_', ' ').toUpperCase()}`,
          successful: true,
          previousStatus,
          newStatus: status
        });
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
      customerName: row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : 'Unknown Customer',
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
}

export const storage = new DatabaseStorage();
