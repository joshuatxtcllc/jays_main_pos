import { Frame } from "@shared/schema";

// Types for API frame data
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
export async function fetchFrameCatalog(): Promise<FrameApiData[]> {
  try {
    console.log('Fetching frames from catalog API...');
    const response = await fetch('/api/frames', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching frames: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching frames from API:', error);
    return [];
  }
}

/**
 * Fetches frames from a specific manufacturer
 * @param manufacturer The manufacturer to filter by
 * @returns Promise with the frame data for that manufacturer
 */
export async function fetchFramesByManufacturer(manufacturer: string): Promise<FrameApiData[]> {
  try {
    console.log(`Fetching frames from manufacturer: ${manufacturer}`);
    const response = await fetch(`/api/frames/manufacturer/${manufacturer}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching frames by manufacturer: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching frames by manufacturer ${manufacturer}:`, error);
    return [];
  }
}

/**
 * Converts API frame data to Frame format for use in the application
 * @param frameData The frame data from the API
 * @returns Frame array
 */
export function convertToFrames(frameData: FrameApiData[]): Frame[] {
  console.log("Converting API frame data to Frame format");
  
  return frameData.map(frame => {
    return {
      id: frame.id,
      name: frame.name,
      manufacturer: frame.manufacturer,
      material: frame.material,
      width: frame.width,
      depth: frame.depth,
      price: frame.price,
      catalogImage: frame.catalog_image,
      edgeTexture: frame.edge_texture || null,
      corner: frame.corner || null
    };
  });
}