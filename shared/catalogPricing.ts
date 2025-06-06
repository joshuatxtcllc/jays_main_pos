/**
 * Catalog-based Pricing Calculator
 * 
 * This module handles calculating wholesale prices per united inch from catalog data
 * for glass and mat materials, as specified by the pricing methodology.
 */

import { calculatePricePerUnitedInch } from './pricingUtils';

/**
 * Glass catalog data structure
 */
interface GlassCatalogEntry {
  type: string;
  boxPrice: number;
  sheetsPerBox: number;
  sheetWidth: number;
  sheetHeight: number;
  pricePerUnitedInch?: number;
}

/**
 * Mat catalog data structure
 */
interface MatCatalogEntry {
  brand: string;
  collection: string;
  boxPrice: number;
  sheetsPerBox: number;
  sheetWidth: number;
  sheetHeight: number;
  pricePerUnitedInch?: number;
}

/**
 * Sample glass catalog data from Larson-Juhl
 * These would be populated from actual catalog lookups
 */
export const glassCatalog: GlassCatalogEntry[] = [
  {
    type: 'Regular Glass',
    boxPrice: 85.00,
    sheetsPerBox: 25,
    sheetWidth: 32,
    sheetHeight: 40,
    pricePerUnitedInch: calculatePricePerUnitedInch(85.00, 25, 32, 40)
  },
  {
    type: 'Conservation Glass',
    boxPrice: 195.00,
    sheetsPerBox: 20,
    sheetWidth: 32,
    sheetHeight: 40,
    pricePerUnitedInch: calculatePricePerUnitedInch(195.00, 20, 32, 40)
  },
  {
    type: 'Museum Glass',
    boxPrice: 485.00,
    sheetsPerBox: 15,
    sheetWidth: 32,
    sheetHeight: 40,
    pricePerUnitedInch: calculatePricePerUnitedInch(485.00, 15, 32, 40)
  }
];

/**
 * Sample mat catalog data from Crescent
 * These would be populated from actual catalog lookups
 */
export const matCatalog: MatCatalogEntry[] = [
  {
    brand: 'Crescent',
    collection: 'Select Matboard',
    boxPrice: 125.00,
    sheetsPerBox: 20,
    sheetWidth: 32,
    sheetHeight: 40,
    pricePerUnitedInch: calculatePricePerUnitedInch(125.00, 20, 32, 40)
  },
  {
    brand: 'Crescent',
    collection: 'RagMat',
    boxPrice: 185.00,
    sheetsPerBox: 15,
    sheetWidth: 32,
    sheetHeight: 40,
    pricePerUnitedInch: calculatePricePerUnitedInch(185.00, 15, 32, 40)
  },
  {
    brand: 'Crescent',
    collection: 'Suede Mat',
    boxPrice: 245.00,
    sheetsPerBox: 12,
    sheetWidth: 32,
    sheetHeight: 40,
    pricePerUnitedInch: calculatePricePerUnitedInch(245.00, 12, 32, 40)
  }
];

/**
 * Get wholesale price per united inch for glass type
 */
export function getGlassPricePerUnitedInch(glassType: string): number {
  const entry = glassCatalog.find(g => g.type.toLowerCase().includes(glassType.toLowerCase()));
  return entry?.pricePerUnitedInch || 0.10; // fallback price
}

/**
 * Get wholesale price per united inch for mat type
 */
export function getMatPricePerUnitedInch(matCollection: string): number {
  const entry = matCatalog.find(m => m.collection.toLowerCase().includes(matCollection.toLowerCase()));
  return entry?.pricePerUnitedInch || 0.087; // fallback price
}

/**
 * Example calculation showing the methodology
 */
export function exampleCatalogCalculation() {
  // Example: Museum Glass from Larson-Juhl catalog
  const boxPrice = 485.00;
  const sheetsPerBox = 15;
  const sheetWidth = 32; // inches
  const sheetHeight = 40; // inches
  
  // Step 1: Calculate price per sheet
  const pricePerSheet = boxPrice / sheetsPerBox; // $32.33 per sheet
  
  // Step 2: Calculate united inches per sheet
  const unitedInchesPerSheet = sheetWidth + sheetHeight; // 72 united inches
  
  // Step 3: Calculate price per united inch
  const pricePerUnitedInch = pricePerSheet / unitedInchesPerSheet; // $0.449 per united inch
  
  return {
    description: 'Museum Glass Pricing Calculation',
    boxPrice: `$${boxPrice.toFixed(2)}`,
    sheetsPerBox: sheetsPerBox,
    sheetDimensions: `${sheetWidth}" x ${sheetHeight}"`,
    pricePerSheet: `$${pricePerSheet.toFixed(2)}`,
    unitedInchesPerSheet: unitedInchesPerSheet,
    pricePerUnitedInch: `$${pricePerUnitedInch.toFixed(3)}`
  };
}

/**
 * Calculate job cost using catalog pricing
 */
export function calculateJobCostFromCatalog(
  width: number,
  height: number,
  matWidth: number,
  glassType: string,
  matType: string
) {
  // Calculate finished dimensions
  const finishedWidth = width + (matWidth * 2);
  const finishedHeight = height + (matWidth * 2);
  const unitedInches = finishedWidth + finishedHeight;
  
  // Get wholesale prices from catalog
  const glassPricePerUI = getGlassPricePerUnitedInch(glassType);
  const matPricePerUI = getMatPricePerUnitedInch(matType);
  
  // Calculate wholesale costs
  const glassWholesaleCost = unitedInches * glassPricePerUI;
  const matWholesaleCost = unitedInches * matPricePerUI;
  
  return {
    dimensions: width + 'x' + height + ' with ' + matWidth + ' mat',
    finishedSize: finishedWidth + 'x' + finishedHeight,
    unitedInches: unitedInches,
    glassPricePerUI: '$' + glassPricePerUI.toFixed(3),
    matPricePerUI: '$' + matPricePerUI.toFixed(3),
    glassWholesaleCost: '$' + glassWholesaleCost.toFixed(2),
    matWholesaleCost: '$' + matWholesaleCost.toFixed(2)
  };
}