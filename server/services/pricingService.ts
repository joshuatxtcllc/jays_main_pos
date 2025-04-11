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
  
  // Calculate retail price
  return wholesalePrice * effectivePerimeter * markup;
}

// Mat pricing sliding scale based on united inches
const matSlidingScaleMarkup: {range: [number, number], markup: number}[] = [
  { range: [0, 20], markup: 10 },
  { range: [21, 40], markup: 9 },
  { range: [41, 60], markup: 8 },
  { range: [61, 80], markup: 7 },
  { range: [81, 1000], markup: 6 }
];

/**
 * Calculate matboard price using sliding scale markup based on united inches
 */
export function calculateMatPrice(
  wholesalePrice: number, 
  matArea: number,
  outerUnitedInch: number
): number {
  // Find the appropriate markup based on united inches
  const markupEntry = matSlidingScaleMarkup.find(
    entry => outerUnitedInch >= entry.range[0] && outerUnitedInch <= entry.range[1]
  );
  
  // Default to lowest markup if no match found
  const markup = markupEntry ? markupEntry.markup : 6;
  
  console.log(`Using mat markup ${markup}x for united inches ${outerUnitedInch}`);
  
  if (wholesalePrice < 0.01) {
    // If price is very small (like 0.000025), it's likely a wholesale price per square inch
    return matArea * wholesalePrice * markup;
  } else {
    // For select mats with higher base prices, use a more controlled markup
    // Use 25% of the sliding scale to avoid excessive pricing
    return outerUnitedInch * wholesalePrice * 0.25;
  }
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