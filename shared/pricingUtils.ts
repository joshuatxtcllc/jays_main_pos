/**
 * Shared Pricing Utilities
 * 
 * Frame Pricing: Dollar-based sliding scale markup structure
 * - $0.00-$1.99: 4.0x markup
 * - $2.00-$3.99: 3.5x markup  
 * - $4.00-$5.99: 3.2x markup
 * - $6.00-$9.99: 3.0x markup
 * - $10.00-$14.99: 2.8x markup
 * - $15.00-$24.99: 2.6x markup
 * - $25.00-$39.99: 2.4x markup
 * - $40.00+: 2.2x markup
 * 
 * Glass/Mat Pricing: Size-based markup structure
 * - 5x7 and smaller: 4.0x markup
 * - 8x10: 3.8x markup
 * - 11x14: 3.5x markup
 * - 16x20: 3.2x markup
 * - 18x24: 3.0x markup
 * - 24x30: 2.8x markup
 * - Larger: 2.5x markup
 */

/**
 * Calculate wholesale price per united inch from catalog data
 * @param boxPrice Total price for a box from catalog
 * @param sheetsPerBox Number of sheets (lites) in the box
 * @param sheetWidth Width of each sheet in inches
 * @param sheetHeight Height of each sheet in inches
 * @returns Price per united inch
 */
export function calculatePricePerUnitedInch(
  boxPrice: number, 
  sheetsPerBox: number, 
  sheetWidth: number, 
  sheetHeight: number
): number {
  // Calculate price per sheet
  const pricePerSheet = boxPrice / sheetsPerBox;
  
  // Calculate united inches per sheet
  const unitedInchesPerSheet = sheetWidth + sheetHeight;
  
  // Calculate price per united inch
  return pricePerSheet / unitedInchesPerSheet;
}

/**
 * Calculate markup factor based on wholesale dollar amount
 * @param wholesaleCost The wholesale cost in dollars
 * @returns The markup multiplier
 */
export function calculateMarkupFactor(wholesaleCost: number): number {
  if (wholesaleCost >= 40.00) {
    return 2.2;
  } else if (wholesaleCost >= 25.00) {
    return 2.4;
  } else if (wholesaleCost >= 15.00) {
    return 2.6;
  } else if (wholesaleCost >= 10.00) {
    return 2.8;
  } else if (wholesaleCost >= 6.00) {
    return 3.0;
  } else if (wholesaleCost >= 4.00) {
    return 3.2;
  } else if (wholesaleCost >= 2.00) {
    return 3.5;
  } else {
    return 4.0; // $0-$1.99
  }
}

/**
 * Calculate frame pricing using dollar-based markup
 * @param width Artwork width in inches
 * @param height Artwork height in inches
 * @param matWidth Mat width in inches (added to both sides)
 * @param pricePerFoot Wholesale price per foot
 * @returns Retail price
 */
export function calculateFramePrice(width: number, height: number, matWidth: number, pricePerFoot: number): number {
  // Calculate outer dimensions (includes mat)
  const outerWidth = width + (matWidth * 2);
  const outerHeight = height + (matWidth * 2);
  
  // Calculate united inches
  const unitedInches = outerWidth + outerHeight;
  
  // Convert to feet for pricing
  const perimeterFeet = unitedInches / 12;
  
  // Calculate wholesale cost
  const wholesaleCost = perimeterFeet * pricePerFoot;
  
  // Apply dollar-based markup
  const markupFactor = calculateMarkupFactor(wholesaleCost);
  
  return wholesaleCost * markupFactor;
}

/**
 * Calculate mat pricing using size-based markup structure
 * @param width Artwork width in inches
 * @param height Artwork height in inches
 * @param matWidth Mat width in inches
 * @param pricePerUnitedInch Wholesale price per united inch
 * @returns Retail price
 */
export function calculateMatPrice(width: number, height: number, matWidth: number, pricePerUnitedInch: number): number {
  // Calculate outer dimensions with mat
  const outerWidth = width + (matWidth * 2);
  const outerHeight = height + (matWidth * 2);
  
  // Calculate united inches of finished size
  const unitedInches = outerWidth + outerHeight;
  
  // Calculate wholesale cost
  const wholesaleCost = unitedInches * pricePerUnitedInch;
  
  // Apply size-based markup factor
  let markupFactor = 4.0; // Base markup for small sizes (5x7 and smaller)
  
  if (unitedInches <= 24) { // 5x7 = 24 united inches
    markupFactor = 4.0;
  } else if (unitedInches <= 36) { // 8x10 = 36 united inches
    markupFactor = 3.8;
  } else if (unitedInches <= 50) { // 11x14 = 50 united inches
    markupFactor = 3.5;
  } else if (unitedInches <= 68) { // 16x20 = 68 united inches
    markupFactor = 3.2;
  } else if (unitedInches <= 88) { // 18x24 = 88 united inches
    markupFactor = 3.0;
  } else if (unitedInches <= 108) { // 24x30 = 108 united inches
    markupFactor = 2.8;
  } else { // Larger than 24x30
    markupFactor = 2.5;
  }
  
  return wholesaleCost * markupFactor;
}

/**
 * Calculate glass pricing using size-based markup structure
 * @param width Artwork width in inches
 * @param height Artwork height in inches
 * @param matWidth Mat width in inches
 * @param pricePerUnitedInch Wholesale price per united inch
 * @returns Retail price
 */
export function calculateGlassPrice(width: number, height: number, matWidth: number, pricePerUnitedInch: number): number {
  // Calculate glass dimensions (artwork + mat)
  const glassWidth = width + (matWidth * 2);
  const glassHeight = height + (matWidth * 2);
  
  // Calculate united inches of finished size
  const unitedInches = glassWidth + glassHeight;
  
  // Calculate wholesale cost
  const wholesaleCost = unitedInches * pricePerUnitedInch;
  
  // Apply size-based markup factor (same structure as mats)
  let markupFactor = 4.0; // Base markup for small sizes (5x7 and smaller)
  
  if (unitedInches <= 24) { // 5x7 = 24 united inches
    markupFactor = 4.0;
  } else if (unitedInches <= 36) { // 8x10 = 36 united inches
    markupFactor = 3.8;
  } else if (unitedInches <= 50) { // 11x14 = 50 united inches
    markupFactor = 3.5;
  } else if (unitedInches <= 68) { // 16x20 = 68 united inches
    markupFactor = 3.2;
  } else if (unitedInches <= 88) { // 18x24 = 88 united inches
    markupFactor = 3.0;
  } else if (unitedInches <= 108) { // 24x30 = 108 united inches
    markupFactor = 2.8;
  } else { // Larger than 24x30
    markupFactor = 2.5;
  }
  
  return wholesaleCost * markupFactor;
}

/**
 * Calculate backing pricing using dollar-based markup
 * @param width Artwork width in inches
 * @param height Artwork height in inches
 * @param matWidth Mat width in inches
 * @param pricePerSquareInch Wholesale price per square inch
 * @returns Retail price
 */
export function calculateBackingPrice(width: number, height: number, matWidth: number, pricePerSquareInch: number): number {
  // Calculate backing dimensions (same as glass)
  const backingWidth = width + (matWidth * 2);
  const backingHeight = height + (matWidth * 2);
  
  // Calculate backing area
  const backingArea = backingWidth * backingHeight;
  
  // Calculate wholesale cost
  const wholesaleCost = backingArea * pricePerSquareInch;
  
  // Apply dollar-based markup with minimum charge
  const markupFactor = calculateMarkupFactor(wholesaleCost);
  const retailPrice = wholesaleCost * markupFactor;
  
  // Minimum backing charge of $10
  return Math.max(retailPrice, 10.00);
}

/**
 * Example pricing calculation for a typical frame job
 * 16x20 artwork with 3" mat, using $1.50/ft frame moulding
 */
export function examplePricingCalculation() {
  const width = 16;
  const height = 20;
  const matWidth = 3;
  
  // Example wholesale prices
  const framePricePerFoot = 1.50;
  const matPricePerSqInch = 0.02;
  const glassPricePerSqInch = 0.03;
  const backingPricePerSqInch = 0.01;
  
  const framePrice = calculateFramePrice(width, height, matWidth, framePricePerFoot);
  const matPrice = calculateMatPrice(width, height, matWidth, matPricePerSqInch);
  const glassPrice = calculateGlassPrice(width, height, matWidth, glassPricePerSqInch);
  const backingPrice = calculateBackingPrice(width, height, matWidth, backingPricePerSqInch);
  
  const total = framePrice + matPrice + glassPrice + backingPrice;
  
  return {
    dimensions: `${width}x${height} with ${matWidth}\" mat`,
    framePrice: `$${framePrice.toFixed(2)}`,
    matPrice: `$${matPrice.toFixed(2)}`,
    glassPrice: `$${glassPrice.toFixed(2)}`,
    backingPrice: `$${backingPrice.toFixed(2)}`,
    total: `$${total.toFixed(2)}`
  };
}