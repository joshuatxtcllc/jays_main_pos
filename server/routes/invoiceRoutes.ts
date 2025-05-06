import express from 'express';
import { 
  getInvoiceById, 
  getCustomerInvoices, 
  sendInvoiceByEmail, 
  markInvoiceAsSent 
} from '../controllers/invoiceController';

const router = express.Router();

// Get invoice by order group ID
router.get('/:orderGroupId', getInvoiceById);

// Get all invoices for a customer
router.get('/customer/:customerId', getCustomerInvoices);

// Send invoice by email
router.post('/:orderGroupId/send', sendInvoiceByEmail);

// Mark invoice as sent (used for internal tracking)
router.patch('/:orderGroupId/mark-sent', markInvoiceAsSent);

// Generate PDF invoice (placeholder for now)
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

export default router;