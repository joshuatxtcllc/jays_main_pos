import { Request, Response } from 'express';
import { calculateFramingPrice, FramePricingParams } from '../services/pricingService';

/**
 * Handles the calculation of custom framing prices
 * based on Houston Heights location-specific specifications
 */
export async function calculatePrice(req: Request, res: Response) {
  try {
    // Extract parameters from request body
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

    // Validate required parameters
    if (
      artworkWidth === undefined ||
      artworkHeight === undefined ||
      matWidth === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required parameters. Please provide artworkWidth, artworkHeight, matWidth, and quantity.'
      });
    }

    // Extract frame pricing method if available
    const framePricingMethod = req.body.framePricingMethod || 'chop';
    
    // Create calculation parameters
    const params: FramePricingParams = {
      frameId: frameId || 'none',
      matColorId: matColorId || 'none',
      glassOptionId: glassOptionId || 'none',
      artworkWidth: parseFloat(artworkWidth),
      artworkHeight: parseFloat(artworkHeight),
      matWidth: parseFloat(matWidth),
      quantity: parseInt(quantity),
      includeWholesalePrices: !!include_wholesale_prices,
      framePricingMethod
    };

    // Calculate pricing
    const result = await calculateFramingPrice(params);

    // Return the result
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      error: 'An error occurred while calculating the price',
      message: error.message
    });
  }
}