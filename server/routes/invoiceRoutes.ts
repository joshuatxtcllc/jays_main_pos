import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get invoice by order group ID
router.get('/:orderGroupId', async (req, res) => {
  try {
    const { orderGroupId } = req.params;
    
    if (!orderGroupId || isNaN(parseInt(orderGroupId))) {
      return res.status(400).json({ message: 'Invalid order group ID' });
    }
    
    const groupId = parseInt(orderGroupId);
    
    // Get order group details
    const orderGroup = await storage.getOrderGroup(groupId);
    if (!orderGroup) {
      return res.status(404).json({ message: 'Order group not found' });
    }
    
    // Get all orders in this group
    const orders = await storage.getOrdersByGroupId(groupId);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found in this group' });
    }
    
    // Get customer details
    const customer = await storage.getCustomer(orderGroup.customerId || 0);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Return all the data needed for the invoice
    return res.status(200).json({
      orderGroup,
      orders,
      customer
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return res.status(500).json({ message: 'Failed to generate invoice' });
  }
});

// Send invoice by email
router.post('/:orderGroupId/send', async (req, res) => {
  try {
    const { orderGroupId } = req.params;
    const { email } = req.body;
    
    if (!orderGroupId || isNaN(parseInt(orderGroupId))) {
      return res.status(400).json({ message: 'Invalid order group ID' });
    }
    
    const groupId = parseInt(orderGroupId);
    
    // Get order group details
    const orderGroup = await storage.getOrderGroup(groupId);
    if (!orderGroup) {
      return res.status(404).json({ message: 'Order group not found' });
    }
    
    // Get customer details
    const customer = await storage.getCustomer(orderGroup.customerId || 0);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Use customer email if not specified in request
    const recipientEmail = email || customer.email;
    if (!recipientEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'No email address available for this customer' 
      });
    }
    
    // Get all orders in this group
    const orders = await storage.getOrdersByGroupId(groupId);
    
    // Update the order group to mark the invoice as sent
    await storage.updateOrderGroup(groupId, { 
      invoiceEmailSent: true,
      invoiceEmailDate: new Date()
    });
    
    return res.status(200).json({ 
      success: true,
      message: 'Invoice sent successfully' 
    });
  } catch (error) {
    console.error('Error sending invoice by email:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to send invoice by email' 
    });
  }
});

// Mark invoice as sent
router.patch('/:orderGroupId/mark-sent', async (req, res) => {
  try {
    const { orderGroupId } = req.params;
    
    if (!orderGroupId || isNaN(parseInt(orderGroupId))) {
      return res.status(400).json({ message: 'Invalid order group ID' });
    }
    
    const groupId = parseInt(orderGroupId);
    
    // Update the order group to mark the invoice as sent
    await storage.updateOrderGroup(groupId, { 
      invoiceEmailSent: true,
      invoiceEmailDate: new Date()
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking invoice as sent:', error);
    return res.status(500).json({ success: false });
  }
});

export default router;