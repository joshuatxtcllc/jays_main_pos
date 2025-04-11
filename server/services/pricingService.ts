/**
 * Pricing Service
 * 
 * This service handles the calculation of prices based on industry-standard
 * sliding scale markup calculations.
 */

interface MarkupRange {
  minValue: number;
  maxValue: number;
  minFoot: number;
  markup: number;
  discount: number;
}

// Frame molding markup chart based on wholesale price per foot
const frameMoldingMarkupChart: MarkupRange[] = [
  { minValue: 0.00, maxValue: 0.99, minFoot: 4, markup: 4.6, discount: 0 },
  { minValue: 1.00, maxValue: 1.49, minFoot: 4, markup: 4.4, discount: 0 },
  { minValue: 1.50, maxValue: 1.99, minFoot: 4, markup: 4.3, discount: 0 },
  { minValue: 2.00, maxValue: 2.99, minFoot: 4, markup: 4.1, discount: 0 },
  { minValue: 3.00, maxValue: 3.99, minFoot: 4, markup: 3.9, discount: 0 },
  { minValue: 4.00, maxValue: 4.99, minFoot: 4, markup: 3.8, discount: 0 },
  { minValue: 5.00, maxValue: 6.99, minFoot: 4, markup: 3.6, discount: 0 },
  { minValue: 7.00, maxValue: 8.99, minFoot: 4, markup: 3.4, discount: 0 },
  { minValue: 9.00, maxValue: 9.99, minFoot: 4, markup: 3.2, discount: 0 },
  { minValue: 10.00, maxValue: 9999.99, minFoot: 4, markup: 3.1, discount: 0 }
];

/**
 * Determines the appropriate markup based on the wholesale price per foot
 * @param pricePerFoot The wholesale price per foot
 * @returns The markup factor to apply
 */
export function getFrameMarkup(pricePerFoot: number): number {
  // Find the appropriate markup range
  const range = frameMoldingMarkupChart.find(
    range => pricePerFoot >= range.minValue && pricePerFoot <= range.maxValue
  );
  
  // Default to the highest range if no match (shouldn't happen with proper ranges)
  return range ? range.markup : 3.1;
}

/**
 * Calculate retail frame price based on wholesale price and measurements
 * @param wholesalePrice Wholesale price per foot
 * @param perimeter Perimeter in feet
 * @returns Retail price
 */
export function calculateFramePrice(wholesalePrice: number, perimeter: number): number {
  const markup = getFrameMarkup(wholesalePrice);
  console.log(`Using frame markup ${markup}x for wholesale price $${wholesalePrice}/ft`);
  
  // Get the minimum foot charge or actual perimeter, whichever is greater
  const minFoot = 4; // All entries in our chart use 4 minimum feet
  const effectivePerimeter = Math.max(minFoot, perimeter);
  
  // Calculate retail price, but applying a 1/3 reduction factor as requested
  const basePrice = wholesalePrice * effectivePerimeter * markup;
  const reducedPrice = basePrice / 3;
  
  console.log(`Frame price calculation: $${wholesalePrice}/ft × ${effectivePerimeter}ft × ${markup} markup = $${basePrice}, reduced to 1/3: $${reducedPrice}`);
  
  return reducedPrice;
}

// Mat pricing based on united inches and size brackets
// For matboard pricing, we calculate a base price per sq inch, then use a size-based sliding scale
const matPricingTable: {
  sizeRange: [number, number],   // United inch range [min, max]
  priceMultiplier: number,       // Multiplier for the base price per sq inch
  minimumCharge: number          // Minimum charge for this size range
}[] = [
  { sizeRange: [0, 20], priceMultiplier: 2.5, minimumCharge: 25 },
  { sizeRange: [21, 40], priceMultiplier: 2.3, minimumCharge: 30 },
  { sizeRange: [41, 60], priceMultiplier: 2.0, minimumCharge: 35 },
  { sizeRange: [61, 80], priceMultiplier: 1.8, minimumCharge: 40 },
  { sizeRange: [81, 1000], priceMultiplier: 1.5, minimumCharge: 45 }
];

/**
 * Calculate matboard price using size-based pricing and minimums
 * Industry standard practice is to have a minimum charge that increases with size
 * plus a per-square-inch charge that decreases with size
 */
export function calculateMatPrice(
  wholesalePrice: number, 
  matArea: number,
  outerUnitedInch: number
): number {
  // Find the appropriate pricing bracket
  const priceBracket = matPricingTable.find(
    bracket => outerUnitedInch >= bracket.sizeRange[0] && outerUnitedInch <= bracket.sizeRange[1]
  );
  
  // Use the lowest bracket if no match is found
  const { priceMultiplier, minimumCharge } = priceBracket || 
    { priceMultiplier: 1.5, minimumCharge: 45 };
  
  // The mat pricing calculation seems to be using a very high base price
  // Let's use the correct units: wholesale price is likely per square foot, needs conversion to per square inch
  // 1 square foot = 144 square inches
  const wholesalePricePerSqInch = wholesalePrice / 144;
  
  // Calculate the price based on area and adjusted wholesale price
  const calculatedPrice = wholesalePricePerSqInch * matArea * priceMultiplier * 6;
  
  // Log the calculation for debugging
  console.log(`Mat pricing: ${outerUnitedInch}" united inches, ${matArea} sq inches`);
  console.log(`Adjusted wholesale price: $${wholesalePrice} per sq ft = $${wholesalePricePerSqInch.toFixed(6)} per sq inch`);
  console.log(`Base price: $${wholesalePricePerSqInch.toFixed(6)}/sq inch * ${matArea} sq inches * ${priceMultiplier}x multiplier * 6 = $${calculatedPrice.toFixed(2)}`);
  console.log(`Minimum charge for this size: $${minimumCharge}`);
  
  // Return the greater of calculated price or minimum charge
  const finalPrice = Math.max(calculatedPrice, minimumCharge);
  console.log(`Final mat price: $${finalPrice.toFixed(2)}`);
  
  return finalPrice;
}

/**
 * Calculate glass price
 * For now using a simple markup factor until we get the sliding scale
 */
export function calculateGlassPrice(
  wholesalePrice: number,
  glassArea: number
): number {
  // For now, use fixed 45% reduction as requested previously
  return glassArea * wholesalePrice * 3 * 0.45;
}