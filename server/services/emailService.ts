import { MailService } from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';

// Create a new instance of the MailService
const mailService = new MailService();

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
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

  try {
    // Create email data for SendGrid
    const msg: MailDataRequired = {
      to: options.to,
      from: options.from || 'noreply@jaysframesguru.com',
      subject: options.subject,
      text: options.text || options.subject // Ensure we always have text content
    };

    // Add text content if provided
    if (options.text) {
      msg.text = options.text;
    }

    // Add HTML content if provided
    if (options.html) {
      msg.html = options.html;
    }

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      msg.attachments = options.attachments;
    }

    await mailService.send(msg);
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
  newStatus: string,
  previousStatus?: string,
  estimatedCompletionDays?: number
): Promise<boolean> {
  // Format the status for display
  const formatStatus = (status: string) => status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const statusDisplay = formatStatus(newStatus);
  const previousStatusDisplay = previousStatus ? formatStatus(previousStatus) : '';
  
  const subject = `Order #${orderId} Status Update - ${statusDisplay} - Jay's Frames Guru`;
  
  // Determine the appropriate message based on the production status
  let statusMessage = '';
  let progressPercentage = 0;

  switch (newStatus) {
    case 'order_processed':
      statusMessage = 'Your custom framing order has been received and is being processed. We\'ll begin working on it soon!';
      progressPercentage = 10;
      break;
    case 'scheduled':
      const completionDate = estimatedCompletionDays 
        ? new Date(new Date().setDate(new Date().getDate() + estimatedCompletionDays)).toLocaleDateString() 
        : 'the estimated completion date';
      statusMessage = `Your order has been scheduled for production! Our team will complete your framing project by ${completionDate}.`;
      progressPercentage = 20;
      break;
    case 'materials_ordered':
      statusMessage = 'We\'ve ordered the special materials for your custom frame. This step ensures you get the perfect frame for your artwork.';
      progressPercentage = 30;
      break;
    case 'materials_arrived':
      statusMessage = 'Good news! The materials for your custom frame have arrived. We\'ll begin cutting and assembling soon.';
      progressPercentage = 40;
      break;
    case 'frame_cut':
      statusMessage = 'Our frame specialists have custom-cut your frame to the exact dimensions needed for your artwork.';
      progressPercentage = 60;
      break;
    case 'mat_cut':
      statusMessage = 'The matboard for your artwork has been precision-cut. This will beautifully showcase your piece while providing proper spacing.';
      progressPercentage = 70;
      break;
    case 'prepped':
      statusMessage = 'Your frame, mat, and glass have been prepared and your artwork is being carefully mounted and assembled.';
      progressPercentage = 85;
      break;
    case 'completed':
      statusMessage = 'Great news! Your custom frame is complete and ready for pickup. Please visit our store during business hours to collect your beautifully framed piece.';
      progressPercentage = 100;
      break;
    case 'delayed':
      statusMessage = 'We apologize, but there\'s been a slight delay with your order. Our team is working diligently to get back on schedule. We\'ll keep you updated on progress.';
      progressPercentage = previousStatus ? getProgressPercentage(previousStatus) : 50;
      break;
    default:
      statusMessage = `Your order status has been updated to "${statusDisplay}".`;
      progressPercentage = 50;
  }

  // Progress bar HTML
  const progressBarHtml = `
    <div style="margin: 20px 0;">
      <p style="margin-bottom: 5px;"><strong>Order Progress: ${progressPercentage}%</strong></p>
      <div style="background-color: #eee; border-radius: 5px; height: 20px; width: 100%;">
        <div style="background-color: #4CAF50; border-radius: 5px; height: 20px; width: ${progressPercentage}%"></div>
      </div>
      <p style="font-size: 0.8em; color: #666; margin-top: 5px;">Current Stage: ${statusDisplay}</p>
    </div>
  `;

  // Next steps message
  let nextStepsMessage = '';
  if (newStatus !== 'completed' && newStatus !== 'delayed') {
    const nextStep = getNextStep(newStatus);
    nextStepsMessage = `
      <div style="margin-top: 15px;">
        <p><strong>What's Next:</strong> ${nextStep}</p>
      </div>
    `;
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Progress Update</h2>
      
      <p>Hello ${customerName},</p>
      
      <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Order #${orderId}</h3>
        
        ${progressBarHtml}
        
        <p><strong>Update:</strong> ${statusMessage}</p>
        
        ${nextStepsMessage}
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
    text: `Order #${orderId} Progress Update - ${statusDisplay} (${progressPercentage}% complete) - ${statusMessage}`,
  });
}

// Helper function to get the appropriate next step message
function getNextStep(currentStatus: string): string {
  switch (currentStatus) {
    case 'order_processed':
      return "We'll schedule your order for production and provide an estimated completion date.";
    case 'scheduled':
      return "We'll order specialized materials for your custom frame from our suppliers.";
    case 'materials_ordered':
      return "Once materials arrive, we'll begin the framing process.";
    case 'materials_arrived':
      return "Our master framers will cut your custom frame pieces to precision dimensions.";
    case 'frame_cut':
      return "We'll prepare the matboard that will showcase your artwork.";
    case 'mat_cut':
      return "Final assembly of your custom frame, including mounting your artwork and installing glass.";
    case 'prepped':
      return "Quality inspection and finishing details, preparing your frame for pickup.";
    default:
      return "We'll continue processing your order through our production workflow.";
  }
}

// Helper function to get progress percentage based on status
function getProgressPercentage(status: string): number {
  switch (status) {
    case 'order_processed': return 10;
    case 'scheduled': return 20;
    case 'materials_ordered': return 30;
    case 'materials_arrived': return 40;
    case 'frame_cut': return 60;
    case 'mat_cut': return 70;
    case 'prepped': return 85;
    case 'completed': return 100;
    default: return 50;
  }
}