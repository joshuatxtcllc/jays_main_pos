
import axios from 'axios';
import { storage } from '../storage';
import crypto from 'crypto';

/**
 * Generate HMAC signature for webhook payload
 * @param payload The webhook payload
 * @param secret The webhook secret
 * @returns HMAC signature
 */
export function generateWebhookSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(typeof payload === 'string' ? payload : JSON.stringify(payload));
  return hmac.digest('hex');
}

/**
 * Send webhook event to all registered endpoints
 * @param event Event name (e.g., 'order.created')
 * @param data Event data
 * @returns Result of webhook delivery
 */
export async function sendWebhookEvent(event: string, data: any) {
  try {
    // Get all active webhooks that are subscribed to this event
    const webhooks = await storage.getWebhookEndpointsByEvent(event);
    
    if (!webhooks || webhooks.length === 0) {
      console.log(`No webhooks subscribed to event: ${event}`);
      return { success: true, sent: 0, message: 'No webhooks to trigger' };
    }
    
    console.log(`Sending ${webhooks.length} webhooks for event: ${event}`);
    
    // Create payload
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };
    
    const payloadString = JSON.stringify(payload);
    
    // Send to all webhooks
    const results = await Promise.allSettled(webhooks.map(async (webhook) => {
      try {
        // Generate signature using a placeholder secret (in production, each webhook would have its own secret)
        const signature = generateWebhookSignature(payloadString, 'webhook_secret');
        
        const response = await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Jays-Frames-Event': event,
            'X-Jays-Frames-Signature': signature
          },
          timeout: 5000 // 5 second timeout
        });
        
        // Update last triggered timestamp
        await storage.updateWebhookEndpoint(webhook.id, {
          lastTriggered: new Date().toISOString(),
          failCount: 0
        });
        
        return {
          webhookId: webhook.id,
          name: webhook.name,
          success: true,
          status: response.status
        };
      } catch (error: any) {
        // Update fail count
        const currentFailCount = webhook.failCount || 0;
        await storage.updateWebhookEndpoint(webhook.id, {
          failCount: currentFailCount + 1
        });
        
        return {
          webhookId: webhook.id,
          name: webhook.name,
          success: false,
          error: error.message
        };
      }
    }));
    
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    
    return {
      success: true,
      total: webhooks.length,
      sent: successful,
      failed: webhooks.length - successful,
      results
    };
  } catch (error: any) {
    console.error('Error sending webhook event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify webhook signature from incoming webhook
 * @param payload Request body
 * @param signature Signature from headers
 * @param secret Webhook secret
 * @returns Whether signature is valid
 */
export function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
