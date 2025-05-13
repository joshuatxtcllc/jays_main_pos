
import { apiRequest } from '@/lib/queryClient';

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

/**
 * Test a webhook endpoint
 */
export async function testWebhookEndpoint(id: number) {
  try {
    const response = await apiRequest('POST', `/api/webhooks/${id}/test`);
    return await response.json();
  } catch (error) {
    console.error('Error testing webhook endpoint:', error);
    throw error;
  }
}
