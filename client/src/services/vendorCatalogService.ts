import { apiRequest } from '@/lib/queryClient';
import { Frame } from '@shared/schema';

/**
 * Fetches all frames from the Larson-Juhl vendor catalog
 * @returns Promise with Larson-Juhl frames
 */
export async function fetchLarsonJuhlFrames(): Promise<Frame[]> {
  try {
    const response = await apiRequest('GET', '/api/vendor-catalog/larson');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Larson-Juhl frames:', error);
    throw error;
  }
}

/**
 * Fetches all frames from the Nielsen vendor catalog
 * @returns Promise with Nielsen frames
 */
export async function fetchNielsenFrames(): Promise<Frame[]> {
  try {
    const response = await apiRequest('GET', '/api/vendor-catalog/nielsen');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Nielsen frames:', error);
    throw error;
  }
}

/**
 * Fetches all frames from the Roma vendor catalog
 * @returns Promise with Roma frames
 */
export async function fetchRomaFrames(): Promise<Frame[]> {
  try {
    const response = await apiRequest('GET', '/api/vendor-catalog/roma');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Roma frames:', error);
    throw error;
  }
}

/**
 * Fetches all frames from all vendor catalogs
 * @returns Promise with combined vendor frames
 */
export async function fetchAllVendorFrames(): Promise<Frame[]> {
  try {
    const response = await apiRequest('GET', '/api/vendor-catalog/all');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all vendor frames:', error);
    throw error;
  }
}

/**
 * Searches for frames by item number across all vendor catalogs
 * @param itemNumber The frame item number to search for
 * @returns Promise with matching frames
 */
export async function searchFramesByItemNumber(itemNumber: string): Promise<Frame[]> {
  try {
    const response = await apiRequest('GET', `/api/vendor-catalog/search/${itemNumber}`);
    return await response.json();
  } catch (error) {
    // If the request returns a 404, return an empty array
    if (error instanceof Response && error.status === 404) {
      return [];
    }
    console.error(`Error searching for frames with item number ${itemNumber}:`, error);
    throw error;
  }
}

/**
 * Syncs all frames from vendor catalogs to the database
 * @returns Promise with sync status message
 */
export async function syncFramesWithDatabase(): Promise<{ message: string }> {
  try {
    const response = await apiRequest('POST', '/api/vendor-catalog/sync');
    return await response.json();
  } catch (error) {
    console.error('Error syncing frames with database:', error);
    throw error;
  }
}