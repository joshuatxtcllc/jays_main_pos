
import { getLarsonJuhlWholesalePrice } from './larsonJuhlWholesalePricing';

/**
 * Larson-Juhl Order Optimization Service
 * 
 * Helps determine the most cost-effective way to purchase frame moulding
 * by comparing length pricing (with waste) vs chop pricing (exact footage)
 */

export interface OrderOptimization {
  itemNumber: string;
  footageNeeded: number;
  lengthOption: {
    sticksNeeded: number;
    totalFootage: number;
    wasteFootage: number;
    costPerFoot: number;
    totalCost: number;
    description: string;
  };
  chopOption: {
    footageNeeded: number;
    costPerFoot: number;
    totalCost: number;
    description: string;
  };
  mixedOption?: {
    fullSticks: number;
    chopFootage: number;
    totalCost: number;
    description: string;
  };
  recommendation: {
    method: 'length' | 'chop' | 'mixed';
    savings: number;
    reason: string;
    alert?: string;
  };
}

// Standard stick length for Larson-Juhl moulding
const STANDARD_STICK_LENGTH = 9.5; // feet

/**
 * Calculate the most cost-effective ordering method for frame moulding
 */
export function optimizeLarsonOrder(itemNumber: string, footageNeeded: number): OrderOptimization | null {
  const priceData = getLarsonJuhlWholesalePrice(itemNumber);
  
  if (!priceData) {
    return null;
  }

  const lengthPricePerFoot = priceData.basePricePerFoot;
  const chopPricePerFoot = priceData.chopPrice || priceData.basePricePerFoot * 1.5; // Fallback if chop price not available

  // Calculate length option (buying full sticks)
  const sticksNeeded = Math.ceil(footageNeeded / STANDARD_STICK_LENGTH);
  const totalFootage = sticksNeeded * STANDARD_STICK_LENGTH;
  const wasteFootage = totalFootage - footageNeeded;
  const lengthTotalCost = totalFootage * lengthPricePerFoot;

  // Calculate chop option (exact footage)
  const chopTotalCost = footageNeeded * chopPricePerFoot;

  // Calculate mixed option (for cases where it might be beneficial)
  let mixedOption;
  if (footageNeeded > STANDARD_STICK_LENGTH) {
    const fullSticks = Math.floor(footageNeeded / STANDARD_STICK_LENGTH);
    const remainingFootage = footageNeeded - (fullSticks * STANDARD_STICK_LENGTH);
    
    if (remainingFootage > 0) {
      const mixedCost = (fullSticks * STANDARD_STICK_LENGTH * lengthPricePerFoot) + 
                        (remainingFootage * chopPricePerFoot);
      
      mixedOption = {
        fullSticks,
        chopFootage: remainingFootage,
        totalCost: mixedCost,
        description: `${fullSticks} full stick(s) + ${remainingFootage.toFixed(1)}' chopped`
      };
    }
  }

  // Determine best option
  const options = [
    { method: 'length' as const, cost: lengthTotalCost },
    { method: 'chop' as const, cost: chopTotalCost },
    ...(mixedOption ? [{ method: 'mixed' as const, cost: mixedOption.totalCost }] : [])
  ];

  const bestOption = options.reduce((best, current) => 
    current.cost < best.cost ? current : best
  );

  const worstOption = options.reduce((worst, current) => 
    current.cost > worst.cost ? current : worst
  );

  const savings = worstOption.cost - bestOption.cost;

  // Generate recommendation and alerts
  let reason = '';
  let alert: string | undefined;

  if (bestOption.method === 'length') {
    reason = `Full sticks are cheaper despite ${wasteFootage.toFixed(1)}' waste`;
  } else if (bestOption.method === 'chop') {
    reason = 'Chop pricing saves money by avoiding waste';
  } else {
    reason = 'Mixed approach optimizes cost by combining full sticks and chopped pieces';
  }

  // Alert for optimal ordering ranges
  if (footageNeeded >= 0 && footageNeeded <= 4) {
    alert = '🎯 OPTIMAL RANGE: 0-4 feet - Consider chop pricing to avoid waste';
  } else if (footageNeeded >= 10 && footageNeeded <= 14) {
    alert = '🎯 OPTIMAL RANGE: 10-14 feet - Mixed ordering may be most cost-effective';
  } else if (footageNeeded > 4 && footageNeeded < 9.5) {
    alert = '📏 Consider: Close to full stick length, evaluate waste vs chop premium';
  }

  return {
    itemNumber,
    footageNeeded,
    lengthOption: {
      sticksNeeded,
      totalFootage,
      wasteFootage,
      costPerFoot: lengthPricePerFoot,
      totalCost: lengthTotalCost,
      description: `${sticksNeeded} stick(s) @ ${STANDARD_STICK_LENGTH}' each`
    },
    chopOption: {
      footageNeeded,
      costPerFoot: chopPricePerFoot,
      totalCost: chopTotalCost,
      description: `${footageNeeded}' chopped to exact length`
    },
    mixedOption,
    recommendation: {
      method: bestOption.method,
      savings,
      reason,
      alert
    }
  };
}

/**
 * Calculate frame perimeter from artwork dimensions and mat width
 */
export function calculateFramePerimeter(artworkWidth: number, artworkHeight: number, matWidth: number): number {
  const frameWidth = artworkWidth + (matWidth * 2);
  const frameHeight = artworkHeight + (matWidth * 2);
  return (frameWidth * 2) + (frameHeight * 2);
}

/**
 * Get ordering optimization for a complete frame job
 */
export function optimizeFrameOrder(
  itemNumber: string, 
  artworkWidth: number, 
  artworkHeight: number, 
  matWidth: number
): OrderOptimization | null {
  const perimeterInches = calculateFramePerimeter(artworkWidth, artworkHeight, matWidth);
  const perimeterFeet = perimeterInches / 12;
  
  return optimizeLarsonOrder(itemNumber, perimeterFeet);
}

/**
 * Batch optimize multiple frame orders
 */
export function batchOptimizeOrders(orders: Array<{
  itemNumber: string;
  artworkWidth: number;
  artworkHeight: number;
  matWidth: number;
  quantity?: number;
}>): Array<OrderOptimization & { quantity: number }> {
  return orders.map(order => {
    const optimization = optimizeFrameOrder(
      order.itemNumber,
      order.artworkWidth,
      order.artworkHeight,
      order.matWidth
    );
    
    return {
      ...optimization!,
      quantity: order.quantity || 1
    };
  }).filter(Boolean);
}

/**
 * Calculate total savings across multiple optimized orders
 */
export function calculateBatchSavings(optimizations: Array<OrderOptimization & { quantity: number }>): {
  totalSavings: number;
  totalOrders: number;
  averageSavingsPerOrder: number;
  alertCount: number;
} {
  const totalSavings = optimizations.reduce((sum, opt) => sum + (opt.recommendation.savings * opt.quantity), 0);
  const totalOrders = optimizations.reduce((sum, opt) => sum + opt.quantity, 0);
  const alertCount = optimizations.filter(opt => opt.recommendation.alert).length;
  
  return {
    totalSavings,
    totalOrders,
    averageSavingsPerOrder: totalSavings / totalOrders,
    alertCount
  };
}
