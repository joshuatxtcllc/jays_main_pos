import { storage } from '../storage';
import { 
  calculateFramePrice as calculateFramePriceCorrect, 
  calculateMatPrice as calculateMatPriceCorrect, 
  calculateGlassPrice as calculateGlassPriceCorrect, 
  calculatePricePerUnitedInch 
} from '@shared/pricingUtils';

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

// Reduced markup factor for more reasonable frame pricing
const REDUCED_MARKUP_FACTOR = 1.2; // This replaces the higher FRAME_MARKUP_FACTOR

 * @param perimeter The perimeter in feet
 * @returns The retail price
 */
export function calculateFramePrice(wholesalePrice: number, perimeter: number): number {
  // Calculate united inches (rough approximation from perimeter)
  const unitedInches = perimeter * 6; // Rough conversion

  // Get markup based on united inches
  const markup = calculateFrameMarkup(unitedInches);

  // Apply a more reasonable pricing factor (reduced from original FRAME_MARKUP_FACTOR)
  // This prevents astronomical pricing
  const adjustedMarkupFactor = 1.2; // Reduced from original value

  return wholesalePrice * perimeter * markup * adjustedMarkupFactor;
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
      typeMultiplier = 2.0; // Museum glass costs more but not 3x (reduced from 3.0)
      break;
  }

  // Convert area from square inches to square feet for more reasonable pricing
  const areaInSqFt = area / 144;

  // Apply industry-standard glass pricing for museum quality positioning
  // Base pricing aligned with $126-350 range for museum glass per industry benchmarks
  const basePrice = unitedInches <= 40 ? 85 : 125; // Increased base price for industry positioning

  return basePrice + (areaInSqFt * wholesalePrice * markup * 0.35 * typeMultiplier);
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
  framePricingMethod?: string;
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

// Houston-specific markup values - reduced for competitive pricing with length pricing
const FRAME_MARKUP_FACTOR = 0.28; // Reduced significantly with length pricing
const GLASS_MARKUP_FACTOR = 2.8; // Reduced for more competitive glass pricing
const MAT_BASE_PRICE = 8.0; // Reduced mat base pricing
const BACKING_MARKUP_FACTOR = 1.2; // Reduced backing markup
const HOUSTON_REGIONAL_FACTOR = 1.15; // Reduced regional factor
const BASE_LABOR_RATE = 45; // Reduced labor rate for competitive pricing

// Business overhead and profitability settings
const OVERHEAD_PERCENTAGE = 0.30; // 30% overhead allocation for utilities, rent, etc.
const TARGET_PROFIT_MARGIN = 0.40; // 40% target profit margin
const MIN_PROFIT_MARGIN = 0.25; // 25% minimum acceptable profit margin

/**
 * Calculate sliding scale markup for frame pricing
 * Based on united inches - reduced for length pricing method
 */
function calculateFrameMarkup(unitedInches: number): number {
  if (unitedInches <= 20) return 1.8;
  if (unitedInches <= 40) return 2.2;
  if (unitedInches <= 60) return 2.6;
  if (unitedInches <= 80) return 3.0;
  return 3.4;
}

/**
 * Calculate sliding scale markup for glass pricing
 * Based on united inches - aligned with industry standards
 */
function calculateGlassMarkup(unitedInches: number): number {
  if (unitedInches <= 20) return 2.8;
  if (unitedInches <= 40) return 3.2;
  if (unitedInches <= 60) return 3.6;
  if (unitedInches <= 80) return 4.0;
  return 4.5;
}

/**
 * Calculate sliding scale markup for mat pricing
 * Based on united inches - aligned with industry standards
 */
function calculateMatMarkup(unitedInches: number): number {
  if (unitedInches <= 20) return 2.5;
  if (unitedInches <= 40) return 2.8;
  if (unitedInches <= 60) return 3.1;
  if (unitedInches <= 80) return 3.4;
  return 3.8;
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

const SPECIAL_SERVICES = {
  float_mounting: { price: 25.00, description: 'Float mounting' },
  shadowbox_mounting: { price: 35.00, description: 'Shadow box mounting' },
  conservation_mounting: { price: 45.00, description: 'Conservation mounting' },
  dry_mounting: { price: 15.00, description: 'Dry mounting' },
  rush_service: { price: 50.00, description: 'Rush order (3-day completion)' },
  '3d_design_service': { price: 75.00, description: '3D design consultation and setup' },
  shadowbox_service: { price: 100.00, description: 'Shadow box construction' }
};

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

  // Calculate frame price using correct methodology
  let framePrice = 0;
  if (frame) {
    const pricePerFoot = parseFloat(frame.price);
    framePrice = calculateFramePriceCorrect(artworkWidth, artworkHeight, matWidth, pricePerFoot);
    
    // Update wholesale price for frame if requested
    if (wholesalePrices) {
      const outerWidth = artworkWidth + (matWidth * 2);
      const outerHeight = artworkHeight + (matWidth * 2);
      const unitedInches = outerWidth + outerHeight;
      const perimeterFeet = unitedInches / 12;
      const wholesaleCost = perimeterFeet * pricePerFoot;
      wholesalePrices.frame = wholesaleCost.toFixed(2);
    }
  }

  // Calculate mat price using catalog pricing methodology
  let matPrice = 0;
  if (matColor) {
    // Use catalog data for mat pricing - example values for Regular Mat Board
    const matBoxPrice = 45.50; // Price for a box of 25 sheets
    const sheetsPerBox = 25;
    const sheetWidth = 32; // inches
    const sheetHeight = 40; // inches
    
    const matPricePerUnitedInch = calculatePricePerUnitedInch(matBoxPrice, sheetsPerBox, sheetWidth, sheetHeight);
    matPrice = calculateMatPriceCorrect(artworkWidth, artworkHeight, matWidth, matPricePerUnitedInch);
    
    // Update wholesale price for mat if requested
    if (wholesalePrices) {
      const outerWidth = artworkWidth + (matWidth * 2);
      const outerHeight = artworkHeight + (matWidth * 2);
      const unitedInches = outerWidth + outerHeight;
      const wholesaleCost = unitedInches * matPricePerUnitedInch;
      wholesalePrices.mat = wholesaleCost.toFixed(2);
    }
  }

  // Calculate glass price using catalog pricing methodology
  let glassPrice = 0;
  if (glassOption) {
    // Use catalog data for glass pricing - example values for Regular Glass
    const glassBoxPrice = 125.00; // Price for a box of 10 sheets
    const sheetsPerBox = 10;
    const sheetWidth = 24; // inches
    const sheetHeight = 36; // inches
    
    const glassPricePerUnitedInch = calculatePricePerUnitedInch(glassBoxPrice, sheetsPerBox, sheetWidth, sheetHeight);
    glassPrice = calculateGlassPrice(artworkWidth, artworkHeight, matWidth, glassPricePerUnitedInch);
    
    // Update wholesale price for glass if requested
    if (wholesalePrices) {
      const outerWidth = artworkWidth + (matWidth * 2);
      const outerHeight = artworkHeight + (matWidth * 2);
      const unitedInches = outerWidth + outerHeight;
      const wholesaleCost = unitedInches * glassPricePerUnitedInch;
      wholesalePrices.glass = wholesaleCost.toFixed(2);
    }
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