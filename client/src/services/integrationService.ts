
import { apiRequest } from '@/lib/queryClient';

/**
 * Integration Service
 * 
 * Client-side service for working with the Integration API
 */

export interface WebhookEndpoint {
  id: number;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  failCount?: number;
}

/**
 * Generate API key for external systems to use
 */
export async function generateApiKey() {
  try {
    const response = await apiRequest('POST', '/api/admin/generate-api-key');
    return await response.json();
  } catch (error) {
    console.error('Error generating API key:', error);
    throw error;
  }
}

/**
 * Get integration status and connection information
 */
export async function getIntegrationStatus() {
  try {
    const response = await apiRequest('GET', '/api/admin/integration-status');
    return await response.json();
  } catch (error) {
    console.error('Error getting integration status:', error);
    throw error;
  }
}

/**
 * Get integration documentation
 */
export async function getIntegrationDocs() {
  try {
    const response = await apiRequest('GET', '/api/admin/integration-docs');
    return await response.json();
  } catch (error) {
    console.error('Error getting integration documentation:', error);
    throw error;
  }
}

/**
 * Test webhook endpoint
 */
export async function testWebhook(webhookUrl: string) {
  try {
    const response = await apiRequest('POST', '/api/admin/test-webhook', { webhookUrl });
    return await response.json();
  } catch (error) {
    console.error('Error testing webhook:', error);
    throw error;
  }
}

/**
 * Get all webhook endpoints
 */
export async function getWebhookEndpoints() {
  try {
    const response = await apiRequest('GET', '/api/webhooks');
    return await response.json();
  } catch (error) {
    console.error('Error getting webhook endpoints:', error);
    throw error;
  }
}

/**
 * Create a new webhook endpoint
 */
export async function createWebhookEndpoint(data: { name: string, url: string, events: string[] }) {
  try {
    const response = await apiRequest('POST', '/api/webhooks', data);
    return await response.json();
  } catch (error) {
    console.error('Error creating webhook endpoint:', error);
    throw error;
  }
}

/**
 * Update an existing webhook endpoint
 */
export async function updateWebhookEndpoint(id: number, data: Partial<WebhookEndpoint>) {
  try {
    const response = await apiRequest('PATCH', `/api/webhooks/${id}`, data);
    return await response.json();
  } catch (error) {
    console.error('Error updating webhook endpoint:', error);
    throw error;
  }
}

/**
 * Delete a webhook endpoint
 */
export async function deleteWebhookEndpoint(id: number) {
  try {
    const response = await apiRequest('DELETE', `/api/webhooks/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error deleting webhook endpoint:', error);
    throw error;
  }
}
