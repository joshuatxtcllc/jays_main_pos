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

  // Apply sliding scale based on size - adjust markup factors based on united inches
  let markupFactor = 6.0; // Standard retail markup for custom framing is 5-6x

  if (unitedInches > 40) {
    markupFactor = 5.8;
  }
  if (unitedInches > 60) {
    markupFactor = 5.5;
  }
  if (unitedInches > 80) {
    markupFactor = 5.2;
  }
  if (unitedInches > 100) {
    markupFactor = 5.0;
  }

  // Calculate the wholesale price: perimeter in feet * base price per foot
  const wholesalePrice = perimeterFeet * basePrice;

  // Apply retail markup to get final price
  return wholesalePrice * markupFactor;
}

// Calculate mat price based on dimensions and base price
export function calculateMatPrice(width: number, height: number, matWidth: number, basePrice: number): number {
  // Calculate outer dimensions with mat
  const outerWidth = width + (matWidth * 2);
  const outerHeight = height + (matWidth * 2);

  // Calculate united inches (outer width + outer height)
  const unitedInches = outerWidth + outerHeight;

  // Calculate mat area in square inches
  const matArea = (outerWidth * outerHeight) - (width * height);

  // Apply sliding scale markup based on united inches
  let markupFactor = 5.0; // Standard retail markup for matboard

  if (unitedInches > 40) {
    markupFactor = 4.8;
  }
  if (unitedInches > 60) {
    markupFactor = 4.5;
  }
  if (unitedInches > 80) {
    markupFactor = 4.2;
  }
  if (unitedInches > 100) {
    markupFactor = 4.0;
  }

  // Calculate wholesale cost: mat area * base price per square inch
  const wholesaleCost = matArea * (basePrice / 100);

  // Apply retail markup
  return wholesaleCost * markupFactor;
}

// Calculate glass price based on dimensions and base price
export function calculateGlassPrice(width: number, height: number, matWidth: number, basePrice: number): number {
  // Calculate glass dimensions (artwork + mat)
  const glassWidth = width + (matWidth * 2);
  const glassHeight = height + (matWidth * 2);

  // Calculate glass area in square inches
  const glassArea = glassWidth * glassHeight;

  // Calculate united inches
  const unitedInches = glassWidth + glassHeight;

  // Apply sliding scale markup factor based on united inches
  let markupFactor = 6.0; // Standard retail markup for specialty glass

  if (unitedInches > 40) {
    markupFactor = 5.5;
  }
  if (unitedInches > 60) {
    markupFactor = 5.0;
  }
  if (unitedInches > 80) {
    markupFactor = 4.7;
  }
  if (unitedInches > 100) {
    markupFactor = 4.5;
  }

  // Calculate the wholesale price: glass area * base price per square inch
  const wholesaleCost = glassArea * (basePrice / 100);

  // Apply retail markup
  // For Museum Glass (higher end), we need to ensure prices are proportionally high
  // Museum glass can be 2.5-3x more expensive than regular glass at retail
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