
/**
 * Automated Pricing Monitor Script
 * 
 * This script runs periodically to check pricing alignment with industry standards
 * and generates reports for review.
 */

import { pricingMonitorService } from '../server/services/pricingMonitorService.js';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('🚀 Starting automated pricing monitoring...');
    
    // Run the monitoring check
    const result = await pricingMonitorService.monitorAndAdjustPricing();
    
    // Generate detailed report
    const report = await pricingMonitorService.generatePricingReport();
    
    // Save report to file
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportsDir, `pricing-report-${timestamp}.md`);
    
    fs.writeFileSync(reportPath, report);
    console.log(`📊 Report saved to: ${reportPath}`);
    
    // Log summary to console
    console.log('\n' + '='.repeat(50));
    console.log('PRICING MONITORING SUMMARY');
    console.log('='.repeat(50));
    console.log(result.summary);
    
    if (result.adjustmentsNeeded) {
      console.log('\n⚠️ ATTENTION REQUIRED:');
      console.log(`${result.recommendations.length} pricing adjustments recommended`);
      console.log('Please review the generated report for details.');
      
      // Exit with code 1 to indicate action needed
      process.exit(1);
    } else {
      console.log('\n✅ All pricing is within acceptable ranges');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Error during pricing monitoring:', error);
    process.exit(1);
  }
}

main();
