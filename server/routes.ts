import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { getAllLarsonMatboards, getCrescentMatboards, syncMatboardsToMatColors } from "./controllers/matboardController";
import { importCrescentSelect, getCrescentSelect } from "./controllers/crescentSelectController";
import { getAllFrames, getFrameById, getFramesByManufacturer } from "./controllers/frameController";
import { 
  insertCustomerSchema, 
  insertOrderSchema,
  insertOrderSpecialServiceSchema,
  insertWholesaleOrderSchema,
  insertOrderGroupSchema,
  orders
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import { 
  calculateFramePrice, 
  calculateMatPrice, 
  calculateGlassPrice 
} from "./services/pricingService";

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
          // Calculate united inch (width + height)
          const unitedInch = Number(validatedData.artworkWidth) + Number(validatedData.artworkHeight);
          console.log('Frame united inch:', unitedInch);
          
          // Calculate perimeter in feet
          const perimeter = 2 * unitedInch / 12;
          console.log('Frame perimeter:', perimeter, 'feet');
          
          // Calculate frame price using sliding scale markup based on wholesale price per foot
          const frameWholesalePrice = Number(frame.price);
          const framePrice = calculateFramePrice(frameWholesalePrice, perimeter);
          console.log('Frame price:', framePrice, 'from base price:', frameWholesalePrice);
          
          // Mat pricing calculations
          // For matboard, we need the outer dimensions (including the matboard border)
          const outerWidth = Number(validatedData.artworkWidth) + 2 * Number(validatedData.matWidth);
          const outerHeight = Number(validatedData.artworkHeight) + 2 * Number(validatedData.matWidth);
          const outerUnitedInch = outerWidth + outerHeight;
          console.log('Mat outer united inch:', outerUnitedInch);
          
          // Calculate mat area
          const matArea = (outerWidth * outerHeight) - (Number(validatedData.artworkWidth) * Number(validatedData.artworkHeight));
          console.log('Mat area:', matArea, 'square inches');
          
          // Calculate mat price using our pricing service
          const matPriceBase = Number(matColor.price);
          const matPrice = calculateMatPrice(matPriceBase, matArea, outerUnitedInch);
          console.log('Mat price:', matPrice, 'from base price:', matPriceBase);
          
          // Glass price calculations
          const glassArea = (Number(validatedData.artworkWidth) + 2 * Number(validatedData.matWidth)) * 
                           (Number(validatedData.artworkHeight) + 2 * Number(validatedData.matWidth));
          const glassWholesalePrice = Number(glassOption.price);
          const glassPrice = calculateGlassPrice(glassWholesalePrice, glassArea);
          console.log('Glass price:', glassPrice, 'from base price:', glassWholesalePrice);
          
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
      
      // Create or use existing order group
      let orderGroupId = validatedData.orderGroupId;
      if (!orderGroupId) {
        console.log('POST /api/orders - No order group ID provided, creating a new order group');
        
        // Create a new order group for this order
        const orderGroup = await storage.createOrderGroup({
          customerId: validatedData.customerId,
          subtotal: validatedData.subtotal, 
          tax: validatedData.tax,
          total: validatedData.total,
          status: 'open'
        });
        console.log('POST /api/orders - Created new order group:', orderGroup);
        
        // Use the new order group ID
        orderGroupId = orderGroup.id;
        validatedData.orderGroupId = orderGroupId;
      }
      
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
  app.post('/api/larson-catalog/sync', syncMatboardsToMatColors);
  
  // Crescent Select Matboards
  app.get('/api/crescent-select', getCrescentSelect);
  app.post('/api/crescent-select/import', importCrescentSelect);
  
  // Frame Catalog API
  app.get('/api/frames', getAllFrames);
  app.get('/api/frames/:id', getFrameById);
  app.get('/api/frames/manufacturer/:manufacturer', getFramesByManufacturer);

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
  
  // Get all orders for a customer (order history)
  app.get('/api/customers/:id/orders', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Get all orders for this customer directly from storage
      const allOrders = await storage.getAllOrders();
      const customerOrders = allOrders.filter(o => o.customerId === id);
      
      // Get unique order group IDs
      const uniqueOrderGroupIds: number[] = [];
      customerOrders.forEach(order => {
        if (order.orderGroupId !== undefined && order.orderGroupId !== null && 
            !uniqueOrderGroupIds.includes(order.orderGroupId)) {
          uniqueOrderGroupIds.push(order.orderGroupId);
        }
      });
      
      const orderGroups = [];
      
      for (const groupId of uniqueOrderGroupIds) {
        const group = await storage.getOrderGroup(groupId);
        if (group) {
          orderGroups.push(group);
        }
      }
      
      // Create an enhanced response with order details
      const orderHistory = orderGroups.map(group => {
        const groupOrders = customerOrders.filter(order => order.orderGroupId === group.id);
        return {
          orderGroup: group,
          orders: groupOrders,
          orderDate: group.createdAt,
          paymentDate: group.paymentDate,
          paymentStatus: group.stripePaymentStatus,
          total: group.total
        };
      });
      
      res.json(orderHistory);
    } catch (error) {
      console.error('Error fetching customer order history:', error);
      res.status(500).json({ message: "Failed to fetch customer order history" });
    }
  });
  
  // Update customer details
  app.patch('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const updatedCustomer = await storage.updateCustomer(id, req.body);
      res.json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
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

  // Initialize Stripe
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error("Missing STRIPE_SECRET_KEY environment variable");
  }
  
  const stripe = new Stripe(stripeSecretKey || '', {
    apiVersion: '2023-10-16' as any,
  });

  // Payment Processing Routes
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { orderGroupId } = req.body;
      
      if (!orderGroupId) {
        return res.status(400).json({ message: "Order group ID is required" });
      }
      
      const orderGroup = await storage.getOrderGroup(parseInt(orderGroupId));
      if (!orderGroup) {
        return res.status(404).json({ message: "Order group not found" });
      }
      
      // Get the customer
      const customer = orderGroup.customerId ? 
        await storage.getCustomer(orderGroup.customerId) : null;
        
      // Get all orders in the group to calculate total
      const orders = await storage.getOrdersByGroupId(orderGroup.id);
      
      // Calculate the total amount for all orders
      let totalAmount = 0;
      for (const order of orders) {
        totalAmount += Number(order.total);
      }
      
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(totalAmount * 100);
      
      // Create a Stripe customer if needed
      let stripeCustomerId = customer?.stripeCustomerId;
      if (customer && !stripeCustomerId && customer.email) {
        // Create customer params object with required fields
        const customerParams: Stripe.CustomerCreateParams = {
          name: customer.name || undefined
        };
        
        // Only add email and phone if they exist and aren't null
        if (customer.email) customerParams.email = customer.email;
        if (customer.phone) customerParams.phone = customer.phone;
        
        const stripeCustomer = await stripe.customers.create(customerParams);
        stripeCustomerId = stripeCustomer.id;
        
        // Update customer with Stripe ID
        if (stripeCustomerId) {
          await storage.updateCustomer(customer.id, { stripeCustomerId });
        }
      }
      
      // Create the payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderGroupId: orderGroup.id.toString(),
          customer: customer ? customer.name : 'Guest',
        },
      });
      
      // Update the order group with the payment intent ID
      await storage.updateOrderGroup(orderGroup.id, {
        stripePaymentIntentId: paymentIntent.id,
        stripePaymentStatus: 'pending',
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  // Webhook for handling Stripe events
  app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // For testing without webhook setup
    if (!endpointSecret || !sig) {
      // Handle raw event directly for development
      const event = req.body;
      try {
        await handleStripeEvent(event);
        res.json({ received: true });
      } catch (error: any) {
        console.error('Error handling webhook event:', error);
        res.status(400).send(`Webhook Error: ${error.message || 'Unknown error'}`);
      }
      return;
    }
    
    // Production webhook handling with signature verification
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body, 
        sig, 
        endpointSecret
      );
      await handleStripeEvent(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error('Error verifying webhook signature:', error);
      res.status(400).send(`Webhook Error: ${error.message || 'Unknown error'}`);
    }
  });

  // Helper function to handle Stripe webhook events
  async function handleStripeEvent(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Get the order group ID from metadata
        const orderGroupId = paymentIntent.metadata.orderGroupId;
        if (orderGroupId) {
          // Update order group status
          await storage.updateOrderGroup(parseInt(orderGroupId), {
            status: 'paid',
            stripePaymentStatus: 'succeeded',
            paymentDate: new Date(),
          });
          
          // Update order statuses
          const orders = await storage.getOrdersByGroupId(parseInt(orderGroupId));
          for (const order of orders) {
            await storage.updateOrder(order.id, {
              status: 'in_progress'
            });
          }
          
          // Get customer information for email notification
          if (orders.length > 0 && orders[0].customerId) {
            const customer = await storage.getCustomer(orders[0].customerId);
            if (customer && customer.email) {
              // Email notifications will be handled here
              console.log(`Payment success for customer ${customer.email}, orderGroupId: ${orderGroupId}`);
              // TODO: Send email notifications using emailService
            }
          }
        }
        break;
      
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        const failedOrderGroupId = failedPaymentIntent.metadata.orderGroupId;
        
        if (failedOrderGroupId) {
          await storage.updateOrderGroup(parseInt(failedOrderGroupId), {
            stripePaymentStatus: 'failed',
          });
        }
        break;
    }
  }

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
