import sgMail from '@sendgrid/mail';

// Initialize SendGrid with the API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using SendGrid
 * @param params Email parameters including to, from, subject, text, and html
 * @returns A promise that resolves when the email is sent
 */
export async function sendEmailWithSendGrid(params: EmailParams): Promise<void> {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key is not configured. Email sending is disabled.');
    return;
  }

  try {
    // Send the email
    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    console.log(`Email sent successfully to ${params.to}`);
  } catch (error: any) {
    console.error('SendGrid Error:', error);
    
    // Rethrow the error to be handled by the caller
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Generate an HTML email template for order status updates
 * @param customerName Customer's name
 * @param orderId Order ID
 * @param orderStatus Current order status
 * @param estimatedCompletion Estimated completion date
 * @returns HTML string for the email
 */
export function generateOrderStatusEmailTemplate(
  customerName: string,
  orderId: number,
  orderStatus: string,
  estimatedCompletion?: Date
): string {
  // Format the status for display
  const formattedStatus = orderStatus
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Format the estimated completion date if provided
  const completionDate = estimatedCompletion 
    ? new Date(estimatedCompletion).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Not available';

  // Create a visual progress bar based on the status
  const statusSteps = [
    'order_processed',
    'scheduled',
    'materials_ordered',
    'materials_arrived',
    'frame_cut',
    'mat_cut',
    'prepped',
    'completed'
  ];
  
  const currentStepIndex = statusSteps.indexOf(orderStatus);
  const progressPercentage = Math.max(
    10, 
    Math.min(100, Math.round((currentStepIndex + 1) / statusSteps.length * 100))
  );
  
  const progressBarHtml = `
    <div style="margin: 20px 0; width: 100%;">
      <div style="width: 100%; background-color: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
        <div style="width: ${progressPercentage}%; background-color: #4CAF50; height: 20px;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px;">
        <span>Order Placed</span>
        <span>In Production</span>
        <span>Completed</span>
      </div>
    </div>
  `;

  // Generate the HTML email
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4A90E2;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          background-color: #4A90E2;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .status-box {
          background-color: #e8f4fd;
          border-left: 4px solid #4A90E2;
          padding: 15px;
          margin: 20px 0;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .details-table th, .details-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        .details-table th {
          background-color: #f0f0f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Status Update</h1>
        </div>
        
        <div class="content">
          <p>Hello ${customerName},</p>
          
          <p>We're writing to provide you with an update on your custom framing order.</p>
          
          <div class="status-box">
            <h2>Order #${orderId} Status: ${formattedStatus}</h2>
            <p>Your order is now in the <strong>${formattedStatus}</strong> stage.</p>
            <p><strong>Estimated Completion:</strong> ${completionDate}</p>
          </div>
          
          ${progressBarHtml}
          
          <h3>What's Next?</h3>
          <p>Your order is progressing through our custom framing process. Here's what's happening:</p>
          
          <table class="details-table">
            <tr>
              <th>Current Stage</th>
              <th>Description</th>
            </tr>
            <tr>
              <td>${formattedStatus}</td>
              <td>${getStageDescription(orderStatus)}</td>
            </tr>
          </table>
          
          <p>We'll notify you when your order moves to the next stage or is ready for pickup.</p>
          
          <a href="#" class="button">Track Your Order</a>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Jays Frames Guru Framing</p>
          <p>123 Frame Street, Anytown, ST 12345</p>
          <p>Phone: (555) 123-4567 | Email: info@jaysframes.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to get the description for each order status
function getStageDescription(status: string): string {
  switch (status) {
    case 'order_processed':
      return 'Your order has been processed and is scheduled for production.';
    case 'scheduled':
      return 'Your order has been scheduled and is in our production queue.';
    case 'materials_ordered':
      return 'We have ordered the special materials needed for your custom frame.';
    case 'materials_arrived':
      return 'All materials for your order have arrived and are ready for production.';
    case 'frame_cut':
      return 'Your frame has been cut to the specified dimensions.';
    case 'mat_cut':
      return 'Your mat board has been cut and prepared for assembly.';
    case 'prepped':
      return 'Your frame is assembled and is going through final quality checks.';
    case 'completed':
      return 'Your order is complete and ready for pickup!';
    case 'delayed':
      return 'Your order is temporarily delayed. We will contact you with more information.';
    default:
      return 'Your order is being processed by our team.';
  }
}