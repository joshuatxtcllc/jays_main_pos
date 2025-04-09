import { 
  customers, type Customer, type InsertCustomer,
  frames, type Frame, type InsertFrame,
  matColors, type MatColor, type InsertMatColor,
  glassOptions, type GlassOption, type InsertGlassOption,
  specialServices, type SpecialService, type InsertSpecialService,
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

export class MemStorage implements IStorage {
  private customersStore: Map<number, Customer>;
  private framesStore: Map<string, Frame>;
  private matColorsStore: Map<string, MatColor>;
  private glassOptionsStore: Map<string, GlassOption>;
  private specialServicesStore: Map<string, SpecialService>;
  private ordersStore: Map<number, Order>;
  private orderSpecialServicesStore: Map<string, OrderSpecialService>;
  private wholesaleOrdersStore: Map<number, WholesaleOrder>;
  
  private customerIdCounter: number;
  private orderIdCounter: number;
  private wholesaleOrderIdCounter: number;

  constructor() {
    this.customersStore = new Map();
    this.framesStore = new Map();
    this.matColorsStore = new Map();
    this.glassOptionsStore = new Map();
    this.specialServicesStore = new Map();
    this.ordersStore = new Map();
    this.orderSpecialServicesStore = new Map();
    this.wholesaleOrdersStore = new Map();
    
    this.customerIdCounter = 1;
    this.orderIdCounter = 1;
    this.wholesaleOrderIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add frames from catalog
    frameCatalog.forEach(frame => {
      this.framesStore.set(frame.id, frame);
    });
    
    // Add mat colors from catalog
    matColorCatalog.forEach(matColor => {
      this.matColorsStore.set(matColor.id, matColor);
    });
    
    // Add glass options from catalog
    glassOptionCatalog.forEach(glassOption => {
      this.glassOptionsStore.set(glassOption.id, glassOption);
    });
    
    // Add special services from catalog
    specialServicesCatalog.forEach(specialService => {
      this.specialServicesStore.set(specialService.id, specialService);
    });
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customersStore.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    for (const customer of this.customersStore.values()) {
      if (customer.email === email) {
        return customer;
      }
    }
    return undefined;
  }
  
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customersStore.values());
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const newCustomer: Customer = {
      ...customer,
      id,
      createdAt: new Date()
    };
    this.customersStore.set(id, newCustomer);
    return newCustomer;
  }

  // Frame methods
  async getFrame(id: string): Promise<Frame | undefined> {
    return this.framesStore.get(id);
  }
  
  async getAllFrames(): Promise<Frame[]> {
    return Array.from(this.framesStore.values());
  }
  
  // Mat color methods
  async getMatColor(id: string): Promise<MatColor | undefined> {
    return this.matColorsStore.get(id);
  }
  
  async getAllMatColors(): Promise<MatColor[]> {
    return Array.from(this.matColorsStore.values());
  }
  
  // Glass option methods
  async getGlassOption(id: string): Promise<GlassOption | undefined> {
    return this.glassOptionsStore.get(id);
  }
  
  async getAllGlassOptions(): Promise<GlassOption[]> {
    return Array.from(this.glassOptionsStore.values());
  }
  
  // Special service methods
  async getSpecialService(id: string): Promise<SpecialService | undefined> {
    return this.specialServicesStore.get(id);
  }
  
  async getAllSpecialServices(): Promise<SpecialService[]> {
    return Array.from(this.specialServicesStore.values());
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.ordersStore.get(id);
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.ordersStore.values());
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const newOrder: Order = {
      ...order,
      id,
      status: 'pending',
      createdAt: new Date()
    };
    this.ordersStore.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    const order = this.ordersStore.get(id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    const updatedOrder = { ...order, ...data };
    this.ordersStore.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order special service methods
  async createOrderSpecialService(orderSpecialService: InsertOrderSpecialService): Promise<OrderSpecialService> {
    const key = `${orderSpecialService.orderId}-${orderSpecialService.specialServiceId}`;
    this.orderSpecialServicesStore.set(key, orderSpecialService);
    return orderSpecialService;
  }
  
  async getOrderSpecialServices(orderId: number): Promise<SpecialService[]> {
    const specialServiceIds = Array.from(this.orderSpecialServicesStore.values())
      .filter(os => os.orderId === orderId)
      .map(os => os.specialServiceId);
    
    const result: SpecialService[] = [];
    for (const id of specialServiceIds) {
      const service = this.specialServicesStore.get(id);
      if (service) {
        result.push(service);
      }
    }
    
    return result;
  }
  
  // Wholesale order methods
  async getWholesaleOrder(id: number): Promise<WholesaleOrder | undefined> {
    return this.wholesaleOrdersStore.get(id);
  }
  
  async getAllWholesaleOrders(): Promise<WholesaleOrder[]> {
    return Array.from(this.wholesaleOrdersStore.values());
  }
  
  async createWholesaleOrder(wholesaleOrder: InsertWholesaleOrder): Promise<WholesaleOrder> {
    const id = this.wholesaleOrderIdCounter++;
    const newWholesaleOrder: WholesaleOrder = {
      ...wholesaleOrder,
      id,
      status: 'pending',
      createdAt: new Date()
    };
    this.wholesaleOrdersStore.set(id, newWholesaleOrder);
    return newWholesaleOrder;
  }
  
  async updateWholesaleOrder(id: number, data: Partial<WholesaleOrder>): Promise<WholesaleOrder> {
    const wholesaleOrder = this.wholesaleOrdersStore.get(id);
    if (!wholesaleOrder) {
      throw new Error('Wholesale order not found');
    }
    
    const updatedWholesaleOrder = { ...wholesaleOrder, ...data };
    this.wholesaleOrdersStore.set(id, updatedWholesaleOrder);
    return updatedWholesaleOrder;
  }
}

export const storage = new MemStorage();
