/**
 * Pricing Controller
 * 
 * Handles HTTP requests related to price calculations using the wholesalePricingService
 * which applies location-specific markups and labor costs for Houston Heights, Texas.
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import { 
  calculateRetailPrice, 
  updateFrameWithCurrentPrice,
  updateFramesWithCurrentPrices,
  getHoustonHeightsLaborRates
} from '../services/wholesalePricingService';

/**
 * Calculate retail price for a custom framing order
 */
export async function calculatePrice(req: Request, res: Response): Promise<void> {
  try {
    const { 
      frameId, 
      matColorId, 
      glassOptionId, 
      artworkWidth, 
      artworkHeight, 
      matWidth, 
      quantity = 1,
      include_wholesale_prices = false
    } = req.body;
    
    if (!artworkWidth || !artworkHeight) {
      res.status(400).json({ 
        error: 'Missing required dimensions', 
        message: 'Artwork width and height are required' 
      });
      return;
    }
    
    // Convert all dimensions to numbers
    const width = Number(artworkWidth);
    const height = Number(artworkHeight);
    const matBorder = matWidth ? Number(matWidth) : 0;
    const qty = Number(quantity) || 1;
    
    // Fetch frame, mat, and glass details if IDs are provided
    const frame = frameId ? await storage.getFrame(frameId) : null;
    const mat = matColorId ? await storage.getMatColor(matColorId) : null;
    const glass = glassOptionId ? await storage.getGlassOption(glassOptionId) : null;
    
    // Update frame with current wholesale price from vendor API
    const updatedFrame = frame ? await updateFrameWithCurrentPrice(frame) : null;
    
    // Calculate retail price using the wholesale pricing service
    const priceBreakdown = await calculateRetailPrice(
      updatedFrame,
      mat,
      glass,
      width,
      height,
      matBorder,
      qty
    );
    
    // Include wholesale prices if requested (for admin use only)
    const response: any = { ...priceBreakdown };
    
    if (include_wholesale_prices && req.query.admin_key === process.env.ADMIN_API_KEY) {
      response.wholesalePrices = {
        frame: updatedFrame?.price,
        mat: mat?.price,
        glass: glass?.price
      };
      
      response.laborRates = getHoustonHeightsLaborRates();
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ 
      error: 'Failed to calculate price', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Update all frames with current wholesale prices (admin only)
 */
export async function updateFramePrices(req: Request, res: Response): Promise<void> {
  try {
    // Verify admin API key for this sensitive operation
    if (req.query.admin_key !== process.env.ADMIN_API_KEY) {
      res.status(403).json({ 
        error: 'Unauthorized', 
        message: 'Admin API key required for this operation' 
      });
      return;
    }
    
    // Fetch all frames
    const frames = await storage.getAllFrames();
    
    // Update frames with current wholesale prices
    const updatedFrames = await updateFramesWithCurrentPrices(frames);
    
    // Update frames in database (if needed)
    // This would be implemented based on your database update methods
    
    res.json({ 
      success: true, 
      message: `Updated ${updatedFrames.length} frames with current prices`,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating frame prices:', error);
    res.status(500).json({ 
      error: 'Failed to update frame prices', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Get labor rates for Houston Heights location
 */
export function getLaborRates(req: Request, res: Response): void {
  try {
    const laborRates = getHoustonHeightsLaborRates();
    res.json(laborRates);
  } catch (error) {
    console.error('Error fetching labor rates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch labor rates', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}