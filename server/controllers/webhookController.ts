
import { Request, Response } from 'express';
import { storage } from '../storage';
import axios from 'axios';

/**
 * Get all registered webhook endpoints
 */
export async function getWebhookEndpoints(req: Request, res: Response) {
  try {
    const webhooks = await storage.getWebhookEndpoints();
    res.json(webhooks);
  } catch (error: any) {
    console.error('Error getting webhook endpoints:', error);
    res.status(500).json({ error: error.message || 'Failed to get webhook endpoints' });
  }
}

/**
 * Create a new webhook endpoint
 */
export async function createWebhookEndpoint(req: Request, res: Response) {
  try {
    const { name, url, events } = req.body;
    
    if (!url || !name) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Create webhook endpoint
    const webhook = await storage.createWebhookEndpoint({
      name,
      url,
      events: events || ['order.created'],
      active: true
    });
    
    res.status(201).json({ success: true, webhook });
  } catch (error: any) {
    console.error('Error creating webhook endpoint:', error);
    res.status(500).json({ error: error.message || 'Failed to create webhook endpoint' });
  }
}

/**
 * Update a webhook endpoint
 */
export async function updateWebhookEndpoint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const webhookId = parseInt(id);
    
    if (isNaN(webhookId)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }
    
    const webhook = await storage.getWebhookEndpoint(webhookId);
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook endpoint not found' });
    }
    
    const updatedWebhook = await storage.updateWebhookEndpoint(webhookId, req.body);
    
    res.json({ success: true, webhook: updatedWebhook });
  } catch (error: any) {
    console.error('Error updating webhook endpoint:', error);
    res.status(500).json({ error: error.message || 'Failed to update webhook endpoint' });
  }
}

/**
 * Delete a webhook endpoint
 */
export async function deleteWebhookEndpoint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const webhookId = parseInt(id);
    
    if (isNaN(webhookId)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }
    
    const webhook = await storage.getWebhookEndpoint(webhookId);
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook endpoint not found' });
    }
    
    await storage.deleteWebhookEndpoint(webhookId);
    
    res.json({ success: true, message: 'Webhook endpoint deleted' });
  } catch (error: any) {
    console.error('Error deleting webhook endpoint:', error);
    res.status(500).json({ error: error.message || 'Failed to delete webhook endpoint' });
  }
}

/**
 * Test a webhook endpoint
 */
export async function testWebhookEndpoint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const webhookId = parseInt(id);
    
    if (isNaN(webhookId)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }
    
    const webhook = await storage.getWebhookEndpoint(webhookId);
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook endpoint not found' });
    }
    
    // Create test payload
    const testPayload = {
      event: 'test.webhook',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook event from Jay\'s Frames',
      }
    };
    
    try {
      // Send test webhook
      const response = await axios.post(webhook.url, testPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Jays-Frames-Event': 'test.webhook',
          'X-Jays-Frames-Signature': 'test-signature'
        },
        timeout: 5000 // 5 second timeout
      });
      
      await storage.updateWebhookEndpoint(webhookId, {
        lastTriggered: new Date().toISOString(),
        failCount: 0
      });
      
      res.json({
        success: true,
        message: 'Test webhook sent successfully',
        status: response.status,
        data: response.data
      });
    } catch (error: any) {
      // Update fail count
      const currentFailCount = webhook.failCount || 0;
      await storage.updateWebhookEndpoint(webhookId, {
        failCount: currentFailCount + 1
      });
      
      throw new Error(`Failed to send test webhook: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error testing webhook endpoint:', error);
    res.status(500).json({ error: error.message || 'Failed to test webhook endpoint' });
  }
}

/**
 * Send a webhook event to all registered webhooks that are subscribed to that event
 */
export async function triggerWebhookEvent(event: string, data: any) {
  try {
    // Get all active webhooks that are subscribed to this event
    const webhooks = await storage.getWebhookEndpointsByEvent(event);
    
    if (!webhooks || webhooks.length === 0) {
      console.log(`No webhooks subscribed to event: ${event}`);
      return { success: true, sent: 0, message: 'No webhooks to trigger' };
    }
    
    console.log(`Triggering ${webhooks.length} webhooks for event: ${event}`);
    
    // Create payload
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Send to all webhooks
    const results = await Promise.allSettled(webhooks.map(async (webhook) => {
      try {
        const response = await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Jays-Frames-Event': event,
            'X-Jays-Frames-Signature': 'signature-placeholder' // TODO: Add proper HMAC signature
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
    console.error('Error triggering webhook event:', error);
    return { success: false, error: error.message };
  }
}
