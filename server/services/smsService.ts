import twilio from 'twilio';

// Initialize Twilio client with API credentials
let twilioClient: twilio.Twilio | null = null;

// Check if Twilio is configured
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

interface SmsParams {
  to: string;
  message: string;
}

/**
 * Send an SMS using Twilio
 * @param params SMS parameters including to and message
 * @returns A promise that resolves when the SMS is sent
 */
export async function sendSmsWithTwilio(params: SmsParams): Promise<{success: boolean, sid?: string, error?: string}> {
  // Check if Twilio is configured
  if (!twilioClient) {
    console.warn('Twilio is not configured. SMS sending is disabled.');
    return { 
      success: false, 
      error: 'Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.' 
    };
  }

  // Check if phone number is valid
  if (!params.to || !params.to.match(/^\+?[1-9]\d{1,14}$/)) {
    return { 
      success: false, 
      error: 'Invalid phone number format. Must be E.164 format (e.g., +12125551234).' 
    };
  }

  try {
    // Normalize phone number to E.164 format
    let phoneNumber = params.to;
    if (!phoneNumber.startsWith('+')) {
      // Assuming US phone number if no country code
      phoneNumber = '+1' + phoneNumber.replace(/\D/g, '');
    }

    // Send the SMS
    const message = await twilioClient.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER || '',  // This must be a Twilio phone number
      body: params.message,
    });
    
    console.log(`SMS sent successfully to ${params.to}, SID: ${message.sid}`);
    return { 
      success: true, 
      sid: message.sid 
    };
  } catch (error: any) {
    console.error('Twilio Error:', error);
    return { 
      success: false, 
      error: `Failed to send SMS: ${error.message}` 
    };
  }
}

/**
 * Formats a phone number to E.164 format
 * @param phoneNumber The phone number to format
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if the number already has a country code
  if (digitsOnly.length === 10) {
    // Assuming US number without country code
    return `+1${digitsOnly}`;
  } else if (digitsOnly.length > 10 && !phoneNumber.startsWith('+')) {
    // Has country code but missing + prefix
    return `+${digitsOnly}`;
  } else if (phoneNumber.startsWith('+')) {
    // Already in E.164 format
    return phoneNumber;
  }
  
  // Return as-is if we can't format it
  return phoneNumber;
}

/**
 * Send a payment link via SMS
 * @param phoneNumber The recipient's phone number
 * @param amount The payment amount
 * @param paymentUrl The payment URL
 * @param businessName The business name
 * @returns A promise that resolves with the result of sending the SMS
 */
export async function sendPaymentLinkViaSms(
  phoneNumber: string, 
  amount: number,
  paymentUrl: string,
  businessName: string = "Jay's Frames"
): Promise<{success: boolean, sid?: string, error?: string}> {
  const formattedAmount = amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  const message = `${businessName}: A payment of ${formattedAmount} is due. Pay securely with this link: ${paymentUrl}`;
  
  return await sendSmsWithTwilio({
    to: formatPhoneNumber(phoneNumber),
    message
  });
}