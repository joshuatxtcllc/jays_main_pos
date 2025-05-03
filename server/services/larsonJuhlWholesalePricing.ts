
import { Frame } from '@shared/schema';

/**
 * Larson-Juhl Wholesale Pricing Service
 * 
 * This service provides the official wholesale pricing information for Larson-Juhl frames.
 * Pricing is based on the $9,999 & Below pricing tier from the official catalog.
 */

// Types for wholesale pricing data
export interface LarsonJuhlWholesalePrice {
  itemNumber: string;
  width: string;
  boxQty?: number;
  collection: string;
  basePricePerFoot: number;  // $9,999 & Below pricing 
  boxPrice?: number;
  lengthPrice?: number;
  chopPrice?: number;
  joinPrice?: number;
}

// This is the master catalog of Larson-Juhl wholesale prices
// Based on the $9,999 & Below pricing tier
export const larsonJuhlWholesalePrices: LarsonJuhlWholesalePrice[] = [
  // Main Collection Frames
  { itemNumber: "10-036M", width: "5/8\"", boxQty: 360, collection: "Maple & Walnut - Garrett", basePricePerFoot: 6.62, boxPrice: 10.05, lengthPrice: 13.52, chopPrice: 14.52 },
  { itemNumber: "10-100M", width: "5/8\"", boxQty: 375, collection: "Maple & Walnut - Garrett", basePricePerFoot: 6.34, boxPrice: 9.71, lengthPrice: 12.75, chopPrice: 13.75 },
  { itemNumber: "10-507M", width: "5/8\"", boxQty: 306, collection: "Museum Stems - Garrett", basePricePerFoot: 6.52, boxPrice: 9.91, lengthPrice: 13.00, chopPrice: 14.00 },
  { itemNumber: "100172", width: "1/4\"", boxQty: 1600, collection: "Olmsted", basePricePerFoot: 2.75, boxPrice: 4.64, lengthPrice: 7.28, chopPrice: 8.28 },
  { itemNumber: "100750", width: "1/4\"", boxQty: 1200, collection: "Sofia", basePricePerFoot: 2.63, boxPrice: 4.04, lengthPrice: 6.73, chopPrice: 7.73 },
  { itemNumber: "100751", width: "1/4\"", boxQty: 1587, collection: "Sofia", basePricePerFoot: 2.63, boxPrice: 4.04, lengthPrice: 6.73, chopPrice: 7.73 },
  { itemNumber: "100752", width: "1/4\"", boxQty: 1000, collection: "Sofia", basePricePerFoot: 2.63, boxPrice: 4.04, lengthPrice: 6.73, chopPrice: 7.73 },
  { itemNumber: "102CG", width: "1/2\"", boxQty: 432, collection: "Marquis", basePricePerFoot: 1.74, boxPrice: 3.70, lengthPrice: 6.43, chopPrice: 7.43 },
  { itemNumber: "102CS", width: "1/2\"", boxQty: 432, collection: "Marquis", basePricePerFoot: 1.74, boxPrice: 3.70, lengthPrice: 6.43, chopPrice: 7.43 },
  { itemNumber: "103180", width: "9/16\"", boxQty: 900, collection: "Hudson", basePricePerFoot: 1.46, boxPrice: 3.11, lengthPrice: 5.56, chopPrice: 6.56 },
  { itemNumber: "103190", width: "9/16\"", boxQty: 900, collection: "Hudson", basePricePerFoot: 1.40, boxPrice: 2.97, lengthPrice: 5.30, chopPrice: 6.30 },
  { itemNumber: "103235", width: "5/16\"", boxQty: 1200, collection: "Academie", basePricePerFoot: 1.44, boxPrice: 3.17, lengthPrice: 5.64, chopPrice: 6.64 },
  { itemNumber: "103237", width: "5/16\"", boxQty: 1296, collection: "Academie", basePricePerFoot: 1.43, boxPrice: 3.14, lengthPrice: 5.59, chopPrice: 6.59 },
  { itemNumber: "105794", width: "5/16\"", boxQty: 785, collection: "Lucerne", basePricePerFoot: 3.21, boxPrice: 5.02, lengthPrice: 8.01, chopPrice: 9.01 },
  { itemNumber: "105CB", width: "1/2\"", boxQty: 270, collection: "Vienna", basePricePerFoot: 2.21, boxPrice: 3.31, lengthPrice: 5.71, chopPrice: 6.71 },
  { itemNumber: "106180", width: "1/2\"", boxQty: 900, collection: "Hudson", basePricePerFoot: 1.39, boxPrice: 2.99, lengthPrice: 5.31, chopPrice: 6.31 },
  { itemNumber: "106190", width: "1/2\"", boxQty: 900, collection: "Hudson", basePricePerFoot: 1.32, boxPrice: 2.83, lengthPrice: 5.09, chopPrice: 6.09 },
  
  // Premium Frames
  { itemNumber: "200750", width: "7/8\"", boxQty: 250, collection: "Sofia", basePricePerFoot: 4.38, boxPrice: 6.54, lengthPrice: 9.90, chopPrice: 10.90 },
  { itemNumber: "200751", width: "7/8\"", boxQty: 515, collection: "Sofia", basePricePerFoot: 4.35, boxPrice: 6.76, lengthPrice: 9.84, chopPrice: 10.84 },
  { itemNumber: "200752", width: "7/8\"", boxQty: 490, collection: "Sofia", basePricePerFoot: 4.57, boxPrice: 7.31, lengthPrice: 10.33, chopPrice: 11.33 },
  { itemNumber: "210286", width: "11/16\"", boxQty: 450, collection: "White", basePricePerFoot: 1.89, boxPrice: 3.06, lengthPrice: 5.99, chopPrice: 6.99 },
  
  // High-End Frames
  { itemNumber: "400750", width: "1 5/8\"", boxQty: 112, collection: "Sofia", basePricePerFoot: 7.47, boxPrice: 11.04, lengthPrice: 17.48, chopPrice: 18.48 },
  { itemNumber: "400751", width: "1 5/8\"", boxQty: 192, collection: "Sofia", basePricePerFoot: 7.09, boxPrice: 10.44, lengthPrice: 16.55, chopPrice: 17.55 },
  { itemNumber: "400752", width: "1 5/8\"", boxQty: 180, collection: "Sofia", basePricePerFoot: 7.34, boxPrice: 10.83, lengthPrice: 17.17, chopPrice: 18.17 },
  { itemNumber: "431431", width: "1 3/8\"", boxQty: 115, collection: "Zen", basePricePerFoot: 10.83, boxPrice: 15.91, lengthPrice: 26.01, chopPrice: 27.01 },
  { itemNumber: "431432", width: "1 3/8\"", boxQty: 113, collection: "Zen", basePricePerFoot: 10.27, boxPrice: 15.10, lengthPrice: 24.68, chopPrice: 25.68 },
  { itemNumber: "431434", width: "1 3/8\"", boxQty: 110, collection: "Zen", basePricePerFoot: 10.75, boxPrice: 15.81, lengthPrice: 25.82, chopPrice: 26.82 },
  { itemNumber: "432900", width: "1 3/4\"", boxQty: 225, collection: "Foundry", basePricePerFoot: 6.62, boxPrice: 9.75, lengthPrice: 15.03, chopPrice: 16.03 },
  { itemNumber: "432902", width: "1 3/4\"", boxQty: 236, collection: "Foundry", basePricePerFoot: 6.81, boxPrice: 10.07, lengthPrice: 15.52, chopPrice: 16.52 },
  { itemNumber: "433082", width: "1 11/16\"", boxQty: 108, collection: "Soho", basePricePerFoot: 5.09, boxPrice: 9.55, lengthPrice: 14.41, chopPrice: 15.41 },
  { itemNumber: "433084", width: "1 11/16\"", boxQty: 108, collection: "Soho", basePricePerFoot: 5.16, boxPrice: 9.59, lengthPrice: 14.54, chopPrice: 15.54 },
  { itemNumber: "433086", width: "1 11/16\"", boxQty: 108, collection: "Soho", basePricePerFoot: 5.22, boxPrice: 9.59, lengthPrice: 14.54, chopPrice: 15.54 },
  { itemNumber: "434110", width: "1 1/4\"", boxQty: 137, collection: "CR2", basePricePerFoot: 6.33, boxPrice: 9.33, lengthPrice: 14.98, chopPrice: 15.98 },
  { itemNumber: "435500", width: "1 5/16\"", boxQty: 324, collection: "Alto", basePricePerFoot: 1.80, boxPrice: 3.60, lengthPrice: 6.72, chopPrice: 7.72 },
  { itemNumber: "435510", width: "1 5/16\"", boxQty: 296, collection: "Alto", basePricePerFoot: 1.80, boxPrice: 3.60, lengthPrice: 6.72, chopPrice: 7.72 },
  { itemNumber: "436350", width: "1 5/8\"", boxQty: 143, collection: "Brooklyn", basePricePerFoot: 2.29, boxPrice: 3.66, lengthPrice: 6.08, chopPrice: 7.08 },
  { itemNumber: "437500", width: "1 3/16\"", boxQty: 215, collection: "Alto", basePricePerFoot: 2.03, boxPrice: 3.60, lengthPrice: 7.22, chopPrice: 8.22 },
  { itemNumber: "437510", width: "1 3/16\"", boxQty: 180, collection: "Alto", basePricePerFoot: 2.03, boxPrice: 3.60, lengthPrice: 7.22, chopPrice: 8.22 },
  { itemNumber: "438120", width: "2\"", boxQty: 150, collection: "Dresden", basePricePerFoot: 6.78, boxPrice: 10.26, lengthPrice: 15.05, chopPrice: 16.05 },
  { itemNumber: "439082", width: "2 1/16\"", boxQty: 126, collection: "Soho", basePricePerFoot: 4.42, boxPrice: 7.58, lengthPrice: 11.40, chopPrice: 12.40 },
  { itemNumber: "440240", width: "1 3/8\"", boxQty: 190, collection: "Java", basePricePerFoot: 7.59, boxPrice: 11.23, lengthPrice: 18.27, chopPrice: 19.27 },
  { itemNumber: "440951", width: "2\"", boxQty: 92, collection: "Cezanne", basePricePerFoot: 18.08, boxPrice: 25.65, lengthPrice: 29.81, chopPrice: 30.81 },
  { itemNumber: "441075", width: "2 1/16\"", boxQty: 150, collection: "Prague", basePricePerFoot: 9.48, boxPrice: 13.90, lengthPrice: 23.98, chopPrice: 24.98 },
  { itemNumber: "441077", width: "2 1/16\"", boxQty: 155, collection: "Prague", basePricePerFoot: 9.44, boxPrice: 13.82, lengthPrice: 23.86, chopPrice: 24.86 },
  { itemNumber: "442650", width: "1 3/4\"", boxQty: 162, collection: "Tate", basePricePerFoot: 4.76, boxPrice: 8.08, lengthPrice: 11.57, chopPrice: 12.57 },
  { itemNumber: "442660", width: "1 3/4\"", boxQty: 162, collection: "Tate", basePricePerFoot: 4.76, boxPrice: 8.07, lengthPrice: 11.56, chopPrice: 12.56 },
  { itemNumber: "442670", width: "1 3/4\"", boxQty: 162, collection: "Tate", basePricePerFoot: 4.67, boxPrice: 7.74, lengthPrice: 11.04, chopPrice: 12.04 },
  { itemNumber: "520750", width: "2 1/2\"", boxQty: 94, collection: "Sofia", basePricePerFoot: 11.07, boxPrice: 16.30, lengthPrice: 24.59, chopPrice: 25.59 },
  { itemNumber: "520751", width: "2 1/2\"", boxQty: 59, collection: "Sofia", basePricePerFoot: 10.92, boxPrice: 16.43, lengthPrice: 24.78, chopPrice: 25.78 },
  { itemNumber: "520752", width: "2 1/2\"", boxQty: 100, collection: "Sofia", basePricePerFoot: 10.56, boxPrice: 16.38, lengthPrice: 23.41, chopPrice: 24.41 }
];

/**
 * Get wholesale price for a Larson-Juhl frame by item number
 * 
 * @param itemNumber The Larson-Juhl item/SKU number
 * @returns The wholesale price object or null if not found
 */
export function getLarsonJuhlWholesalePrice(itemNumber: string): LarsonJuhlWholesalePrice | null {
  // Normalize item number by removing "larson-" prefix if present
  const normalizedItemNumber = itemNumber.startsWith('larson-') 
    ? itemNumber.substring(7) 
    : itemNumber;
    
  return larsonJuhlWholesalePrices.find(price => price.itemNumber === normalizedItemNumber) || null;
}

/**
 * Get wholesale prices for all Larson-Juhl frames from a specific collection
 * 
 * @param collectionName The name of the collection
 * @returns Array of wholesale prices for the collection
 */
export function getLarsonJuhlWholesalePricesByCollection(collectionName: string): LarsonJuhlWholesalePrice[] {
  return larsonJuhlWholesalePrices.filter(price => 
    price.collection.toLowerCase() === collectionName.toLowerCase()
  );
}

/**
 * Calculate the actual wholesale price for a frame based on dimensions
 * 
 * @param itemNumber The Larson-Juhl item/SKU number
 * @param frameLength The total frame length in feet (perimeter)
 * @returns The calculated wholesale price or null if frame not found
 */
export function calculateLarsonJuhlWholesalePrice(
  itemNumber: string, 
  frameLength: number
): number | null {
  const priceData = getLarsonJuhlWholesalePrice(itemNumber);
  
  if (!priceData) {
    return null;
  }
  
  // Calculate the wholesale price based on length and base price per foot
  return priceData.basePricePerFoot * frameLength;
}

/**
 * Convert a Larson-Juhl wholesale price to a Frame object format
 * Used when importing wholesale data into the frame catalog
 * 
 * @param wholesalePrice The wholesale price object
 * @returns A Frame object with pricing data from the wholesale catalog
 */
export function convertWholesalePriceToFrame(wholesalePrice: LarsonJuhlWholesalePrice): Partial<Frame> {
  return {
    id: `larson-${wholesalePrice.itemNumber}`,
    name: `${wholesalePrice.collection} ${wholesalePrice.width}`,
    manufacturer: "Larson-Juhl",
    material: "wood", // Default to wood, would need additional data for accurate material
    width: wholesalePrice.width,
    depth: "", // Not provided in the pricing data
    price: wholesalePrice.basePricePerFoot.toString(),
  };
}

/**
 * Get a list of all available Larson-Juhl collections
 * 
 * @returns Array of unique collection names
 */
export function getLarsonJuhlCollections(): string[] {
  const collections = new Set(larsonJuhlWholesalePrices.map(price => price.collection));
  return Array.from(collections).sort();
}
