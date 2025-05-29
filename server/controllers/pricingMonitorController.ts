
import { Request, Response } from 'express';
import { pricingMonitorService } from '../services/pricingMonitorService';

export class PricingMonitorController {
  /**
   * Get current pricing alignment status
   */
  async getPricingStatus(req: Request, res: Response) {
    try {
      const result = await pricingMonitorService.monitorAndAdjustPricing();
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting pricing status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get pricing status'
      });
    }
  }

  /**
   * Generate pricing alignment report
   */
  async generateReport(req: Request, res: Response) {
    try {
      const report = await pricingMonitorService.generatePricingReport();
      
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="pricing-report.md"');
      res.send(report);
    } catch (error) {
      console.error('Error generating pricing report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate pricing report'
      });
    }
  }

  /**
   * Update industry benchmarks
   */
  async updateBenchmarks(req: Request, res: Response) {
    try {
      const { benchmarks } = req.body;
      
      if (!benchmarks || !Array.isArray(benchmarks)) {
        return res.status(400).json({
          success: false,
          error: 'Benchmarks array is required'
        });
      }

      await pricingMonitorService.updateIndustryBenchmarks(benchmarks);
      
      res.json({
        success: true,
        message: 'Industry benchmarks updated successfully'
      });
    } catch (error) {
      console.error('Error updating benchmarks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update benchmarks'
      });
    }
  }

  /**
   * Manual pricing check trigger
   */
  async triggerCheck(req: Request, res: Response) {
    try {
      console.log('🔍 Manual pricing check triggered');
      
      const result = await pricingMonitorService.monitorAndAdjustPricing();
      
      res.json({
        success: true,
        data: result,
        message: 'Pricing check completed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error during manual pricing check:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete pricing check'
      });
    }
  }
}

export const pricingMonitorController = new PricingMonitorController();
