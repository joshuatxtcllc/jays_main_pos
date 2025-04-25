import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Get all invoices for a customer
router.get('/:customerId/invoices', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    
    // Verify the customer exists
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get all order groups for this customer
    const orderGroups = await storage.getOrderGroupsByCustomerId(customerId);
    if (!orderGroups || orderGroups.length === 0) {
      return res.status(200).json([]);
    }
    
    // Map the order groups into a more complete invoice representation
    const invoices = await Promise.all(orderGroups.map(async (group) => {
      const orders = await storage.getOrdersByGroupId(group.id);
      return {
        id: group.id,
        date: group.createdAt,
        paidAt: group.paidAt,
        status: group.status,
        paymentMethod: group.paymentMethod,
        subtotal: group.subtotal,
        tax: group.tax,
        total: group.total,
        orderCount: orders.length,
        orders
      };
    }));
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error getting customer invoices:', error);
    res.status(500).json({ message: 'Error retrieving customer invoices' });
  }
});

// Get a specific invoice for a customer
router.get('/:customerId/invoices/:orderGroupId', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const orderGroupId = parseInt(req.params.orderGroupId);
    
    if (isNaN(customerId) || isNaN(orderGroupId)) {
      return res.status(400).json({ message: 'Invalid ID parameters' });
    }
    
    // Verify the customer exists
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get the order group and verify it belongs to this customer
    const orderGroup = await storage.getOrderGroup(orderGroupId);
    if (!orderGroup || orderGroup.customerId !== customerId) {
      return res.status(404).json({ message: 'Invoice not found for this customer' });
    }
    
    // Get the orders for this order group
    const orders = await storage.getOrdersByGroupId(orderGroupId);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this invoice' });
    }
    
    // Return the complete invoice data
    res.status(200).json({
      orderGroup,
      customer,
      orders
    });
  } catch (error) {
    console.error('Error getting customer invoice:', error);
    res.status(500).json({ message: 'Error retrieving customer invoice' });
  }
});

export default router;