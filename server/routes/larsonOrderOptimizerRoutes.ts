
import { Router } from 'express';
import { 
  optimizeByFootage, 
  optimizeFrameOrder, 
  batchOptimize, 
  getOptimizationAnalysis 
} from '../controllers/larsonOrderOptimizerController';

const router = Router();

// Optimize by raw footage
router.post('/optimize/footage', optimizeByFootage);

// Optimize frame order by dimensions
router.post('/optimize/frame', optimizeFrameOrder);

// Batch optimize multiple orders
router.post('/optimize/batch', batchOptimize);

// Get analysis across footage ranges for an item
router.get('/analyze/:itemNumber', getOptimizationAnalysis);

export default router;
