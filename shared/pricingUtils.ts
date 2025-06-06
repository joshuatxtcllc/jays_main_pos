/**
 * Shared Pricing Utilities
 * 
 * Implements the correct dollar-based sliding scale markup structure:
 * - $0.00-$1.99: 4.0x markup
 * - $2.00-$3.99: 3.5x markup  
 * - $4.00-$5.99: 3.2x markup
 * - $6.00-$9.99: 3.0x markup
 * - $10.00-$14.99: 2.8x markup
 * - $15.00-$24.99: 2.6x markup
 * - $25.00-$39.99: 2.4x markup
 * - $40.00+: 2.2x markup
 */

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
 * Calculate mat pricing using dollar-based markup
 * @param width Artwork width in inches
 * @param height Artwork height in inches
 * @param matWidth Mat width in inches
 * @param pricePerSquareInch Wholesale price per square inch
 * @returns Retail price
 */
export function calculateMatPrice(width: number, height: number, matWidth: number, pricePerSquareInch: number): number {
  // Calculate outer dimensions with mat
  const outerWidth = width + (matWidth * 2);
  const outerHeight = height + (matWidth * 2);
  
  // Calculate mat area (outer area minus artwork area)
  const matArea = (outerWidth * outerHeight) - (width * height);
  
  // Calculate wholesale cost
  const wholesaleCost = matArea * pricePerSquareInch;
  
  // Apply dollar-based markup
  const markupFactor = calculateMarkupFactor(wholesaleCost);
  
  return wholesaleCost * markupFactor;
}

/**
 * Calculate glass pricing using dollar-based markup
 * @param width Artwork width in inches
 * @param height Artwork height in inches
 * @param matWidth Mat width in inches
 * @param pricePerSquareInch Wholesale price per square inch
 * @returns Retail price
 */
export function calculateGlassPrice(width: number, height: number, matWidth: number, pricePerSquareInch: number): number {
  // Calculate glass dimensions (artwork + mat)
  const glassWidth = width + (matWidth * 2);
  const glassHeight = height + (matWidth * 2);
  
  // Calculate glass area
  const glassArea = glassWidth * glassHeight;
  
  // Calculate wholesale cost
  const wholesaleCost = glassArea * pricePerSquareInch;
  
  // Apply dollar-based markup
  const markupFactor = calculateMarkupFactor(wholesaleCost);
  
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
    dimensions: `${width}x${height} with ${matWidth}" mat`,
    framePrice: `$${framePrice.toFixed(2)}`,
    matPrice: `$${matPrice.toFixed(2)}`,
    glassPrice: `$${glassPrice.toFixed(2)}`,
    backingPrice: `$${backingPrice.toFixed(2)}`,
    total: `$${total.toFixed(2)}`
  };
}