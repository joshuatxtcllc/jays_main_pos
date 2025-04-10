import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not found. Email service will not work.');
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: any[];
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('Email not sent: SENDGRID_API_KEY not configured');
    return false;
  }

  const msg = {
    to: options.to,
    from: options.from || 'noreply@jaysframesguru.com', // Default sender
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid Error:', error);
    return false;
  }
}

/**
 * Send an order confirmation email
 */
export async function sendOrderConfirmation(
  customerEmail: string,
  customerName: string,
  orderId: number,
  orderSummary: any
): Promise<boolean> {
  const subject = `Your Order Confirmation #${orderId} - Jay's Frames Guru`;
  
  // Generate HTML for order details
  let orderItems = '';
  if (orderSummary.items && Array.isArray(orderSummary.items)) {
    orderItems = orderSummary.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description || 'Custom Framing'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price || 0).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Confirmation</h2>
      
      <p>Hello ${customerName},</p>
      
      <p>Thank you for your order! We're pleased to confirm that we've received your custom framing order.</p>
      
      <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Order #${orderId}</h3>
        <p>Placed on: ${new Date().toLocaleDateString()}</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
          ${orderItems}
          <tr>
            <td style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
            <td style="padding: 10px; text-align: right;">$${(orderSummary.subtotal || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; text-align: right; font-weight: bold;">Tax:</td>
            <td style="padding: 10px; text-align: right;">$${(orderSummary.tax || 0).toFixed(2)}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 1.1em;">
            <td style="padding: 10px; text-align: right;">Total:</td>
            <td style="padding: 10px; text-align: right;">$${(orderSummary.total || 0).toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <p>We'll notify you when your custom frame is ready for pickup. You can also check the status of your order at any time by logging into your account or contacting us directly.</p>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Thank you for choosing Jay's Frames Guru!</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777;">
        <p>Jay's Frames Guru Framing<br>
        123 Main Street<br>
        Anytown, USA 12345<br>
        Phone: (555) 123-4567<br>
        Email: info@jaysframesguru.com</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Order Confirmation #${orderId} - Thank you for your order! We'll notify you when your custom frame is ready for pickup.`,
  });
}

/**
 * Send a payment receipt email
 */
export async function sendPaymentReceipt(
  customerEmail: string,
  customerName: string,
  orderGroupId: number,
  paymentDetails: any
): Promise<boolean> {
  const subject = `Payment Receipt - Order Group #${orderGroupId} - Jay's Frames Guru`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Receipt</h2>
      
      <p>Hello ${customerName},</p>
      
      <p>Thank you for your payment. This email confirms that we've received your payment for Order Group #${orderGroupId}.</p>
      
      <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Payment Details</h3>
        <p><strong>Date:</strong> ${new Date(paymentDetails.date || Date.now()).toLocaleDateString()}</p>
        <p><strong>Amount:</strong> $${(paymentDetails.amount || 0).toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${paymentDetails.method || 'Credit Card'}</p>
        <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId || 'N/A'}</p>
      </div>
      
      <p>Your framing order is now in progress. We'll send you updates as your order moves through our production process.</p>
      
      <p>Thank you for choosing Jay's Frames Guru!</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777;">
        <p>Jay's Frames Guru Framing<br>
        123 Main Street<br>
        Anytown, USA 12345<br>
        Phone: (555) 123-4567<br>
        Email: info@jaysframesguru.com</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Payment Receipt - Order Group #${orderGroupId} - Thank you for your payment of $${(paymentDetails.amount || 0).toFixed(2)}. Your framing order is now in progress.`,
  });
}

/**
 * Send an order status update email
 */
export async function sendOrderStatusUpdate(
  customerEmail: string,
  customerName: string,
  orderId: number,
  newStatus: string
): Promise<boolean> {
  // Format the status for display
  const statusDisplay = newStatus
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const subject = `Order #${orderId} Status Update - ${statusDisplay} - Jay's Frames Guru`;
  
  let statusMessage = '';
  switch (newStatus) {
    case 'in_progress':
      statusMessage = 'We\'ve started working on your custom frame! Our skilled craftsmen are now preparing the materials and will begin the framing process.';
      break;
    case 'completed':
      statusMessage = 'Great news! Your custom frame is complete and ready for pickup. Please visit our store during business hours to collect your beautifully framed piece.';
      break;
    case 'cancelled':
      statusMessage = 'Your order has been cancelled as requested. If you have any questions about this cancellation or would like to place a new order, please contact us.';
      break;
    default:
      statusMessage = `Your order status has been updated to "${statusDisplay}".`;
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Status Update</h2>
      
      <p>Hello ${customerName},</p>
      
      <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Order #${orderId}</h3>
        <p><strong>New Status:</strong> ${statusDisplay}</p>
        <p>${statusMessage}</p>
      </div>
      
      <p>If you have any questions about your order, please don't hesitate to contact us.</p>
      
      <p>Thank you for choosing Jay's Frames Guru!</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777;">
        <p>Jay's Frames Guru Framing<br>
        123 Main Street<br>
        Anytown, USA 12345<br>
        Phone: (555) 123-4567<br>
        Email: info@jaysframesguru.com</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Order #${orderId} Status Update - ${statusDisplay} - ${statusMessage}`,
  });
}