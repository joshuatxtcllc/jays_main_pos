
import { Request, Response } from 'express';
import { optimizeLarsonOrder, optimizeFrameOrder, batchOptimizeOrders, calculateBatchSavings } from '../services/larsonOrderOptimizer';

/**
 * Optimize a single Larson-Juhl moulding order by footage
 */
export async function optimizeByFootage(req: Request, res: Response) {
  try {
    const { itemNumber, footageNeeded } = req.body;

    if (!itemNumber || !footageNeeded) {
      return res.status(400).json({
        error: 'Missing required parameters: itemNumber and footageNeeded'
      });
    }

    const optimization = optimizeLarsonOrder(itemNumber, parseFloat(footageNeeded));

    if (!optimization) {
      return res.status(404).json({
        error: 'Item number not found in Larson-Juhl catalog'
      });
    }

    res.json(optimization);
  } catch (error) {
    console.error('Error optimizing Larson order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Optimize a frame order based on artwork dimensions
 */
export async function optimizeFrameOrder(req: Request, res: Response) {
  try {
    const { itemNumber, artworkWidth, artworkHeight, matWidth } = req.body;

    if (!itemNumber || !artworkWidth || !artworkHeight || matWidth === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters: itemNumber, artworkWidth, artworkHeight, matWidth'
      });
    }

    const optimization = optimizeFrameOrder(
      itemNumber,
      parseFloat(artworkWidth),
      parseFloat(artworkHeight),
      parseFloat(matWidth)
    );

    if (!optimization) {
      return res.status(404).json({
        error: 'Item number not found in Larson-Juhl catalog'
      });
    }

    res.json(optimization);
  } catch (error) {
    console.error('Error optimizing frame order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Batch optimize multiple orders
 */
export async function batchOptimize(req: Request, res: Response) {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        error: 'Missing or invalid orders array'
      });
    }

    const optimizations = batchOptimizeOrders(orders);
    const savings = calculateBatchSavings(optimizations);

    res.json({
      optimizations,
      summary: savings
    });
  } catch (error) {
    console.error('Error batch optimizing orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get optimization analysis for a specific item across different footage ranges
 */
export async function getOptimizationAnalysis(req: Request, res: Response) {
  try {
    const { itemNumber } = req.params;
    
    // Analyze across different footage ranges
    const footageRanges = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    const analysis = footageRanges.map(footage => {
      const optimization = optimizeLarsonOrder(itemNumber, footage);
      return {
        footage,
        optimization
      };
    }).filter(item => item.optimization !== null);

    if (analysis.length === 0) {
      return res.status(404).json({
        error: 'Item number not found in Larson-Juhl catalog'
      });
    }

    res.json({
      itemNumber,
      analysis
    });
  } catch (error) {
    console.error('Error generating optimization analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
