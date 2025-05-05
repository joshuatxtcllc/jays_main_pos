
import express from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import * as orderStatusHistoryService from '../services/orderStatusHistoryService';

const router = express.Router();

// Get status history for a specific order
router.get('/orders/:orderId/status-history', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    const history = await orderStatusHistoryService.getOrderStatusHistory(orderId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting order status history:', error);
    res.status(500).json({ message: 'Error retrieving order status history' });
  }
});

// Get status history for all orders of a customer
router.get('/customers/:customerId/status-history', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    
    const history = await orderStatusHistoryService.getCustomerOrderStatusHistory(customerId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting customer order status history:', error);
    res.status(500).json({ message: 'Error retrieving customer order status history' });
  }
});

export default router;
