
import express from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const router = express.Router();

// Customer portal login
router.post('/login', async (req, res) => {
  try {
    const { email, orderId } = req.body;
    
    if (!email || !orderId) {
      return res.status(400).json({ message: 'Email and order ID are required' });
    }
    
    // Find customer by email
    const customers = await db.execute(sql`
      SELECT * FROM customers 
      WHERE email = ${email} 
      LIMIT 1
    `);
    
    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const customer = customers[0];
    
    // Check if the order exists and belongs to this customer
    const orders = await db.execute(sql`
      SELECT * FROM orders 
      WHERE id = ${orderId} AND customer_id = ${customer.id}
      LIMIT 1
    `);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found or not associated with this email' });
    }
    
    // Generate JWT token for customer portal authentication
    const token = jwt.sign(
      { customerId: customer.id, email: customer.email },
      process.env.JWT_SECRET || 'customer-portal-secret',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      token,
      customerId: customer.id,
      customerName: customer.name
    });
  } catch (error) {
    console.error('Error in customer portal login:', error);
    res.status(500).json({ message: 'Error authenticating customer' });
  }
});

// Verify customer token middleware
export const verifyCustomerToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'customer-portal-secret');
    req.customer = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Get customer orders
router.get('/orders', verifyCustomerToken, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    
    const orders = await storage.getOrdersByCustomerId(customerId);
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get detailed order information
router.get('/orders/:orderId', verifyCustomerToken, async (req, res) => {
  try {
    const customerId = req.customer.customerId;
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    // Verify the order belongs to this customer
    const orders = await db.execute(sql`
      SELECT * FROM orders 
      WHERE id = ${orderId} AND customer_id = ${customerId}
      LIMIT 1
    `);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = await storage.getOrder(orderId);
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

export default router;
