import { Request, Response } from 'express';
import { db } from '../db';
import { customers, paymentLinks } from '@shared/schema';
import { createPaymentLink, sendPaymentLinkViaEmail, sendPaymentLinkViaSmsWithId, validatePaymentLink, createPaymentIntentForLink, markPaymentLinkAsUsed } from '../services/paymentLinkService';
import { eq } from 'drizzle-orm';

/**
 * Create a new payment link
 */
export async function createNewPaymentLink(req: Request, res: Response) {
  try {
    const { amount, customerId, description, expiresInDays = 7, email, phone, sendNotification } = req.body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid payment amount is required' });
    }
    
    // Validate customer if provided
    if (customerId) {
      const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }
    
    // Create the payment link
    const paymentLink = await createPaymentLink(
      Number(amount),
      customerId,
      description,
      expiresInDays
    );
    
    // Send notifications if requested
    const notifications: { email?: boolean, sms?: boolean } = { email: false, sms: false };
    
    if (sendNotification && email) {
      notifications.email = await sendPaymentLinkViaEmail(paymentLink.id, email);
    }
    
    if (sendNotification && phone) {
      notifications.sms = await sendPaymentLinkViaSmsWithId(paymentLink.id, phone);
    }
    
    res.status(201).json({ 
      success: true,
      paymentLink,
      notifications 
    });
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ 
      success: false,
      message: `Failed to create payment link: ${error.message}` 
    });
  }
}

/**
 * Get all payment links
 */
export async function getAllPaymentLinks(req: Request, res: Response) {
  try {
    const allLinks = await db.select().from(paymentLinks).orderBy(paymentLinks.createdAt, 'desc');
    res.json(allLinks);
  } catch (error: any) {
    console.error('Error fetching payment links:', error);
    res.status(500).json({ message: `Failed to fetch payment links: ${error.message}` });
  }
}

/**
 * Get a payment link by ID
 */
export async function getPaymentLinkById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    
    const [paymentLink] = await db.select().from(paymentLinks).where(eq(paymentLinks.id, id));
    
    if (!paymentLink) {
      return res.status(404).json({ message: 'Payment link not found' });
    }
    
    res.json(paymentLink);
  } catch (error: any) {
    console.error('Error fetching payment link:', error);
    res.status(500).json({ message: `Failed to fetch payment link: ${error.message}` });
  }
}

/**
 * Send a payment link notification
 */
export async function sendPaymentLinkNotification(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { email, phone, notificationType = 'both' } = req.body;
    
    const [paymentLink] = await db.select().from(paymentLinks).where(eq(paymentLinks.id, id));
    
    if (!paymentLink) {
      return res.status(404).json({ message: 'Payment link not found' });
    }
    
    if (paymentLink.used) {
      return res.status(400).json({ message: 'Payment link has already been used' });
    }
    
    const now = new Date();
    if (paymentLink.expiresAt < now) {
      return res.status(400).json({ message: 'Payment link has expired' });
    }
    
    // Send notifications based on type
    const result: { email?: boolean, sms?: boolean } = {};
    
    if ((notificationType === 'email' || notificationType === 'both') && email) {
      result.email = await sendPaymentLinkViaEmail(id, email);
    }
    
    if ((notificationType === 'sms' || notificationType === 'both') && phone) {
      result.sms = await sendPaymentLinkViaSmsWithId(id, phone);
    }
    
    res.json({ 
      success: true,
      notifications: result 
    });
  } catch (error: any) {
    console.error('Error sending payment link notification:', error);
    res.status(500).json({ 
      success: false,
      message: `Failed to send notification: ${error.message}` 
    });
  }
}

/**
 * Validate a payment link by token and create payment intent
 */
export async function validatePaymentLinkByToken(req: Request, res: Response) {
  try {
    const { token } = req.params;
    
    const paymentLink = await validatePaymentLink(token);
    
    if (!paymentLink) {
      return res.status(404).json({ 
        valid: false,
        message: 'Payment link is invalid, expired, or has already been used' 
      });
    }
    
    // Create a payment intent for this payment link
    const clientSecret = await createPaymentIntentForLink(paymentLink.id);
    
    if (!clientSecret) {
      return res.status(500).json({ 
        valid: true,
        canProcess: false,
        message: 'Failed to create payment intent' 
      });
    }
    
    res.json({ 
      valid: true,
      canProcess: true,
      paymentLink: {
        amount: paymentLink.amount,
        description: paymentLink.description,
        expiresAt: paymentLink.expiresAt
      },
      clientSecret 
    });
  } catch (error: any) {
    console.error('Error validating payment link:', error);
    res.status(500).json({ 
      valid: false,
      message: `Failed to validate payment link: ${error.message}` 
    });
  }
}

/**
 * Complete a payment for a payment link
 */
export async function completePaymentForLink(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { paymentIntentId, status = 'succeeded' } = req.body;
    
    const paymentLink = await validatePaymentLink(token);
    
    if (!paymentLink) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment link is invalid, expired, or has already been used' 
      });
    }
    
    // Mark the payment link as used
    const updatedLink = await markPaymentLinkAsUsed(paymentLink.id, status);
    
    if (!updatedLink) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update payment link status' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Payment completed successfully' 
    });
  } catch (error: any) {
    console.error('Error completing payment:', error);
    res.status(500).json({ 
      success: false,
      message: `Failed to complete payment: ${error.message}` 
    });
  }
}