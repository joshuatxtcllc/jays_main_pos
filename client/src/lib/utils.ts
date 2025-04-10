import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate the price for a custom frame
export function calculateFramePrice(
  frameWidth: number, // inches
  frameHeight: number, // inches
  framePrice: number, // price per foot (wholesale)
  markup: number = 3.5 // standard industry markup
): number {
  // Calculate perimeter in inches
  const perimeter = 2 * (frameWidth + frameHeight);
  
  // Convert to feet (12 inches = 1 foot)
  const perimeterInFeet = perimeter / 12;
  
  // Calculate wholesale cost
  const wholesaleCost = perimeterInFeet * framePrice;
  
  // Apply markup for retail
  let retailPrice = wholesaleCost * markup;
  
  // Reduce price by 2/3 when aligning with frame size as requested
  retailPrice = retailPrice * (1/3); // This reduces the price to 1/3 of original (or by 2/3)
  
  return parseFloat(retailPrice.toFixed(2));
}

// Calculate the price for matting
export function calculateMatPrice(
  frameWidth: number, // inches
  frameHeight: number, // inches
  matWidth: number, // inches
  matPrice: number, // price per square inch (wholesale)
  markup: number = 3 // standard industry markup
): number {
  // Calculate total mat dimensions
  const matOuterWidth = frameWidth + (2 * matWidth);
  const matOuterHeight = frameHeight + (2 * matWidth);
  
  // Calculate mat area in square inches
  const matArea = matOuterWidth * matOuterHeight - (frameWidth * frameHeight);
  
  // Calculate wholesale cost
  const wholesaleCost = matArea * matPrice;
  
  // Apply markup for retail
  const retailPrice = wholesaleCost * markup;
  
  return parseFloat(retailPrice.toFixed(2));
}

// Calculate the price for glass
export function calculateGlassPrice(
  frameWidth: number, // inches
  frameHeight: number, // inches
  matWidth: number, // inches
  glassPrice: number, // price per square inch (wholesale)
  markup: number = 3 // standard industry markup
): number {
  // Calculate total glass dimensions (same as outer mat dimensions)
  const glassWidth = frameWidth + (2 * matWidth);
  const glassHeight = frameHeight + (2 * matWidth);
  
  // Calculate glass area in square inches
  const glassArea = glassWidth * glassHeight;
  
  // Calculate wholesale cost
  const wholesaleCost = glassArea * glassPrice;
  
  // Apply markup for retail
  const retailPrice = wholesaleCost * markup;
  
  return parseFloat(retailPrice.toFixed(2));
}

// Calculate the price for backing
export function calculateBackingPrice(
  frameWidth: number, // inches
  frameHeight: number, // inches
  matWidth: number, // inches
  backingPrice: number = 0.03, // price per square inch (wholesale)
  markup: number = 2.5 // standard industry markup
): number {
  // Calculate total backing dimensions (same as outer mat/glass dimensions)
  const backingWidth = frameWidth + (2 * matWidth);
  const backingHeight = frameHeight + (2 * matWidth);
  
  // Calculate backing area in square inches
  const backingArea = backingWidth * backingHeight;
  
  // Calculate wholesale cost
  const wholesaleCost = backingArea * backingPrice;
  
  // Apply markup for retail
  const retailPrice = wholesaleCost * markup;
  
  return parseFloat(retailPrice.toFixed(2));
}

// Calculate labor price
export function calculateLaborPrice(
  frameWidth: number, // inches
  frameHeight: number, // inches
  baseRate: number = 20, // base labor rate
  sizeMultiplier: number = 0.05 // additional cost per square inch
): number {
  // Calculate frame area in square inches
  const frameArea = frameWidth * frameHeight;
  
  // Calculate labor price based on size
  const laborPrice = baseRate + (frameArea * sizeMultiplier);
  
  return parseFloat(laborPrice.toFixed(2));
}

// Calculate total price
export function calculateTotalPrice(
  framePrice: number,
  matPrice: number,
  glassPrice: number,
  backingPrice: number,
  laborPrice: number,
  specialServicesPrice: number = 0,
  taxRate: number = 0.08
): { subtotal: number, tax: number, total: number } {
  const subtotal = framePrice + matPrice + glassPrice + backingPrice + laborPrice + specialServicesPrice;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}

// Generate a unique ID
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
