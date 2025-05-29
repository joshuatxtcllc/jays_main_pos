
import { Router } from 'express';
import { pricingMonitorController } from '../controllers/pricingMonitorController';

const router = Router();

// Get current pricing alignment status
router.get('/status', pricingMonitorController.getPricingStatus.bind(pricingMonitorController));

// Generate pricing report
router.get('/report', pricingMonitorController.generateReport.bind(pricingMonitorController));

// Update industry benchmarks
router.post('/benchmarks', pricingMonitorController.updateBenchmarks.bind(pricingMonitorController));

// Manual trigger for pricing check
router.post('/check', pricingMonitorController.triggerCheck.bind(pricingMonitorController));

export { router as pricingMonitorRoutes };
