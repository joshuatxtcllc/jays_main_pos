
import { apiRequest } from '@/lib/utils';

/**
 * Integration Service
 * 
 * Client-side service for working with the Integration API
 */

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
