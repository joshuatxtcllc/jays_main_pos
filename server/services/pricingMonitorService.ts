
/**
 * Pricing Monitor Service
 * 
 * Automatically monitors and adjusts pricing to align with industry standards
 */

import { db } from '../db';
import { calculateFramingPrice } from './pricingService';
import { vendorCatalogService } from './vendorCatalogService';

interface IndustryBenchmark {
  frameSize: string;
  frameType: 'basic' | 'museum' | 'premium';
  minPrice: number;
  maxPrice: number;
  targetPrice: number;
  lastUpdated: Date;
}

interface PricingAdjustment {
  component: 'frame' | 'glass' | 'mat' | 'labor';
  currentFactor: number;
  recommendedFactor: number;
  adjustment: number;
  reason: string;
}

export class PricingMonitorService {
  private industryBenchmarks: IndustryBenchmark[] = [
    {
      frameSize: '16x20',
      frameType: 'basic',
      minPrice: 175,
      maxPrice: 250,
      targetPrice: 212,
      lastUpdated: new Date()
    },
    {
      frameSize: '16x20',
      frameType: 'museum',
      minPrice: 325,
      maxPrice: 450,
      targetPrice: 387,
      lastUpdated: new Date()
    },
    {
      frameSize: '11x14',
      frameType: 'basic',
      minPrice: 125,
      maxPrice: 180,
      targetPrice: 152,
      lastUpdated: new Date()
    },
    {
      frameSize: '11x14',
      frameType: 'museum',
      minPrice: 225,
      maxPrice: 325,
      targetPrice: 275,
      lastUpdated: new Date()
    },
    {
      frameSize: '24x36',
      frameType: 'basic',
      minPrice: 285,
      maxPrice: 425,
      targetPrice: 355,
      lastUpdated: new Date()
    },
    {
      frameSize: '24x36',
      frameType: 'museum',
      minPrice: 485,
      maxPrice: 725,
      targetPrice: 605,
      lastUpdated: new Date()
    }
  ];

  /**
   * Main monitoring function - runs periodically
   */
  async monitorAndAdjustPricing(): Promise<{
    adjustmentsNeeded: boolean;
    recommendations: PricingAdjustment[];
    currentPrices: any[];
    summary: string;
  }> {
    console.log('🔍 Starting automated pricing alignment check...');
    
    const currentPrices = await this.getCurrentPricing();
    const recommendations = await this.analyzeAgainstBenchmarks(currentPrices);
    
    const adjustmentsNeeded = recommendations.length > 0;
    
    if (adjustmentsNeeded) {
      console.log(`⚠️ Found ${recommendations.length} pricing adjustments needed`);
      await this.logPricingAlert(recommendations);
    } else {
      console.log('✅ Pricing is aligned with industry standards');
    }

    return {
      adjustmentsNeeded,
      recommendations,
      currentPrices,
      summary: this.generateSummary(recommendations)
    };
  }

  /**
   * Get current pricing for benchmark comparisons
   */
  private async getCurrentPricing(): Promise<any[]> {
    const testScenarios = [
      // 16x20 Basic Custom Frame
      {
        scenario: '16x20 Basic',
        frameId: 'larson-210286', // Larson Academie White
        matColorId: 'crescent-white-conservation',
        glassOptionId: 'conservation-clear',
        artworkWidth: 16,
        artworkHeight: 20,
        matWidth: 2,
        quantity: 1
      },
      // 16x20 Museum Quality
      {
        scenario: '16x20 Museum',
        frameId: 'larson-350715', // Larson Biltmore Walnut
        matColorId: 'crescent-museum-white',
        glassOptionId: 'museum-glass',
        artworkWidth: 16,
        artworkHeight: 20,
        matWidth: 2,
        quantity: 1
      },
      // 11x14 Basic
      {
        scenario: '11x14 Basic',
        frameId: 'larson-210286',
        matColorId: 'crescent-white-conservation',
        glassOptionId: 'conservation-clear',
        artworkWidth: 11,
        artworkHeight: 14,
        matWidth: 2,
        quantity: 1
      },
      // 11x14 Museum
      {
        scenario: '11x14 Museum',
        frameId: 'larson-350715',
        matColorId: 'crescent-museum-white',
        glassOptionId: 'museum-glass',
        artworkWidth: 11,
        artworkHeight: 14,
        matWidth: 2,
        quantity: 1
      }
    ];

    const currentPrices = [];

    for (const scenario of testScenarios) {
      try {
        const pricing = await calculateFramingPrice(scenario);
        currentPrices.push({
          ...scenario,
          totalPrice: pricing.totalPrice,
          breakdown: {
            frame: pricing.framePrice,
            mat: pricing.matPrice,
            glass: pricing.glassPrice,
            labor: pricing.laborCost
          }
        });
      } catch (error) {
        console.error(`Error calculating price for ${scenario.scenario}:`, error);
      }
    }

    return currentPrices;
  }

  /**
   * Analyze current pricing against industry benchmarks
   */
  private async analyzeAgainstBenchmarks(currentPrices: any[]): Promise<PricingAdjustment[]> {
    const recommendations: PricingAdjustment[] = [];

    for (const price of currentPrices) {
      const benchmark = this.findMatchingBenchmark(price.scenario);
      
      if (benchmark) {
        const deviation = this.calculateDeviation(price.totalPrice, benchmark);
        
        if (Math.abs(deviation) > 0.15) { // 15% threshold
          const adjustment = this.calculateRequiredAdjustment(price, benchmark, deviation);
          if (adjustment) {
            recommendations.push(adjustment);
          }
        }
      }
    }

    return recommendations;
  }

  /**
   * Find matching benchmark for a pricing scenario
   */
  private findMatchingBenchmark(scenario: string): IndustryBenchmark | null {
    const scenarioMap: { [key: string]: { size: string, type: 'basic' | 'museum' } } = {
      '16x20 Basic': { size: '16x20', type: 'basic' },
      '16x20 Museum': { size: '16x20', type: 'museum' },
      '11x14 Basic': { size: '11x14', type: 'basic' },
      '11x14 Museum': { size: '11x14', type: 'museum' }
    };

    const mapping = scenarioMap[scenario];
    if (!mapping) return null;

    return this.industryBenchmarks.find(b => 
      b.frameSize === mapping.size && b.frameType === mapping.type
    ) || null;
  }

  /**
   * Calculate price deviation from benchmark
   */
  private calculateDeviation(currentPrice: number, benchmark: IndustryBenchmark): number {
    return (currentPrice - benchmark.targetPrice) / benchmark.targetPrice;
  }

  /**
   * Calculate required adjustment to align with benchmarks
   */
  private calculateRequiredAdjustment(
    price: any, 
    benchmark: IndustryBenchmark, 
    deviation: number
  ): PricingAdjustment | null {
    const targetAdjustment = benchmark.targetPrice / price.totalPrice;
    
    // Determine which component needs the most adjustment
    let component: 'frame' | 'glass' | 'mat' | 'labor' = 'frame';
    let reason = '';

    if (deviation > 0.15) {
      reason = `Price ${Math.round(Math.abs(deviation) * 100)}% above industry target of $${benchmark.targetPrice}`;
      component = 'frame'; // Usually the largest component
    } else if (deviation < -0.15) {
      reason = `Price ${Math.round(Math.abs(deviation) * 100)}% below industry target of $${benchmark.targetPrice}`;
      component = 'frame';
    }

    return {
      component,
      currentFactor: 1.0,
      recommendedFactor: targetAdjustment,
      adjustment: targetAdjustment - 1.0,
      reason
    };
  }

  /**
   * Log pricing alerts for review
   */
  private async logPricingAlert(recommendations: PricingAdjustment[]): Promise<void> {
    const alertData = {
      timestamp: new Date().toISOString(),
      type: 'PRICING_ADJUSTMENT_NEEDED',
      recommendations,
      severity: recommendations.length > 3 ? 'HIGH' : 'MEDIUM'
    };

    console.log('📊 Pricing Alert:', JSON.stringify(alertData, null, 2));
    
    // In a production environment, you might:
    // - Send email notifications
    // - Log to a monitoring system
    // - Create database records
    // - Send Slack/Teams notifications
  }

  /**
   * Generate summary of recommendations
   */
  private generateSummary(recommendations: PricingAdjustment[]): string {
    if (recommendations.length === 0) {
      return '✅ All pricing is within industry standards (±15% tolerance)';
    }

    const adjustmentCount = recommendations.length;
    const avgAdjustment = recommendations.reduce((sum, r) => sum + Math.abs(r.adjustment), 0) / adjustmentCount;
    
    return `⚠️ ${adjustmentCount} pricing adjustments recommended. Average adjustment: ${Math.round(avgAdjustment * 100)}%`;
  }

  /**
   * Update industry benchmarks (could be called from external data sources)
   */
  async updateIndustryBenchmarks(newBenchmarks: Partial<IndustryBenchmark>[]): Promise<void> {
    for (const newBenchmark of newBenchmarks) {
      const existing = this.industryBenchmarks.find(b => 
        b.frameSize === newBenchmark.frameSize && b.frameType === newBenchmark.frameType
      );

      if (existing && newBenchmark.targetPrice) {
        existing.targetPrice = newBenchmark.targetPrice;
        existing.minPrice = newBenchmark.minPrice || existing.minPrice;
        existing.maxPrice = newBenchmark.maxPrice || existing.maxPrice;
        existing.lastUpdated = new Date();
      }
    }

    console.log('📈 Industry benchmarks updated');
  }

  /**
   * Generate pricing adjustment report
   */
  async generatePricingReport(): Promise<string> {
    const result = await this.monitorAndAdjustPricing();
    
    let report = `
# Automated Pricing Alignment Report
Generated: ${new Date().toISOString()}

## Summary
${result.summary}

## Current Pricing Analysis
`;

    for (const price of result.currentPrices) {
      const benchmark = this.findMatchingBenchmark(price.scenario);
      if (benchmark) {
        const deviation = this.calculateDeviation(price.totalPrice, benchmark);
        const status = Math.abs(deviation) <= 0.15 ? '✅' : '⚠️';
        
        report += `
### ${price.scenario}
${status} Current: $${price.totalPrice.toFixed(2)} | Target: $${benchmark.targetPrice} | Deviation: ${Math.round(deviation * 100)}%
- Frame: $${price.breakdown.frame.toFixed(2)}
- Mat: $${price.breakdown.mat.toFixed(2)}
- Glass: $${price.breakdown.glass.toFixed(2)}
- Labor: $${price.breakdown.labor.toFixed(2)}
`;
      }
    }

    if (result.recommendations.length > 0) {
      report += `
## Recommended Adjustments
`;
      for (const rec of result.recommendations) {
        report += `
- **${rec.component.toUpperCase()}**: Adjust factor by ${Math.round(rec.adjustment * 100)}%
  - Reason: ${rec.reason}
`;
      }
    }

    return report;
  }
}

export const pricingMonitorService = new PricingMonitorService();
