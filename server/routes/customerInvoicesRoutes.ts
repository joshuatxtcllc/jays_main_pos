import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get all invoices for a customer
router.get('/:customerId/invoices', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!customerId || isNaN(parseInt(customerId))) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    
    const id = parseInt(customerId);
    
    // Get customer details
    const customer = await storage.getCustomer(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get all order groups for this customer (assuming this method exists)
    const orderGroups = await storage.getOrderGroupsByCustomerId(id);
    if (!orderGroups || orderGroups.length === 0) {
      return res.json([]);
    }
    
    // For each order group, get the orders and construct invoice data
    const invoices = await Promise.all(orderGroups.map(async (orderGroup) => {
      const orders = await storage.getOrdersByGroupId(orderGroup.id);
      return {
        orderGroup,
        orders,
        customer
      };
    }));
    
    return res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    return res.status(500).json({ message: 'Failed to fetch customer invoices' });
  }
});

export default router;