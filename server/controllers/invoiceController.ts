import { Request, Response } from 'express';
import { storage } from '../storage';
import { sendEmailWithSendGrid } from '../services/emailService';

export async function getInvoiceById(req: Request, res: Response) {
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
}

export async function getCustomerInvoices(req: Request, res: Response) {
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
    
    // Get all order groups for this customer
    const orderGroups = await storage.getCustomerOrderGroups(id);
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
}

export async function sendInvoiceByEmail(req: Request, res: Response) {
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
    
    // Generate the invoice HTML (this would be more sophisticated in production)
    const invoiceHTML = generateInvoiceHTML(orderGroup, orders, customer);
    
    // Send the email
    await sendEmailWithSendGrid({
      to: recipientEmail,
      from: 'info@jaysframes.com', // This should be a verified sender
      subject: `Your Invoice #${orderGroup.id} from Jay's Frames`,
      text: `Thank you for your business! Your invoice #${orderGroup.id} is attached.`,
      html: invoiceHTML
    });
    
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
}

export async function markInvoiceAsSent(req: Request, res: Response) {
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
}

// Helper function to generate a simple HTML invoice (this would be more sophisticated in production)
function generateInvoiceHTML(orderGroup: any, orders: any[], customer: any): string {
  // Format currency
  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return '$0.00';
    return `$${Number(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  // Generate the line items for the orders
  const orderRows = orders.map(order => `
    <tr>
      <td>Custom Framing #${order.id}</td>
      <td>${order.artworkDescription || 'Custom Frame'}<br>${order.artworkType ? `Type: ${order.artworkType}` : ''}</td>
      <td>${order.artworkWidth}" × ${order.artworkHeight}"<br>Mat: ${order.matWidth}"</td>
      <td>${order.quantity}</td>
      <td style="text-align: right;">${formatCurrency(order.subtotal)}</td>
      <td style="text-align: right;">${formatCurrency(order.total)}</td>
    </tr>
  `).join('');

  // Generate the HTML for the invoice
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${orderGroup.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .invoice-details {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
        }
        .text-right {
          text-align: right;
        }
        .customer-details, .invoice-info {
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <div class="invoice-title">Jays Frames Guru Framing</div>
          <div>123 Frame Street</div>
          <div>Anytown, ST 12345</div>
          <div>Phone: (555) 123-4567</div>
          <div>Email: info@jaysframes.com</div>
        </div>
        <div style="text-align: right;">
          <div class="invoice-title">INVOICE</div>
          <div><strong>Invoice #:</strong> ${orderGroup.id}</div>
          <div><strong>Date:</strong> ${formatDate(orderGroup.createdAt)}</div>
          <div><strong>Due Date:</strong> ${formatDate(orderGroup.paymentDate || orderGroup.createdAt)}</div>
          <div><strong>Status:</strong> ${orderGroup.stripePaymentStatus || orderGroup.status}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div class="customer-details">
          <div style="font-weight: bold; margin-bottom: 5px;">Bill To:</div>
          <div>${customer.name}</div>
          <div>${customer.address || 'No address on file'}</div>
          <div>Phone: ${customer.phone || 'N/A'}</div>
          <div>Email: ${customer.email || 'N/A'}</div>
        </div>
        <div class="invoice-info">
          <div><strong>Payment Method:</strong> ${orderGroup.paymentMethod || 'N/A'}</div>
          ${orderGroup.paymentMethod === 'check' ? `<div><strong>Check #:</strong> ${orderGroup.checkNumber || 'N/A'}</div>` : ''}
          ${orderGroup.discountAmount ? `
            <div>
              <strong>Discount:</strong> ${orderGroup.discountType === 'percentage'
                ? `${orderGroup.discountAmount}%`
                : formatCurrency(orderGroup.discountAmount)}
            </div>
          ` : ''}
          <div><strong>Tax Exempt:</strong> ${orderGroup.taxExempt ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Size</th>
            <th>Quantity</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderRows}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end;">
        <table style="width: 250px;">
          <tbody>
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td class="text-right">${formatCurrency(orderGroup.subtotal)}</td>
            </tr>
            ${orderGroup.discountAmount ? `
            <tr>
              <td><strong>Discount:</strong></td>
              <td class="text-right">-${formatCurrency(orderGroup.discountAmount)}</td>
            </tr>
            ` : ''}
            <tr>
              <td><strong>Tax:</strong></td>
              <td class="text-right">${formatCurrency(orderGroup.tax)}</td>
            </tr>
            <tr style="border-top: 1px solid #ddd;">
              <td style="padding-top: 5px;"><strong>Total:</strong></td>
              <td class="text-right" style="padding-top: 5px; font-weight: bold;">${formatCurrency(orderGroup.total)}</td>
            </tr>
            ${orderGroup.paymentMethod === 'cash' && orderGroup.cashAmount ? `
            <tr>
              <td><strong>Cash Received:</strong></td>
              <td class="text-right">${formatCurrency(orderGroup.cashAmount)}</td>
            </tr>
            <tr>
              <td><strong>Change:</strong></td>
              <td class="text-right">${formatCurrency(Number(orderGroup.cashAmount) - Number(orderGroup.total))}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 30px; font-size: 14px;">
        <div style="font-weight: bold; margin-bottom: 5px;">Terms & Conditions:</div>
        <ul style="padding-left: 20px;">
          <li>Payment is due upon receipt unless other arrangements have been made.</li>
          <li>Custom framing orders cannot be returned or exchanged.</li>
          <li>Please retain this invoice for your records and for pickup of your completed orders.</li>
        </ul>
      </div>

      <div class="footer">
        Thank you for your business!
      </div>
    </body>
    </html>
  `;
}