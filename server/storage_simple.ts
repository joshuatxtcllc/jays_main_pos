// Simplified storage implementation to get the server running
import { 
  customers, type Customer, type InsertCustomer,
  frames, type Frame, type InsertFrame,
  matColors, type MatColor,
  glassOptions, type GlassOption,
  specialServices, type SpecialService,
  orderGroups, type OrderGroup, type InsertOrderGroup,
  orders, type Order, type InsertOrder,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Frame methods
  getAllFrames(): Promise<Frame[]>;

  // Mat color methods
  getAllMatColors(): Promise<MatColor[]>;

  // Glass option methods
  getAllGlassOptions(): Promise<GlassOption[]>;

  // Special service methods
  getAllSpecialServices(): Promise<SpecialService[]>;

  // Order group methods
  createOrderGroup(orderGroup: InsertOrderGroup): Promise<OrderGroup>;

  // Order methods
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(limit?: number): Promise<Notification[]>;
}

export class DatabaseStorage implements IStorage {
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async getAllFrames(): Promise<Frame[]> {
    return await db.select().from(frames);
  }

  async getAllMatColors(): Promise<MatColor[]> {
    return await db.select().from(matColors);
  }

  async getAllGlassOptions(): Promise<GlassOption[]> {
    return await db.select().from(glassOptions);
  }

  async getAllSpecialServices(): Promise<SpecialService[]> {
    return await db.select().from(specialServices);
  }

  async createOrderGroup(orderGroup: InsertOrderGroup): Promise<OrderGroup> {
    const [newOrderGroup] = await db
      .insert(orderGroups)
      .values(orderGroup)
      .returning();
    return newOrderGroup;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getNotifications(limit?: number): Promise<Notification[]> {
    let query = db.select().from(notifications).orderBy(desc(notifications.createdAt));
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }
}

export const storage = new DatabaseStorage();