import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Get invoice by order group ID
router.get('/:orderGroupId', async (req, res) => {
  try {
    const orderGroupId = parseInt(req.params.orderGroupId);
    if (isNaN(orderGroupId)) {
      return res.status(400).json({ message: 'Invalid order group ID' });
    }
    
    // Get the order group
    const orderGroup = await storage.getOrderGroup(orderGroupId);
    if (!orderGroup) {
      return res.status(404).json({ message: 'Order group not found' });
    }
    
    // Get the customer
    const customer = orderGroup.customerId 
      ? await storage.getCustomer(orderGroup.customerId)
      : undefined;
    
    if (!customer && orderGroup.customerId) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get the orders for this order group
    const orders = await storage.getOrdersByGroupId(orderGroupId);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this group' });
    }
    
    // Return the invoice data
    res.status(200).json({
      orderGroup,
      customer,
      orders
    });
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ message: 'Error retrieving invoice data' });
  }
});

// Generate PDF invoice (placeholder for future functionality)
router.get('/:orderGroupId/pdf', async (req, res) => {
  try {
    const orderGroupId = parseInt(req.params.orderGroupId);
    if (isNaN(orderGroupId)) {
      return res.status(400).json({ message: 'Invalid order group ID' });
    }
    
    // This would generate a PDF in a real implementation
    // For now, just return a success message
    res.status(200).json({ message: 'PDF generation feature coming soon' });
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    res.status(500).json({ message: 'Error generating PDF invoice' });
  }
});

// Email invoice to customer (placeholder for future functionality)
router.post('/:orderGroupId/email', async (req, res) => {
  try {
    const orderGroupId = parseInt(req.params.orderGroupId);
    if (isNaN(orderGroupId)) {
      return res.status(400).json({ message: 'Invalid order group ID' });
    }
    
    // This would email the invoice in a real implementation
    // For now, just return a success message
    res.status(200).json({ message: 'Email functionality coming soon' });
  } catch (error) {
    console.error('Error emailing invoice:', error);
    res.status(500).json({ message: 'Error emailing invoice' });
  }
});

export default router;