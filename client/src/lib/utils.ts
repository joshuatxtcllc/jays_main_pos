import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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
  
  // Base price per square inch
  const basePricePerSqInch = 0.03;
  
  // Apply sliding scale based on size
  let priceFactor = 1.0;
  if (backingArea > 500) {
    priceFactor = 0.9;
  }
  if (backingArea > 1000) {
    priceFactor = 0.85;
  }
  if (backingArea > 1500) {
    priceFactor = 0.8;
  }
  
  return backingArea * basePricePerSqInch * priceFactor;
}

// Calculate frame price based on dimensions and base price
export function calculateFramePrice(width: number, height: number, basePrice: number): number {
  // Calculate united inches (width + height)
  const unitedInches = width + height;
  
  // Calculate frame perimeter in feet
  const perimeterFeet = calculateFramePerimeter(width, height);
  
  // Apply sliding scale based on size
  let priceFactor = 1.0;
  
  if (unitedInches > 40) {
    priceFactor = 0.95;
  }
  if (unitedInches > 60) {
    priceFactor = 0.90;
  }
  if (unitedInches > 80) {
    priceFactor = 0.85;
  }
  if (unitedInches > 100) {
    priceFactor = 0.80;
  }
  
  // Apply 1/6th price reduction as requested by the client
  const reducedPriceFactor = 0.1667;
  
  // Calculate final price: perimeter in feet * base price per foot * price factor * reduction
  return perimeterFeet * basePrice * priceFactor * reducedPriceFactor;
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
  
  // Apply sliding scale based on size
  let priceFactor = 1.0;
  if (unitedInches > 40) {
    priceFactor = 0.95;
  }
  if (unitedInches > 60) {
    priceFactor = 0.90;
  }
  if (unitedInches > 80) {
    priceFactor = 0.85;
  }
  if (unitedInches > 100) {
    priceFactor = 0.80;
  }
  
  // Calculate price: mat area * base price per square inch * price factor
  return matArea * (basePrice / 100) * priceFactor;
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
  
  // Apply sliding scale based on size
  let priceFactor = 1.0;
  if (unitedInches > 40) {
    priceFactor = 0.95;
  }
  if (unitedInches > 60) {
    priceFactor = 0.90;
  }
  if (unitedInches > 80) {
    priceFactor = 0.85;
  }
  if (unitedInches > 100) {
    priceFactor = 0.80;
  }
  
  // Apply 45% price reduction as requested by the client
  const reducedPriceFactor = 0.45;
  
  // Calculate price: glass area * base price per square inch * price factor * reduction
  return glassArea * (basePrice / 100) * priceFactor * reducedPriceFactor;
}

// Calculate labor price based on dimensions
export function calculateLaborPrice(width: number, height: number): number {
  // Calculate united inches (width + height)
  const unitedInches = width + height;
  
  // Base labor rate
  let baseRate = 15;
  
  // Apply sliding scale based on size
  if (unitedInches > 40) {
    baseRate = 20;
  }
  if (unitedInches > 60) {
    baseRate = 25;
  }
  if (unitedInches > 80) {
    baseRate = 30;
  }
  if (unitedInches > 100) {
    baseRate = 35;
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