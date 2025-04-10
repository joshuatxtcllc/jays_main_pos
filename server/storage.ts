import { 
  customers, type Customer, type InsertCustomer,
  frames, type Frame, type InsertFrame,
  matColors, type MatColor, type InsertMatColor,
  glassOptions, type GlassOption, type InsertGlassOption,
  specialServices, type SpecialService, type InsertSpecialService,
  orderGroups, type OrderGroup, type InsertOrderGroup,
  orders, type Order, type InsertOrder,
  orderSpecialServices, type OrderSpecialService, type InsertOrderSpecialService,
  wholesaleOrders, type WholesaleOrder, type InsertWholesaleOrder
} from "@shared/schema";
import { frameCatalog } from "../client/src/data/frameCatalog";
import { matColorCatalog } from "../client/src/data/matColors";
import { glassOptionCatalog, specialServicesCatalog } from "../client/src/data/glassOptions";

export interface IStorage {
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Frame methods
  getFrame(id: string): Promise<Frame | undefined>;
  getAllFrames(): Promise<Frame[]>;
  
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
  
  // Order special service methods
  createOrderSpecialService(orderSpecialService: InsertOrderSpecialService): Promise<OrderSpecialService>;
  getOrderSpecialServices(orderId: number): Promise<SpecialService[]>;
  
  // Wholesale order methods
  getWholesaleOrder(id: number): Promise<WholesaleOrder | undefined>;
  getAllWholesaleOrders(): Promise<WholesaleOrder[]>;
  createWholesaleOrder(wholesaleOrder: InsertWholesaleOrder): Promise<WholesaleOrder>;
  updateWholesaleOrder(id: number, data: Partial<WholesaleOrder>): Promise<WholesaleOrder>;
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

  // Frame methods
  async getFrame(id: string): Promise<Frame | undefined> {
    // First try to get from the database
    const [frame] = await db.select().from(frames).where(eq(frames.id, id));
    
    // If not found in database, check catalog
    if (!frame) {
      const catalogFrame = frameCatalog.find(f => f.id === id);
      if (catalogFrame) {
        // Insert into database
        await db.insert(frames).values(catalogFrame);
        return catalogFrame;
      }
    }
    
    return frame || undefined;
  }
  
  async getAllFrames(): Promise<Frame[]> {
    // First get frames from database
    const dbFrames = await db.select().from(frames);
    
    // If no frames in database, initialize with catalog
    if (dbFrames.length === 0) {
      // Insert all catalog frames
      await db.insert(frames).values(frameCatalog);
      return frameCatalog;
    }
    
    return dbFrames;
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
}

export const storage = new DatabaseStorage();
