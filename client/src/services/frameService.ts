import { Frame } from '@shared/schema';

export interface FrameApiData {
  id: string;
  name: string;
  manufacturer: string;
  material: string;
  width: string;
  depth: string;
  price: string;
  catalog_image: string;
  edge_texture?: string;
  corner?: string;
}

/**
 * Fetches all frames from the catalog API
 * @returns Promise with the frame data
 */
export async function fetchFrameCatalog(): Promise<Frame[]> {
  try {
    const response = await fetch('/api/frames');
    
    if (!response.ok) {
      throw new Error(`Error fetching frames: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchFrameCatalog:', error);
    throw error;
  }
}

/**
 * Fetches frames from a specific manufacturer
 * @param manufacturer The manufacturer to filter by
 * @returns Promise with the frame data for that manufacturer
 */
export async function fetchFramesByManufacturer(manufacturer: string): Promise<Frame[]> {
  try {
    const response = await fetch(`/api/frames/manufacturer/${manufacturer}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching frames by manufacturer: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in fetchFramesByManufacturer(${manufacturer}):`, error);
    throw error;
  }
}

/**
 * Fetches a frame by ID
 * @param id The frame ID
 * @returns Promise with the frame data
 */
export async function fetchFrameById(id: string): Promise<Frame> {
  try {
    const response = await fetch(`/api/frames/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching frame by ID: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in fetchFrameById(${id}):`, error);
    throw error;
  }
}