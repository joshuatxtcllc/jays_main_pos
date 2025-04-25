/**
 * Pricing Controller
 * 
 * This controller handles pricing-related routes and calculations with
 * Houston Heights specific pricing and vendor API integration.
 */

import { Request, Response } from 'express';
import { db } from '../db';
import { frames, matColors, glassOptions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { 
  calculateRetailPrice,
  getHoustonHeightsLaborRates,
  updateWholesalePrices
} from '../services/wholesalePricingService';

/**
 * Get all available frames for pricing calculator
 */
export async function getAllFrames(req: Request, res: Response) {
  try {
    const allFrames = await db.select().from(frames);
    res.json(allFrames);
  } catch (error) {
    console.error('Error fetching frames:', error);
    res.status(500).json({ message: 'Failed to fetch frames' });
  }
}

/**
 * Get all available mat colors for pricing calculator
 */
export async function getAllMatColors(req: Request, res: Response) {
  try {
    const allMatColors = await db.select().from(matColors);
    res.json(allMatColors);
  } catch (error) {
    console.error('Error fetching mat colors:', error);
    res.status(500).json({ message: 'Failed to fetch mat colors' });
  }
}

/**
 * Get all available glass options for pricing calculator
 */
export async function getAllGlassOptions(req: Request, res: Response) {
  try {
    const allGlassOptions = await db.select().from(glassOptions);
    res.json(allGlassOptions);
  } catch (error) {
    console.error('Error fetching glass options:', error);
    res.status(500).json({ message: 'Failed to fetch glass options' });
  }
}

/**
 * Get Houston Heights specific labor rates
 */
export function getLaborRates(req: Request, res: Response) {
  try {
    const laborRates = getHoustonHeightsLaborRates();
    res.json(laborRates);
  } catch (error) {
    console.error('Error fetching labor rates:', error);
    res.status(500).json({ message: 'Failed to fetch labor rates' });
  }
}

/**
 * Calculate retail price for custom framing with Houston Heights specific pricing
 */
export async function calculatePrice(req: Request, res: Response) {
  try {
    const {
      frameId,
      matColorId,
      glassOptionId,
      artworkWidth,
      artworkHeight,
      matWidth,
      quantity,
      include_wholesale_prices
    } = req.body;
    
    // Validate inputs
    if (!artworkWidth || !artworkHeight) {
      return res.status(400).json({ message: 'Artwork dimensions are required' });
    }
    
    if (artworkWidth <= 0 || artworkHeight <= 0) {
      return res.status(400).json({ message: 'Artwork dimensions must be positive' });
    }
    
    if (matWidth < 0) {
      return res.status(400).json({ message: 'Mat width cannot be negative' });
    }
    
    // Get frame info if frameId is provided
    let frame = null;
    if (frameId) {
      const [frameResult] = await db.select().from(frames).where(eq(frames.id, frameId));
      frame = frameResult;
    }
    
    // Calculate price using the wholesale pricing service
    const pricingResult = await calculateRetailPrice(
      frameId,
      matColorId,
      glassOptionId,
      artworkWidth,
      artworkHeight,
      matWidth,
      quantity,
      include_wholesale_prices
    );
    
    res.json(pricingResult);
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ message: 'Failed to calculate price' });
  }
}

/**
 * Update wholesale prices from vendor APIs (admin only)
 */
export async function updateWholesalePricesFromVendor(req: Request, res: Response) {
  try {
    // Check admin API key (simple implementation for demo)
    const adminKey = req.query.admin_key;
    if (!adminKey || adminKey !== 'houston-heights-admin') {
      return res.status(403).json({ message: 'Invalid admin API key' });
    }
    
    // Update prices from vendor API
    const result = await updateWholesalePrices();
    res.json(result);
  } catch (error) {
    console.error('Error updating wholesale prices:', error);
    res.status(500).json({ message: 'Failed to update wholesale prices' });
  }
}