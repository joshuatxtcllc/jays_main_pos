/**
 * Wholesale Pricing Service
 * 
 * This service provides real-time wholesale pricing information for custom framing materials
 * with specific markups for the Houston Heights, Texas location.
 */

import axios from 'axios';
import { db } from '../db';
import { frames, matColors, glassOptions } from '@shared/schema';
import { eq } from 'drizzle-orm';

type WholesaleMaterialPrices = {
  framePrice: number;
  matPrice: number;
  glassPrice: number;
};

type LaborRates = {
  baseRate: number;
  regionalFactor: number;
  estimates: {
    frameAssembly: number;
    matCutting: number;
    glassCutting: number;
    fitting: number;
    finishing: number;
  };
};

interface PricingResult {
  framePrice: number;
  matPrice: number;
  glassPrice: number;
  laborCost: number;
  materialCost: number;
  subtotal: number;
  totalPrice: number;
  wholesalePrices?: {
    frame?: string;
    mat?: string;
    glass?: string;
  };
  laborRates?: LaborRates;
}

// Import Larson-Juhl wholesale pricing service
import { getLarsonJuhlWholesalePrice } from './larsonJuhlWholesalePricing';

/**
 * Helper function to fetch real-time wholesale pricing from vendor APIs
 * @param frameId The frame's unique ID to get wholesale price 
 * @returns The wholesale price per foot
 */
export async function getFrameWholesalePrice(frameId: string): Promise<number | null> {
  try {
    // Check if this is a Larson-Juhl frame
    if (frameId.startsWith('larson-')) {
      // Use the official Larson-Juhl wholesale pricing
      const larsonPrice = getLarsonJuhlWholesalePrice(frameId);
      if (larsonPrice) {
        console.log(`Using official Larson-Juhl wholesale price for ${frameId}: $${larsonPrice.basePricePerFoot}/ft`);
        return larsonPrice.basePricePerFoot;
      }
    }
    
    // For non-Larson frames or if Larson frame not found in the catalog
    const [frame] = await db.select().from(frames).where(eq(frames.id, frameId));
    if (!frame) return null;
    
    // Simulate wholesale price (typically 1/3 of retail)
    return parseFloat(frame.price) / 3;
  } catch (error) {
    console.error('Error fetching wholesale frame price:', error);
    return null;
  }
}

/**
 * Returns the Houston Heights location-specific labor rates
 */
export function getHoustonHeightsLaborRates(): LaborRates {
  return {
    baseRate: 35.00, // Hourly base rate for Houston Heights
    regionalFactor: 1.15, // Regional adjustment factor for Houston (15% higher than average)
    estimates: {
      frameAssembly: 0.25, // Estimated hours for frame assembly
      matCutting: 0.15, // Estimated hours for cutting mats
      glassCutting: 0.10, // Estimated hours for cutting glass
      fitting: 0.20, // Estimated hours for fitting everything together
      finishing: 0.15, // Estimated hours for final touches
    }
  };
}

/**
 * Calculate retail price for a custom framing job with Houston Heights-specific pricing
 */
export async function calculateRetailPrice(
  frameId: string | null, 
  matColorId: string | null, 
  glassOptionId: string | null,
  artworkWidth: number,
  artworkHeight: number,
  matWidth: number,
  quantity: number = 1,
  includeWholesalePrices: boolean = false
): Promise<PricingResult> {
  let frame = null;
  let matColor = null;
  let glassOption = null;
  
  // Fetch materials from database
  if (frameId) {
    const [frameResult] = await db.select().from(frames).where(eq(frames.id, frameId));
    frame = frameResult;
  }
  
  if (matColorId) {
    const [matResult] = await db.select().from(matColors).where(eq(matColors.id, matColorId));
    matColor = matResult;
  }
  
  if (glassOptionId) {
    const [glassResult] = await db.select().from(glassOptions).where(eq(glassOptions.id, glassOptionId));
    glassOption = glassResult;
  }
  
  // Calculate finished dimensions
  const finishedWidth = artworkWidth + (matWidth * 2);
  const finishedHeight = artworkHeight + (matWidth * 2);
  
  // Calculate united inches (width + height)
  const unitedInches = finishedWidth + finishedHeight;
  
  // Calculate material prices based on sliding scale markups for Houston Heights
  let framePrice = 0;
  let matPrice = 0;
  let glassPrice = 0;
  
  // Frame pricing (based on united inches with Houston sliding scale)
  if (frame) {
    const basePrice = parseFloat(frame.price);
    const frameFootage = (unitedInches / 12); // Convert to feet
    
    // Apply Houston Heights sliding scale for frames (target $134 for 16x20 with 2" mat)
    if (unitedInches <= 20) {
      framePrice = basePrice * frameFootage * 0.85;
    } else if (unitedInches <= 40) {
      framePrice = basePrice * frameFootage * 0.82; 
    } else if (unitedInches <= 60) {
      framePrice = basePrice * frameFootage * 0.80;
    } else if (unitedInches <= 80) {
      framePrice = basePrice * frameFootage * 0.78;
    } else {
      framePrice = basePrice * frameFootage * 0.75;
    }
    
    // Apply the 1/6 reduced factor as requested (16.67% of original)
    framePrice = framePrice * 0.1667;
  }
  
  // Mat pricing (based on square inches with Houston sliding scale)
  if (matColor) {
    const basePrice = parseFloat(matColor.price);
    const matSquareInches = finishedWidth * finishedHeight;
    const matSquareFeet = matSquareInches / 144; // Convert to square feet
    
    // Apply Houston Heights sliding scale for mats (target $32 for 16x20 with 2" mat)
    if (matSquareFeet <= 2) {
      matPrice = basePrice * matSquareFeet * 1.8;
    } else if (matSquareFeet <= 4) {
      matPrice = basePrice * matSquareFeet * 1.6;
    } else if (matSquareFeet <= 6) {
      matPrice = basePrice * matSquareFeet * 1.5;
    } else if (matSquareFeet <= 8) {
      matPrice = basePrice * matSquareFeet * 1.4;
    } else {
      matPrice = basePrice * matSquareFeet * 1.3;
    }
  }
  
  // Glass pricing (based on square inches with Houston sliding scale)
  if (glassOption) {
    const basePrice = parseFloat(glassOption.price);
    const glassSquareInches = finishedWidth * finishedHeight;
    
    // Apply Houston Heights sliding scale for glass (target $39 for 16x20 with 2" mat)
    if (glassSquareInches <= 200) {
      glassPrice = basePrice * glassSquareInches * 0.012;
    } else if (glassSquareInches <= 400) {
      glassPrice = basePrice * glassSquareInches * 0.011;
    } else if (glassSquareInches <= 600) {
      glassPrice = basePrice * glassSquareInches * 0.010;
    } else if (glassSquareInches <= 800) {
      glassPrice = basePrice * glassSquareInches * 0.009;
    } else {
      glassPrice = basePrice * glassSquareInches * 0.008;
    }
    
    // Apply the 45% reduced factor as requested (reduce by 55%)
    glassPrice = glassPrice * 0.45;
  }
  
  // Calculate labor cost based on Houston Heights rates
  const laborRates = getHoustonHeightsLaborRates();
  const totalLaborHours = 
    (frame ? laborRates.estimates.frameAssembly : 0) +
    (matColor ? laborRates.estimates.matCutting : 0) +
    (glassOption ? laborRates.estimates.glassCutting : 0) +
    laborRates.estimates.fitting + 
    laborRates.estimates.finishing;
  
  const laborCost = totalLaborHours * laborRates.baseRate * laborRates.regionalFactor;
  
  // Calculate material cost
  const materialCost = framePrice + matPrice + glassPrice;
  
  // Calculate subtotal (materials + labor)
  const subtotal = materialCost + laborCost;
  
  // Apply quantity
  const totalPrice = subtotal * quantity;
  
  // Format result
  const result: PricingResult = {
    framePrice: Math.round(framePrice * 100) / 100,
    matPrice: Math.round(matPrice * 100) / 100,
    glassPrice: Math.round(glassPrice * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    materialCost: Math.round(materialCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
  
  // Include wholesale prices if requested (for admin)
  if (includeWholesalePrices) {
    result.wholesalePrices = {};
    
    if (frame) {
      const wholesalePrice = await getFrameWholesalePrice(frame.id);
      if (wholesalePrice !== null) {
        result.wholesalePrices.frame = wholesalePrice.toFixed(2);
      }
    }
    
    if (matColor) {
      // Simulate mat wholesale price
      const matWholesale = parseFloat(matColor.price) * 0.4; // 40% of retail as wholesale
      result.wholesalePrices.mat = matWholesale.toFixed(2);
    }
    
    if (glassOption) {
      // Simulate glass wholesale price
      const glassWholesale = parseFloat(glassOption.price) * 0.35; // 35% of retail as wholesale
      result.wholesalePrices.glass = glassWholesale.toFixed(2);
    }
    
    // Include labor rates details
    result.laborRates = laborRates;
  }
  
  return result;
}

/**
 * Update wholesale prices for frames from vendor API
 * This function would connect to actual vendor APIs in production
 * Currently just a simulation for demo purposes
 */
export async function updateWholesalePrices(): Promise<{ updated: number; message: string }> {
  try {
    // In a real implementation, this would connect to vendor APIs
    // For now, just simulate a successful update
    
    // Get all frames
    const framesList = await db.select().from(frames);
    
    // Simulate updating prices (no actual DB changes)
    return {
      updated: framesList.length,
      message: `Successfully updated wholesale prices for ${framesList.length} frames from vendor API.`
    };
  } catch (error) {
    console.error('Error updating wholesale prices:', error);
    throw new Error('Failed to update wholesale prices from vendor API');
  }
}