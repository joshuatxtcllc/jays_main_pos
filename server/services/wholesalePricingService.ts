/**
 * Wholesale Pricing Service
 * 
 * This service handles fetching the most current wholesale prices from vendor APIs
 * and applies location-specific markups and labor rates for accurate pricing
 * calculations tailored to the Houston Heights, Texas area.
 */

import { Frame, MatColor, GlassOption } from '@shared/schema';
import { calculateFramePrice, calculateMatPrice, calculateGlassPrice } from './pricingService';

// Houston Heights labor rates and markup factors
const HOUSTON_HEIGHTS_LABOR_RATE = 65; // per hour
const HOUSTON_HEIGHTS_REGIONAL_FACTOR = 1.15; // 15% additional for higher cost market

// Standard labor time estimates (in hours)
interface LaborEstimates {
  frameAssembly: number; // Time to assemble frame per united inch
  matCutting: number;    // Time to cut a mat per united inch
  glassCutting: number;  // Time to cut glass per united inch
  fitting: number;       // Time to fit artwork into assembled frame
  finishing: number;     // Time for final assembly, cleaning, etc.
}

// Houston Heights labor time estimates
const LABOR_ESTIMATES: LaborEstimates = {
  frameAssembly: 0.01,  // 0.01 hour per united inch
  matCutting: 0.008,    // 0.008 hour per united inch
  glassCutting: 0.007,  // 0.007 hour per united inch
  fitting: 0.25,        // 15 minutes base time
  finishing: 0.33       // 20 minutes base time
};

/**
 * Calculate labor cost based on united inches and labor estimates
 * @param unitedInches Total united inches (width + height)
 * @returns The calculated labor cost
 */
function calculateLaborCost(unitedInches: number): number {
  // Calculate time required for each step
  const frameAssemblyTime = LABOR_ESTIMATES.frameAssembly * unitedInches;
  const matCuttingTime = LABOR_ESTIMATES.matCutting * unitedInches;
  const glassCuttingTime = LABOR_ESTIMATES.glassCutting * unitedInches;
  
  // Fixed time regardless of size
  const fittingTime = LABOR_ESTIMATES.fitting;
  const finishingTime = LABOR_ESTIMATES.finishing;
  
  // Total labor time
  const totalLaborTime = frameAssemblyTime + matCuttingTime + glassCuttingTime + fittingTime + finishingTime;
  
  // Calculate labor cost based on Houston Heights rate
  const laborCost = totalLaborTime * HOUSTON_HEIGHTS_LABOR_RATE;
  
  console.log(`Labor cost calculation: ${totalLaborTime.toFixed(2)} hours × $${HOUSTON_HEIGHTS_LABOR_RATE}/hr = $${laborCost.toFixed(2)}`);
  
  return laborCost;
}

/**
 * Calculate the retail price for a custom frame with vendor API prices
 * @param frame Frame details with wholesale price info
 * @param mat MatColor details with wholesale price info
 * @param glass GlassOption details with wholesale price info
 * @param artworkWidth Width of the artwork in inches
 * @param artworkHeight Height of the artwork in inches
 * @param matWidth Width of the mat border in inches
 * @param quantity Number of identical frames to produce
 * @returns Object containing component prices and total price
 */
export async function calculateRetailPrice(
  frame: Frame | null,
  mat: MatColor | null,
  glass: GlassOption | null,
  artworkWidth: number,
  artworkHeight: number,
  matWidth: number = 0,
  quantity: number = 1
): Promise<{
  framePrice: number;
  matPrice: number;
  glassPrice: number;
  laborCost: number;
  materialCost: number;
  subtotal: number;
  totalPrice: number;
}> {
  // Calculate united inches (width + height)
  const artworkUnitedInches = artworkWidth + artworkHeight;
  
  // Calculate outer dimensions with mat (if applicable)
  const frameWidth = artworkWidth + (matWidth * 2);
  const frameHeight = artworkHeight + (matWidth * 2);
  const frameUnitedInches = frameWidth + frameHeight;
  
  // Calculate perimeter in feet (for frame pricing)
  const framePerimeterInches = (frameWidth * 2) + (frameHeight * 2);
  const framePerimeterFeet = framePerimeterInches / 12;
  
  // Calculate areas in square inches
  const artworkArea = artworkWidth * artworkHeight;
  const frameArea = frameWidth * frameHeight;
  const matArea = frameArea - artworkArea;
  
  // Get wholesale prices from objects or use defaults
  const frameWholesalePrice = frame?.price ? parseFloat(frame.price) : 8.00; // Default $8/ft
  const matWholesalePrice = mat?.price ? parseFloat(mat.price) : 4.00;      // Default $4/sq ft
  const glassWholesalePrice = glass?.price ? parseFloat(glass.price) : 0.08; // Default $0.08/sq inch
  
  // Calculate component prices using the pricing service
  const framePrice = frame ? calculateFramePrice(frameWholesalePrice, framePerimeterFeet) : 0;
  const matPrice = mat ? calculateMatPrice(matWholesalePrice, matArea, frameUnitedInches) : 0;
  const glassPrice = glass ? calculateGlassPrice(glassWholesalePrice, frameArea) : 0;
  
  // Calculate labor cost
  const laborCost = calculateLaborCost(artworkUnitedInches);
  
  // Apply Houston Heights regional factor to all costs
  const adjustedFramePrice = framePrice * HOUSTON_HEIGHTS_REGIONAL_FACTOR;
  const adjustedMatPrice = matPrice * HOUSTON_HEIGHTS_REGIONAL_FACTOR;
  const adjustedGlassPrice = glassPrice * HOUSTON_HEIGHTS_REGIONAL_FACTOR;
  const adjustedLaborCost = laborCost * HOUSTON_HEIGHTS_REGIONAL_FACTOR;
  
  // Calculate material cost and subtotal
  const materialCost = adjustedFramePrice + adjustedMatPrice + adjustedGlassPrice;
  const subtotal = (materialCost + adjustedLaborCost) * quantity;
  
  // Round all prices to 2 decimal places for consistency
  const roundedFramePrice = Math.round(adjustedFramePrice * 100) / 100;
  const roundedMatPrice = Math.round(adjustedMatPrice * 100) / 100;
  const roundedGlassPrice = Math.round(adjustedGlassPrice * 100) / 100;
  const roundedLaborCost = Math.round(adjustedLaborCost * 100) / 100;
  const roundedMaterialCost = Math.round(materialCost * 100) / 100;
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  
  // Log the detailed price breakdown
  console.log(`
  Price Breakdown for ${artworkWidth}"×${artworkHeight}" artwork with ${mat ? matWidth + '"' : 'no'} mat:
  ------------------------------------------------------------
  Frame (${frame?.name || 'None'}): $${roundedFramePrice.toFixed(2)}
  Mat (${mat?.name || 'None'}): $${roundedMatPrice.toFixed(2)}
  Glass (${glass?.name || 'None'}): $${roundedGlassPrice.toFixed(2)}
  Labor: $${roundedLaborCost.toFixed(2)}
  ------------------------------------------------------------
  Material Cost: $${roundedMaterialCost.toFixed(2)}
  Quantity: ${quantity}
  ------------------------------------------------------------
  Subtotal: $${roundedSubtotal.toFixed(2)}
  `);
  
  return {
    framePrice: roundedFramePrice,
    matPrice: roundedMatPrice,
    glassPrice: roundedGlassPrice,
    laborCost: roundedLaborCost,
    materialCost: roundedMaterialCost,
    subtotal: roundedSubtotal,
    totalPrice: roundedSubtotal
  };
}

/**
 * Interface for API response from vendor wholesale price API
 */
interface VendorWholesalePriceResponse {
  success: boolean;
  data: {
    sku: string;
    wholesalePrice: number;
    currency: string;
    inStock: boolean;
    minimumOrder: number;
    leadTime: number; // in days
  };
}

/**
 * Fetch current wholesale price from vendor API
 * @param vendorId The vendor identifier (e.g., "larson", "nielsen")
 * @param productSku The product SKU or item number
 * @returns The current wholesale price
 */
export async function fetchWholesalePrice(
  vendorId: string,
  productSku: string
): Promise<number> {
  try {
    // This would be replaced with actual API calls to vendor systems
    // For now, we'll use a simulated response with realistic pricing
    
    console.log(`Fetching wholesale price for ${productSku} from ${vendorId}`);
    
    // Simulate network delay for API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Default price if we can't determine from vendor/SKU
    let wholesalePrice = 0;
    
    // Determine wholesale price based on vendor and SKU patterns
    // This would be replaced with actual API calls in production
    if (vendorId === 'larson') {
      // Larson Juhl frames typically range from $5-20 per foot wholesale
      // Extract a price from the SKU if possible
      if (productSku.includes('210')) {
        wholesalePrice = 12.50; // Premier line
      } else if (productSku.includes('110')) {
        wholesalePrice = 8.75; // Standard line
      } else {
        wholesalePrice = 10.00; // Default Larson price
      }
    } else if (vendorId === 'nielsen') {
      // Nielsen typically ranges from $4-15 per foot wholesale
      if (productSku.includes('117')) {
        wholesalePrice = 14.25; // Metal series
      } else if (productSku.includes('71')) {
        wholesalePrice = 9.50; // Wood series
      } else {
        wholesalePrice = 7.50; // Default Nielsen price
      }
    } else if (vendorId === 'roma') {
      // Roma frames typically range from $6-25 per foot wholesale
      if (productSku.includes('307')) {
        wholesalePrice = 18.00; // Gold series
      } else {
        wholesalePrice = 12.00; // Default Roma price
      }
    } else if (vendorId === 'crescent') {
      // Crescent matboards typically $2-6 per sq foot wholesale
      if (productSku.includes('select')) {
        wholesalePrice = 5.25; // Select line
      } else if (productSku.includes('C1')) {
        wholesalePrice = 4.00; // Standard conservation
      } else {
        wholesalePrice = 3.50; // Default Crescent price
      }
    } else {
      // Generic default pricing
      wholesalePrice = 8.00;
    }
    
    console.log(`Retrieved wholesale price for ${productSku}: $${wholesalePrice}`);
    
    return wholesalePrice;
  } catch (error) {
    console.error(`Error fetching wholesale price for ${productSku} from ${vendorId}:`, error);
    // Return a sensible default if API fails
    return 8.00;
  }
}

/**
 * Update a frame object with current wholesale price from vendor API
 * @param frame The frame object to update
 * @returns The updated frame with current pricing
 */
export async function updateFrameWithCurrentPrice(frame: Frame): Promise<Frame> {
  if (!frame.id) {
    return frame;
  }
  
  // Extract vendor and SKU from frame ID
  // Example frame ID format: "larson-210286"
  const [vendor, sku] = frame.id.split('-');
  
  if (!vendor || !sku) {
    return frame;
  }
  
  try {
    // Fetch current wholesale price
    const currentPrice = await fetchWholesalePrice(vendor, sku);
    
    // Update frame object with current price
    return {
      ...frame,
      price: currentPrice.toString()
    };
  } catch (error) {
    console.error(`Error updating frame ${frame.id} with current price:`, error);
    return frame;
  }
}

/**
 * Update multiple frames with current wholesale prices
 * @param frames Array of frames to update
 * @returns Updated frames with current pricing
 */
export async function updateFramesWithCurrentPrices(frames: Frame[]): Promise<Frame[]> {
  // Update each frame concurrently
  const updatedFramesPromises = frames.map(frame => updateFrameWithCurrentPrice(frame));
  
  // Wait for all updates to complete
  return Promise.all(updatedFramesPromises);
}

/**
 * Get current labor rates for Houston Heights, Texas
 * @returns Current labor rates for the location
 */
export function getHoustonHeightsLaborRates(): {
  baseRate: number;
  regionalFactor: number;
  estimates: LaborEstimates;
} {
  return {
    baseRate: HOUSTON_HEIGHTS_LABOR_RATE,
    regionalFactor: HOUSTON_HEIGHTS_REGIONAL_FACTOR,
    estimates: LABOR_ESTIMATES
  };
}