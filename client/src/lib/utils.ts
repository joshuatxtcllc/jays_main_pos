import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format dimensions as united inches or square inches as needed
export function formatDimensions(width: number, height: number, format: 'united' | 'square' = 'united'): string {
  if (format === 'united') {
    return `${Math.round(width + height)}"`;
  } else {
    return `${Math.round(width * height)} sq in`;
  }
}

// Calculate frame perimeter in feet (used for pricing)
export function calculateFramePerimeter(width: number, height: number): number {
  // Perimeter in inches
  const perimeterInches = 2 * (width + height);
  // Convert to feet
  return perimeterInches / 12;
}

// Calculate backing price based on dimensions
export function calculateBackingPrice(width: number, height: number, matWidth: number): number {
  // Calculate backing size (artwork size + mat width*2)
  const backingWidth = width + (matWidth * 2);
  const backingHeight = height + (matWidth * 2);
  const backingArea = backingWidth * backingHeight;

  // Base wholesale price per square inch (adjusted to more realistic value)
  // Standard foamcore backing is much less expensive than previously calculated
  const baseWholesalePricePerSqInch = 0.008;

  // Apply sliding scale based on size
  let wholesalePriceFactor = 1.0;
  if (backingArea > 500) {
    wholesalePriceFactor = 0.9;
  }
  if (backingArea > 1000) {
    wholesalePriceFactor = 0.85;
  }
  if (backingArea > 1500) {
    wholesalePriceFactor = 0.8;
  }

  // Calculate wholesale cost
  const wholesaleCost = backingArea * baseWholesalePricePerSqInch * wholesalePriceFactor;

  // Apply retail markup (adjusted to standard framing industry markup)
  const retailMarkup = 3.0;

  // Minimum backing charge
  const minimumBackingCharge = 10.0;

  // Return the greater of the calculated price or minimum charge
  return Math.max(wholesaleCost * retailMarkup, minimumBackingCharge);
}

// Calculate frame price based on dimensions and base price
export function calculateFramePrice(width: number, height: number, basePrice: number): number {
  // Calculate united inches (width + height)
  const unitedInches = width + height;

  // Calculate frame perimeter in feet
  const perimeterFeet = calculateFramePerimeter(width, height);

  // Calculate the wholesale cost: perimeter in feet * base price per foot
  const wholesaleCost = perimeterFeet * basePrice;

  // Apply sliding scale markup based on wholesale dollar amount
  let markupFactor = 4.0; // Base markup for $0-$1.99

  if (wholesaleCost >= 2.00 && wholesaleCost < 4.00) {
    markupFactor = 3.5;
  } else if (wholesaleCost >= 4.00 && wholesaleCost < 6.00) {
    markupFactor = 3.2;
  } else if (wholesaleCost >= 6.00 && wholesaleCost < 10.00) {
    markupFactor = 3.0;
  } else if (wholesaleCost >= 10.00 && wholesaleCost < 15.00) {
    markupFactor = 2.8;
  } else if (wholesaleCost >= 15.00 && wholesaleCost < 25.00) {
    markupFactor = 2.6;
  } else if (wholesaleCost >= 25.00 && wholesaleCost < 40.00) {
    markupFactor = 2.4;
  } else if (wholesaleCost >= 40.00) {
    markupFactor = 2.2;
  }

  // Apply retail markup to get final price
  return wholesaleCost * markupFactor;
}

// Calculate mat price based on dimensions and price per united inch
export function calculateMatPrice(width: number, height: number, matWidth: number, pricePerUnitedInch: number): number {
  // Calculate outer dimensions with mat
  const outerWidth = width + (matWidth * 2);
  const outerHeight = height + (matWidth * 2);

  // Calculate united inches of finished size
  const unitedInches = outerWidth + outerHeight;

  // Calculate wholesale cost: united inches * price per united inch
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

  // Apply retail markup
  return wholesaleCost * markupFactor;
}

// Calculate glass price based on dimensions and base price
export function calculateGlassPrice(width: number, height: number, matWidth: number, basePrice: number): number {
  // Calculate glass dimensions (artwork + mat)
  const glassWidth = width + (matWidth * 2);
  const glassHeight = height + (matWidth * 2);

  // Calculate united inches of finished size
  const unitedInches = glassWidth + glassHeight;

  // Calculate wholesale cost: united inches * price per united inch
  const wholesaleCost = unitedInches * (basePrice / 100);

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

  // Apply premium glass multiplier for museum glass
  if (basePrice >= 0.45) { // Museum glass threshold
    markupFactor *= 1.5; // Increase markup for premium glass
  }

  return wholesaleCost * markupFactor;
}

// Calculate labor price based on dimensions
export function calculateLaborPrice(width: number, height: number): number {
  // Calculate united inches (width + height)
  const unitedInches = width + height;

  // Base labor rate - significantly higher for custom framing
  let baseRate = 50;

  // Apply sliding scale based on size
  if (unitedInches > 40) {
    baseRate = 60;
  }
  if (unitedInches > 60) {
    baseRate = 70;
  }
  if (unitedInches > 80) {
    baseRate = 85;
  }
  if (unitedInches > 100) {
    baseRate = 100;
  }

  return baseRate;
}

// Calculate total price including tax
export function calculateTotalPrice(
  framePrice: number,
  matPrice: number,
  glassPrice: number,
  backingPrice: number,
  laborPrice: number,
  specialServicesPrice: number
): { subtotal: number; tax: number; total: number } {
  // Calculate subtotal
  const subtotal = framePrice + matPrice + glassPrice + backingPrice + laborPrice + specialServicesPrice;

  // Apply tax rate (use 8.25% as standard sales tax unless tax exempt)
  const taxRate = 0.0825;
  const tax = subtotal * taxRate;

  // Calculate total
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

// Generate a simple QR code for an order
export function generateQrCode(orderId: string | number): string {
  // This is a simple implementation - in production, you would use a proper QR code generation library
  // Return a placeholder for now - the actual implementation should be handled by the QR code service
  return `order-${orderId}`;
}