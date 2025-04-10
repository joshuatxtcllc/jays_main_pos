import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAllLarsonMatboards, getCrescentMatboards } from "./controllers/matboardController";
import { 
  insertCustomerSchema, 
  insertOrderSchema,
  insertOrderSpecialServiceSchema,
  insertWholesaleOrderSchema,
  insertOrderGroupSchema
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // Customers
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      
      // Check if customer with same email already exists
      if (validatedData.email) {
        const existingCustomer = await storage.getCustomerByEmail(validatedData.email);
        if (existingCustomer) {
          return res.json(existingCustomer);
        }
      }
      
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Frames
  app.get('/api/frames', async (req, res) => {
    try {
      const frames = await storage.getAllFrames();
      res.json(frames);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch frames" });
    }
  });

  app.get('/api/frames/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const frame = await storage.getFrame(id);
      
      if (!frame) {
        return res.status(404).json({ message: "Frame not found" });
      }
      
      res.json(frame);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch frame" });
    }
  });

  // Mat Colors
  app.get('/api/mat-colors', async (req, res) => {
    try {
      const matColors = await storage.getAllMatColors();
      res.json(matColors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mat colors" });
    }
  });

  app.get('/api/mat-colors/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const matColor = await storage.getMatColor(id);
      
      if (!matColor) {
        return res.status(404).json({ message: "Mat color not found" });
      }
      
      res.json(matColor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mat color" });
    }
  });

  // Glass Options
  app.get('/api/glass-options', async (req, res) => {
    try {
      const glassOptions = await storage.getAllGlassOptions();
      res.json(glassOptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch glass options" });
    }
  });

  app.get('/api/glass-options/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const glassOption = await storage.getGlassOption(id);
      
      if (!glassOption) {
        return res.status(404).json({ message: "Glass option not found" });
      }
      
      res.json(glassOption);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch glass option" });
    }
  });

  // Special Services
  app.get('/api/special-services', async (req, res) => {
    try {
      const specialServices = await storage.getAllSpecialServices();
      res.json(specialServices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch special services" });
    }
  });

  app.get('/api/special-services/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const specialService = await storage.getSpecialService(id);
      
      if (!specialService) {
        return res.status(404).json({ message: "Special service not found" });
      }
      
      res.json(specialService);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch special service" });
    }
  });

  // Orders
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', async (req, res) => {
    console.log('POST /api/orders - Received request body:', req.body);
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      console.log('POST /api/orders - Validated order data:', validatedData);
      
      // Calculate prices
      if (validatedData.frameId && validatedData.matColorId && validatedData.glassOptionId) {
        console.log('POST /api/orders - Looking up related entities');
        const frame = await storage.getFrame(validatedData.frameId);
        const matColor = await storage.getMatColor(validatedData.matColorId);
        const glassOption = await storage.getGlassOption(validatedData.glassOptionId);
        console.log('POST /api/orders - Found entities:', { 
          frame: frame ? 'Found' : 'Not found', 
          matColor: matColor ? 'Found' : 'Not found', 
          glassOption: glassOption ? 'Found' : 'Not found' 
        });
        
        if (frame && matColor && glassOption) {
          // Calculate perimeter in feet
          const perimeter = 2 * (Number(validatedData.artworkWidth) + Number(validatedData.artworkHeight)) / 12;
          
          // Frame price (with markup)
          const framePrice = perimeter * Number(frame.price) * 3.5;
          
          // Mat price (with markup)
          const matArea = ((Number(validatedData.artworkWidth) + 2 * Number(validatedData.matWidth)) * 
                           (Number(validatedData.artworkHeight) + 2 * Number(validatedData.matWidth))) - 
                           (Number(validatedData.artworkWidth) * Number(validatedData.artworkHeight));
          const matPrice = matArea * Number(matColor.price) * 3;
          
          // Glass price (with markup)
          const glassArea = (Number(validatedData.artworkWidth) + 2 * Number(validatedData.matWidth)) * 
                           (Number(validatedData.artworkHeight) + 2 * Number(validatedData.matWidth));
          const glassPrice = glassArea * Number(glassOption.price) * 3;
          
          // Backing price (with markup)
          const backingPrice = glassArea * 0.03 * 2.5;
          
          // Labor price
          const laborPrice = 20 + (Number(validatedData.artworkWidth) * Number(validatedData.artworkHeight) * 0.05);
          
          // Calculate subtotal
          const subtotal = framePrice + matPrice + glassPrice + backingPrice + laborPrice;
          
          // Apply tax
          const tax = subtotal * 0.08;
          
          // Total
          const total = subtotal + tax;
          
          // Update order data with calculated prices
          validatedData.subtotal = subtotal.toString();
          validatedData.tax = tax.toString();
          validatedData.total = total.toString();
        }
      }
      
      console.log('POST /api/orders - Creating order in database with data:', validatedData);
      const order = await storage.createOrder(validatedData);
      console.log('POST /api/orders - Order created successfully:', order);
      res.status(201).json(order);
    } catch (error) {
      console.error('POST /api/orders - Error creating order:', error);
      if (error instanceof z.ZodError) {
        console.error('POST /api/orders - Validation error:', error.errors);
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Validate status
      if (req.body.status) {
        if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(req.body.status)) {
          return res.status(400).json({ message: "Invalid status value" });
        }
      }
      
      const updatedOrder = await storage.updateOrder(id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Order Special Services
  app.post('/api/order-special-services', async (req, res) => {
    try {
      const validatedData = insertOrderSpecialServiceSchema.parse(req.body);
      const orderSpecialService = await storage.createOrderSpecialService(validatedData);
      res.status(201).json(orderSpecialService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order special service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order special service" });
    }
  });

  app.get('/api/orders/:id/special-services', async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const specialServices = await storage.getOrderSpecialServices(orderId);
      res.json(specialServices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order special services" });
    }
  });

  // Wholesale Orders
  app.get('/api/wholesale-orders', async (req, res) => {
    try {
      const wholesaleOrders = await storage.getAllWholesaleOrders();
      res.json(wholesaleOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wholesale orders" });
    }
  });

  app.get('/api/wholesale-orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const wholesaleOrder = await storage.getWholesaleOrder(id);
      
      if (!wholesaleOrder) {
        return res.status(404).json({ message: "Wholesale order not found" });
      }
      
      res.json(wholesaleOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wholesale order" });
    }
  });

  app.post('/api/wholesale-orders', async (req, res) => {
    try {
      const validatedData = insertWholesaleOrderSchema.parse(req.body);
      
      // Get the order to extract frame and manufacturer info
      const orderId = validatedData.orderId ?? 0;
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get the frame to get manufacturer
      if (!order.frameId) {
        return res.status(400).json({ message: "Frame ID not found for the order" });
      }
      
      const frame = await storage.getFrame(order.frameId);
      
      if (!frame) {
        return res.status(400).json({ message: "Frame not found for the order" });
      }
      
      // Prepare wholesale order data
      const wholesaleOrderData = {
        ...validatedData,
        manufacturer: frame.manufacturer,
        items: [
          {
            type: "frame",
            id: frame.id,
            name: frame.name,
            quantity: Math.ceil((2 * (Number(order.artworkWidth) + Number(order.artworkHeight)) / 12) + 1),
            unit: "feet"
          },
          {
            type: "glass",
            id: order.glassOptionId,
            size: `${Math.ceil(Number(order.artworkWidth) + 2 * Number(order.matWidth))} × ${Math.ceil(Number(order.artworkHeight) + 2 * Number(order.matWidth))}`,
            quantity: 1,
            unit: "piece"
          },
          {
            type: "mat",
            id: order.matColorId,
            size: `${Math.ceil(Number(order.artworkWidth) + 2 * Number(order.matWidth) + 4)} × ${Math.ceil(Number(order.artworkHeight) + 2 * Number(order.matWidth) + 4)}`,
            quantity: 1,
            unit: "sheet"
          }
        ]
      };
      
      const wholesaleOrder = await storage.createWholesaleOrder(wholesaleOrderData);
      res.status(201).json(wholesaleOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wholesale order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create wholesale order" });
    }
  });

  app.patch('/api/wholesale-orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const wholesaleOrder = await storage.getWholesaleOrder(id);
      
      if (!wholesaleOrder) {
        return res.status(404).json({ message: "Wholesale order not found" });
      }
      
      // Validate status
      if (req.body.status) {
        if (!['pending', 'ordered', 'received', 'cancelled'].includes(req.body.status)) {
          return res.status(400).json({ message: "Invalid status value" });
        }
      }
      
      const updatedWholesaleOrder = await storage.updateWholesaleOrder(id, req.body);
      res.json(updatedWholesaleOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update wholesale order" });
    }
  });
  
  // Larson Juhl Catalog
  app.get('/api/larson-catalog', getAllLarsonMatboards);
  app.get('/api/larson-catalog/crescent', getCrescentMatboards);

  // Order Groups
  app.get('/api/order-groups', async (req, res) => {
    try {
      const orderGroups = await storage.getAllOrderGroups();
      res.json(orderGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order groups" });
    }
  });

  app.get('/api/order-groups/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderGroup = await storage.getOrderGroup(id);
      
      if (!orderGroup) {
        return res.status(404).json({ message: "Order group not found" });
      }
      
      res.json(orderGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order group" });
    }
  });

  app.get('/api/order-groups/:id/orders', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orders = await storage.getOrdersByGroupId(id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders for group" });
    }
  });

  app.get('/api/customers/:id/active-order-group', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderGroup = await storage.getActiveOrderGroupByCustomer(id);
      
      if (!orderGroup) {
        return res.status(404).json({ message: "No active order group found for customer" });
      }
      
      res.json(orderGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active order group" });
    }
  });

  app.post('/api/order-groups', async (req, res) => {
    try {
      const validatedData = insertOrderGroupSchema.parse(req.body);
      
      const orderGroup = await storage.createOrderGroup(validatedData);
      res.status(201).json(orderGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order group data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order group" });
    }
  });

  app.patch('/api/order-groups/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderGroup = await storage.getOrderGroup(id);
      
      if (!orderGroup) {
        return res.status(404).json({ message: "Order group not found" });
      }
      
      // Validate status
      if (req.body.status) {
        if (!['open', 'completed', 'cancelled'].includes(req.body.status)) {
          return res.status(400).json({ message: "Invalid status value" });
        }
      }
      
      const updatedOrderGroup = await storage.updateOrderGroup(id, req.body);
      res.json(updatedOrderGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order group" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
