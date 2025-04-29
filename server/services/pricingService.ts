import { storage } from '../storage';

/**
 * Houston Heights custom pricing service
 * 
 * This service implements the logic for calculating custom framing prices
 * based on united inch measurements with sliding scale markups specifically
 * for the Houston Heights location.
 */

// Individual component pricing functions used by the existing system
/**
 * Calculate frame price based on wholesale price and perimeter
 * @param wholesalePrice The wholesale price per foot
 * @param perimeter The perimeter in feet
 * @returns The retail price
 */
export function calculateFramePrice(wholesalePrice: number, perimeter: number): number {
  // Calculate united inches (rough approximation from perimeter)
  const unitedInches = perimeter * 6; // Rough conversion
  
  // Get markup based on united inches
  const markup = calculateFrameMarkup(unitedInches);
  
  // Apply Houston-specific frame pricing factor
  return wholesalePrice * perimeter * markup * FRAME_MARKUP_FACTOR;
}

/**
 * Calculate mat price based on wholesale price and area
 * @param wholesalePrice The wholesale price per square inch
 * @param area The area in square inches
 * @param unitedInches The united inches of the outer dimensions
 * @returns The retail price
 */
export function calculateMatPrice(wholesalePrice: number, area: number, unitedInches: number): number {
  // Get markup based on united inches
  const markup = calculateMatMarkup(unitedInches);
  
  // Calculate price
  return area * wholesalePrice * markup;
}

/**
 * Calculate glass price based on wholesale price and area
 * @param wholesalePrice The wholesale price per square inch
 * @param area The area in square inches
 * @param width Width in inches
 * @param height Height in inches 
 * @param glassType Type of glass (regular, conservation, museum)
 * @returns The retail price
 */
export function calculateGlassPrice(
  wholesalePrice: number, 
  area: number, 
  width: number = 0, 
  height: number = 0,
  glassType: 'regular' | 'conservation' | 'museum' = 'regular'
): number {
  // Use provided dimensions or calculate from area
  const unitedInches = (width && height) ? width + height : Math.sqrt(area) * 2;
  
  // Get markup based on united inches
  const markup = calculateGlassMarkup(unitedInches);
  
  // Apply type-specific additional factors
  let typeMultiplier = 1.0;
  switch (glassType) {
    case 'conservation':
      typeMultiplier = 1.5; // Conservation glass costs more
      break;
    case 'museum':
      typeMultiplier = 3.0; // Museum glass costs significantly more
      break;
  }
  
  // Apply Houston-specific glass pricing factor
  return wholesalePrice * area * markup * GLASS_MARKUP_FACTOR * typeMultiplier;
}

// Types
export interface FramePricingParams {
  frameId: string;
  matColorId: string;
  glassOptionId: string;
  artworkWidth: number;
  artworkHeight: number;
  matWidth: number;
  quantity: number;
  includeWholesalePrices?: boolean;
}

export interface PricingResult {
  framePrice: number;
  matPrice: number;
  glassPrice: number;
  backingPrice: number;
  laborCost: number;
  materialCost: number;
  subtotal: number;
  totalPrice: number;
  wholesalePrices?: {
    frame?: string;
    mat?: string;
    glass?: string;
    backing?: string;
  };
  laborRates?: {
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
  profitability?: {
    totalWholesaleCost: number;
    overheadCost: number;
    grossProfit: number;
    grossProfitMargin: number;
    markupMultiplier: number;
  };
}

// Houston-specific markup values
const FRAME_MARKUP_FACTOR = 0.22; // Adjust frame price to be more accurate for Houston market (22%)
const GLASS_MARKUP_FACTOR = 2.5; // Increase glass price by 2.5x for accurate pricing
const MAT_BASE_PRICE = 6.5; // Base price per square inch for matting in Houston market
const BACKING_MARKUP_FACTOR = 1.2; // Slightly increase backing price by 20%
const HOUSTON_REGIONAL_FACTOR = 1.25; // Houston Heights area regional labor rate factor
const BASE_LABOR_RATE = 35; // Base hourly labor rate

// Business overhead and profitability settings
const OVERHEAD_PERCENTAGE = 0.30; // 30% overhead allocation for utilities, rent, etc.
const TARGET_PROFIT_MARGIN = 0.40; // 40% target profit margin
const MIN_PROFIT_MARGIN = 0.25; // 25% minimum acceptable profit margin

/**
 * Calculate sliding scale markup for frame pricing
 * Based on united inches
 */
function calculateFrameMarkup(unitedInches: number): number {
  if (unitedInches <= 20) return 2.0;
  if (unitedInches <= 40) return 2.5;
  if (unitedInches <= 60) return 3.0;
  if (unitedInches <= 80) return 3.5;
  return 4.0;
}

/**
 * Calculate sliding scale markup for glass pricing
 * Based on united inches
 */
function calculateGlassMarkup(unitedInches: number): number {
  if (unitedInches <= 20) return 2.0;
  if (unitedInches <= 40) return 2.3;
  if (unitedInches <= 60) return 2.6;
  if (unitedInches <= 80) return 2.9;
  return 3.2;
}

/**
 * Calculate sliding scale markup for mat pricing
 * Based on united inches
 */
function calculateMatMarkup(unitedInches: number): number {
  if (unitedInches <= 20) return 2.0;
  if (unitedInches <= 40) return 2.2;
  if (unitedInches <= 60) return 2.4;
  if (unitedInches <= 80) return 2.6;
  return 2.8;
}

/**
 * Calculate labor estimates based on materials and dimensions
 */
function calculateLaborEstimates(
  hasFrame: boolean,
  hasMat: boolean,
  hasGlass: boolean,
  unitedInches: number
): { 
  frameAssembly: number,
  matCutting: number,
  glassCutting: number,
  fitting: number,
  finishing: number
} {
  const sizeFactor = unitedInches / 40; // Normalize to a standard size
  
  // Base time estimates in hours
  return {
    frameAssembly: hasFrame ? 0.25 * sizeFactor : 0,
    matCutting: hasMat ? 0.3 * sizeFactor : 0,
    glassCutting: hasGlass ? 0.15 * sizeFactor : 0,
    fitting: 0.2 * sizeFactor,
    finishing: 0.1 * sizeFactor
  };
}

/**
 * Calculate total labor cost based on estimated hours
 */
function calculateLaborCost(
  estimates: { 
    frameAssembly: number,
    matCutting: number,
    glassCutting: number,
    fitting: number,
    finishing: number
  },
  baseRate: number,
  regionalFactor: number
): number {
  const totalHours = 
    estimates.frameAssembly + 
    estimates.matCutting + 
    estimates.glassCutting + 
    estimates.fitting + 
    estimates.finishing;
    
  return totalHours * baseRate * regionalFactor;
}

/**
 * Main pricing calculation function for custom frames
 */
export async function calculateFramingPrice(params: FramePricingParams): Promise<PricingResult> {
  const {
    frameId,
    matColorId,
    glassOptionId,
    artworkWidth,
    artworkHeight,
    matWidth,
    quantity,
    includeWholesalePrices = false
  } = params;

  // Get frame, mat, and glass information
  const frame = frameId && frameId !== 'none' ? await storage.getFrame(frameId) : null;
  const matColor = matColorId && matColorId !== 'none' ? await storage.getMatColor(matColorId) : null;
  const glassOption = glassOptionId && glassOptionId !== 'none' ? await storage.getGlassOption(glassOptionId) : null;

  // Calculate dimensions
  const artworkUnitedInches = artworkWidth + artworkHeight;
  const finishedWidth = artworkWidth + (matWidth * 2);
  const finishedHeight = artworkHeight + (matWidth * 2);
  const finishedUnitedInches = finishedWidth + finishedHeight;
  const matSurfaceArea = finishedWidth * finishedHeight - (artworkWidth * artworkHeight);
  const frameLength = (finishedWidth * 2) + (finishedHeight * 2);

  // Initialize wholesale prices if requested
  const wholesalePrices = includeWholesalePrices ? {
    frame: frame ? frame.price : '0.00',
    mat: '0.00',
    glass: glassOption ? glassOption.price || '0.00' : '0.00',
    backing: '0.00'
  } : undefined;

  // Calculate frame price
  let framePrice = 0;
  if (frame) {
    const frameWholesalePrice = parseFloat(frame.price);
    const frameMarkup = calculateFrameMarkup(finishedUnitedInches);
    // Apply Houston-specific frame pricing factor
    framePrice = frameWholesalePrice * frameLength / 12 * frameMarkup * FRAME_MARKUP_FACTOR;
  }

  // Calculate mat price
  let matPrice = 0;
  if (matColor) {
    const matBasePrice = MAT_BASE_PRICE; // Price per square inch
    const matMarkup = calculateMatMarkup(finishedUnitedInches);
    matPrice = matSurfaceArea * matBasePrice * matMarkup;
    
    // Update wholesale price for mat if requested
    if (wholesalePrices) {
      wholesalePrices.mat = (matSurfaceArea * matBasePrice).toFixed(2);
    }
  }

  // Calculate glass price
  let glassPrice = 0;
  if (glassOption) {
    const glassBasePrice = glassOption.price ? parseFloat(glassOption.price) : 0;
    const glassArea = finishedWidth * finishedHeight;
    
    // Determine glass type based on the option name or ID
    let glassType: 'regular' | 'conservation' | 'museum' = 'regular';
    if (glassOption.name) {
      const lowerName = glassOption.name.toLowerCase();
      if (lowerName.includes('museum') || lowerName.includes('uv')) {
        glassType = 'museum';
      } else if (lowerName.includes('conservation') || lowerName.includes('clear')) {
        glassType = 'conservation';
      }
    }
    
    // Use the enhanced glass price calculation function
    glassPrice = calculateGlassPrice(
      glassBasePrice, 
      glassArea,
      finishedWidth,
      finishedHeight,
      glassType
    );
  }
  
  // Calculate backing price
  // Base price is $0.04 per square inch for standard backing
  const backingBasePrice = 0.04;
  const backingArea = finishedWidth * finishedHeight;
  const backingPrice = backingArea * backingBasePrice * BACKING_MARKUP_FACTOR;
  
  // Update wholesale price for backing if requested
  if (wholesalePrices) {
    wholesalePrices.backing = (backingArea * backingBasePrice).toFixed(2);
  }

  // Calculate labor costs
  const laborEstimates = calculateLaborEstimates(
    !!frame,
    !!matColor,
    !!glassOption,
    finishedUnitedInches
  );
  
  const laborCost = calculateLaborCost(
    laborEstimates,
    BASE_LABOR_RATE,
    HOUSTON_REGIONAL_FACTOR
  );

  // Calculate totals
  const materialCost = framePrice + matPrice + glassPrice + backingPrice;
  const subtotal = materialCost + laborCost;
  const totalPrice = subtotal * quantity;
  
  // Calculate profitability metrics
  let profitability;
  
  if (includeWholesalePrices && wholesalePrices) {
    // Calculate total wholesale cost
    const frameWholesaleCost = frame ? parseFloat(frame.price) * frameLength / 12 : 0;
    const matWholesaleCost = matColor ? parseFloat(wholesalePrices.mat) : 0;
    const glassWholesaleCost = glassOption ? 
      (glassOption.price ? parseFloat(glassOption.price) * finishedWidth * finishedHeight / 144 : 0) : 0;
    const backingWholesaleCost = parseFloat(wholesalePrices.backing);
    
    const totalWholesaleCost = frameWholesaleCost + matWholesaleCost + glassWholesaleCost + backingWholesaleCost;
    const overheadCost = totalWholesaleCost * OVERHEAD_PERCENTAGE;
    const totalCost = totalWholesaleCost + overheadCost + laborCost;
    const grossProfit = subtotal - totalCost;
    const grossProfitMargin = grossProfit / subtotal;
    const markupMultiplier = subtotal / totalWholesaleCost;
    
    profitability = {
      totalWholesaleCost,
      overheadCost,
      grossProfit,
      grossProfitMargin,
      markupMultiplier
    };
  }

  return {
    framePrice,
    matPrice,
    glassPrice,
    backingPrice,
    laborCost,
    materialCost,
    subtotal,
    totalPrice,
    wholesalePrices,
    laborRates: {
      baseRate: BASE_LABOR_RATE,
      regionalFactor: HOUSTON_REGIONAL_FACTOR,
      estimates: laborEstimates
    },
    profitability
  };
}