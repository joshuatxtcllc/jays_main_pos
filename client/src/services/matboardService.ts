import { MatColor } from "@shared/schema";

// Types for Larson Juhl matboard data
export interface LarsonJuhlMatboard {
  id: string;
  name: string;
  hex_color: string;
  price: string;
  code: string;
  crescent_code?: string;
  description?: string;
  category?: string;
  manufacturer: string;
}

/**
 * Fetches all matboards from the Larson Juhl catalog
 * @returns Promise with the matboard data
 */
export async function fetchLarsonJuhlMatboards(): Promise<LarsonJuhlMatboard[]> {
  try {
    console.log('Fetching matboards from Larson Juhl catalog...');
    const response = await fetch('/api/larson-catalog', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching matboards: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Larson Juhl matboards:', error);
    return [];
  }
}

/**
 * Fetches Crescent matboards from the Larson Juhl catalog
 * @returns Promise with the Crescent matboard data
 */
export async function fetchCrescentMatboards(): Promise<LarsonJuhlMatboard[]> {
  try {
    console.log('Loading static matboard data to prevent application freezing...');
    // Temporarily returning empty array to prevent API call errors
    return [];
  } catch (error) {
    console.error('Error fetching Crescent matboards:', error);
    return [];
  }
}

/**
 * Converts Larson Juhl matboard data to MatColor format for use in the application
 * @param matboards The matboard data from the Larson Juhl catalog
 * @returns MatColor array
 */
export function convertToMatColors(matboards: LarsonJuhlMatboard[]): MatColor[] {
  console.log("Converting Larson matboards to MatColor format:");
  
  return matboards.map(matboard => {
    if (!matboard.hex_color) {
      console.warn(`Missing hex_color for matboard ${matboard.id}: ${matboard.name}`);
    }
    
    const result = {
      id: matboard.id,
      name: matboard.name,
      color: matboard.hex_color || '#FFFFFF', // Default to white if missing
      price: matboard.price,
      manufacturer: matboard.manufacturer,
      code: matboard.code || null,
      description: matboard.description || null,
      category: matboard.category || null
    };
    
    // Debug the first few items
    if (matboards.indexOf(matboard) < 3) {
      console.log(`Matboard ${matboard.id} converted:`, {
        original: matboard,
        converted: result
      });
    }
    
    return result;
  });
}