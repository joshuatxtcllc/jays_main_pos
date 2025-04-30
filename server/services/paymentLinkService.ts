import crypto from 'crypto';
import { addDays } from 'date-fns';
import Stripe from 'stripe';
import { db } from '../db';
import { paymentLinks, InsertPaymentLink, PaymentLink, customerNotifications } from '@shared/schema';
import { eq, and, gt, lt, sql } from 'drizzle-orm';
import { sendEmailWithSendGrid } from './emailService';
import { sendPaymentLinkViaSms } from './smsService';

// Initialize Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  // @ts-ignore - Stripe has updated its API version types in latest version
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * Generate a unique token for the payment link
 */
function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a payment link for a custom amount
 * @param amount The payment amount in dollars
 * @param customerId The customer ID (optional)
 * @param description A description for the payment
 * @param expiresInDays Number of days until the payment link expires
 * @returns The created payment link
 */
export async function createPaymentLink(
  amount: number,
  customerId?: number,
  description?: string,
  expiresInDays: number = 7
): Promise<PaymentLink> {
  const token = generateToken();
  const expiresAt = addDays(new Date(), expiresInDays);
  
  // Convert amount to cents for Stripe
  const amountInCents = Math.round(amount * 100);
  
  // Create the payment link in the database
  const [paymentLink] = await db
    .insert(paymentLinks)
    .values({
      token,
      amount: amount.toString(),
      description,
      customerId,
      expiresAt
    })
    .returning();
  
  return paymentLink;
}

/**
 * Send a payment link to a customer via email
 * @param paymentLinkId The ID of the payment link
 * @param email The customer's email address
 * @param businessName The business name
 * @returns Whether the email was sent successfully
 */
export async function sendPaymentLinkViaEmail(
  paymentLinkId: number,
  email: string,
  businessName: string = "Jay's Frames"
): Promise<boolean> {
  // Get the payment link
  const [paymentLink] = await db
    .select()
    .from(paymentLinks)
    .where(eq(paymentLinks.id, paymentLinkId));
  
  if (!paymentLink) {
    throw new Error(`Payment link with ID ${paymentLinkId} not found`);
  }
  
  const amount = Number(paymentLink.amount);
  const formattedAmount = amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  // Create the payment URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const paymentUrl = `${baseUrl}/payment/${paymentLink.token}`;
  
  // Create the email HTML
  const emailHtml = `
    <h2>Payment Request from ${businessName}</h2>
    <p>A payment of <strong>${formattedAmount}</strong> is due.</p>
    <p>${paymentLink.description || ''}</p>
    <p>
      <a href="${paymentUrl}" style="
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;">
        Pay Now
      </a>
    </p>
    <p>Or copy and paste this link: ${paymentUrl}</p>
    <p>This payment link will expire on ${paymentLink.expiresAt.toLocaleDateString()}.</p>
    <p>Thank you for your business!</p>
  `;
  
  try {
    await sendEmailWithSendGrid({
      to: email,
      from: `info@${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`, // This should be a verified sender
      subject: `Payment Request for ${formattedAmount} - ${businessName}`,
      text: `Payment Request from ${businessName}\n\nA payment of ${formattedAmount} is due.\n\n${paymentLink.description || ''}\n\nPay online at: ${paymentUrl}\n\nThis payment link will expire on ${paymentLink.expiresAt.toLocaleDateString()}.\n\nThank you for your business!`,
      html: emailHtml
    });
    
    // Record the notification in the database
    await db.insert(customerNotifications).values({
      customerId: paymentLink.customerId,
      notificationType: 'payment_link',
      channel: 'email',
      subject: `Payment Request for ${formattedAmount}`,
      message: `Payment link sent via email to ${email}`,
      successful: true,
      paymentLinkId: paymentLink.id
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send payment link email:', error);
    
    // Record the failed notification
    await db.insert(customerNotifications).values({
      customerId: paymentLink.customerId,
      notificationType: 'payment_link',
      channel: 'email',
      subject: `Payment Request for ${formattedAmount}`,
      message: `Failed to send payment link via email to ${email}`,
      successful: false,
      paymentLinkId: paymentLink.id
    });
    
    return false;
  }
}

/**
 * Send a payment link to a customer via SMS
 * @param paymentLinkId The ID of the payment link
 * @param phoneNumber The customer's phone number
 * @param businessName The business name
 * @returns Whether the SMS was sent successfully
 */
export async function sendPaymentLinkViaSmsWithId(
  paymentLinkId: number,
  phoneNumber: string,
  businessName: string = "Jay's Frames"
): Promise<boolean> {
  // Get the payment link
  const [paymentLink] = await db
    .select()
    .from(paymentLinks)
    .where(eq(paymentLinks.id, paymentLinkId));
  
  if (!paymentLink) {
    throw new Error(`Payment link with ID ${paymentLinkId} not found`);
  }
  
  const amount = Number(paymentLink.amount);
  
  // Create the payment URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const paymentUrl = `${baseUrl}/payment/${paymentLink.token}`;
  
  try {
    const result = await sendPaymentLinkViaSms(
      phoneNumber,
      amount,
      paymentUrl,
      businessName
    );
    
    // Record the notification in the database
    await db.insert(customerNotifications).values({
      customerId: paymentLink.customerId,
      notificationType: 'payment_link',
      channel: 'sms',
      subject: 'Payment Link',
      message: `Payment link sent via SMS to ${phoneNumber}`,
      successful: result.success,
      paymentLinkId: paymentLink.id,
      responseData: result
    });
    
    return result.success;
  } catch (error) {
    console.error('Failed to send payment link SMS:', error);
    
    // Record the failed notification
    await db.insert(customerNotifications).values({
      customerId: paymentLink.customerId,
      notificationType: 'payment_link',
      channel: 'sms',
      subject: 'Payment Link',
      message: `Failed to send payment link via SMS to ${phoneNumber}`,
      successful: false,
      paymentLinkId: paymentLink.id
    });
    
    return false;
  }
}

/**
 * Validate a payment link by token
 * @param token The payment link token
 * @returns The payment link if valid, null otherwise
 */
export async function validatePaymentLink(token: string): Promise<PaymentLink | null> {
  const now = new Date();
  
  const [paymentLink] = await db
    .select()
    .from(paymentLinks)
    .where(
      and(
        eq(paymentLinks.token, token),
        eq(paymentLinks.used, false),
        gt(paymentLinks.expiresAt, now)
      )
    );
  
  return paymentLink || null;
}

/**
 * Create a Stripe payment intent for a payment link
 * @param paymentLinkId The ID of the payment link
 * @returns The client secret for the payment intent
 */
export async function createPaymentIntentForLink(paymentLinkId: number): Promise<string | null> {
  if (!stripe) {
    console.warn('Stripe is not configured. Payment processing is disabled.');
    return null;
  }
  
  // Get the payment link
  const [paymentLink] = await db
    .select()
    .from(paymentLinks)
    .where(eq(paymentLinks.id, paymentLinkId));
  
  if (!paymentLink) {
    throw new Error(`Payment link with ID ${paymentLinkId} not found`);
  }
  
  // Convert amount to cents for Stripe
  const amountInCents = Math.round(Number(paymentLink.amount) * 100);
  
  try {
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      description: paymentLink.description || `Payment for link ${paymentLink.token}`,
      metadata: {
        paymentLinkId: paymentLink.id.toString(),
        token: paymentLink.token
      }
    });
    
    // Update the payment link with the payment intent ID
    await db
      .update(paymentLinks)
      .set({
        paymentIntentId: paymentIntent.id
      })
      .where(eq(paymentLinks.id, paymentLinkId));
    
    return paymentIntent.client_secret;
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    return null;
  }
}

/**
 * Mark a payment link as used
 * @param paymentLinkId The ID of the payment link
 * @param status The payment status
 * @returns The updated payment link
 */
export async function markPaymentLinkAsUsed(
  paymentLinkId: number,
  status: string = 'succeeded'
): Promise<PaymentLink | null> {
  const [paymentLink] = await db
    .update(paymentLinks)
    .set({
      used: true,
      usedAt: new Date(),
      paymentStatus: status
    })
    .where(eq(paymentLinks.id, paymentLinkId))
    .returning();
  
  return paymentLink || null;
}