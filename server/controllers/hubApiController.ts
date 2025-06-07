
import { Request, Response } from 'express';
import crypto from 'crypto';
import { storage } from '../storage';

/**
 * Generate API key for hub integration
 */
export async function generateHubApiKey(req: Request, res: Response) {
  try {
    // Set content type header to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    // Generate a secure API key
    const apiKey = 'hub_' + crypto.randomBytes(32).toString('hex');
    
    // In a production environment, you would store this in a secure way
    // For now, we'll return it and log it
    console.log('Generated Hub API Key:', apiKey);
    
    const response = {
      success: true,
      apiKey: apiKey,
      message: 'API key generated successfully. Store this securely.',
      endpoints: {
        baseUrl: process.env.REPL_URL || 'https://your-repl-url.replit.dev',
        orders: '/api/hub/orders',
        materials: '/api/hub/materials',
        webhook: '/api/hub/webhook',
        status: '/api/hub/status'
      },
      authentication: {
        method: 'Bearer Token',
        header: 'Authorization',
        value: `Bearer ${apiKey}`
      }
    };
    
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error generating hub API key:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate API key' 
    });
  }
}

/**
 * Get hub connection information
 */
export async function getHubConnectionInfo(req: Request, res: Response) {
  try {
    const baseUrl = process.env.REPL_URL || 'https://your-repl-url.replit.dev';
    
    res.json({
      success: true,
      connectionInfo: {
        baseUrl: baseUrl,
        endpoints: {
          getAllOrders: `${baseUrl}/api/hub/orders`,
          getOrder: `${baseUrl}/api/hub/orders/:id`,
          updateOrderStatus: `${baseUrl}/api/hub/orders/:id/status`,
          getMaterialOrders: `${baseUrl}/api/hub/materials`,
          webhook: `${baseUrl}/api/hub/webhook`,
          status: `${baseUrl}/api/hub/status`
        },
        authentication: {
          method: 'Bearer Token',
          header: 'Authorization',
          note: 'Use the API key generated from /api/admin/generate-hub-key'
        },
        webhookEvents: [
          'order.status_changed',
          'material.status_changed'
        ]
      }
    });
  } catch (error: any) {
    console.error('Error getting hub connection info:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get connection info' 
    });
  }
}
