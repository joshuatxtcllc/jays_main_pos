import { Router } from 'express';
import { vendorApiService } from '../services/vendorApiService';

const router = Router();

/**
 * @route GET /api/vendor-api/frames
 * @desc Get all frames from all vendor catalogs
 */
router.get('/frames', async (req, res) => {
  try {
    const frames = await vendorApiService.fetchAllCatalogs();
    res.json(frames);
  } catch (error) {
    console.error('Error fetching vendor frames:', error);
    res.status(500).json({ 
      message: 'Error fetching vendor frames', 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/vendor-api/frames/:vendor
 * @desc Get frames from a specific vendor catalog
 */
router.get('/frames/:vendor', async (req, res) => {
  try {
    const { vendor } = req.params;
    let frames;
    
    switch (vendor.toLowerCase()) {
      case 'larson':
        frames = await vendorApiService.fetchLarsonCatalog();
        break;
      case 'roma':
        frames = await vendorApiService.fetchRomaCatalog();
        break;
      case 'bella':
        frames = await vendorApiService.fetchBellaCatalog();
        break;
      default:
        return res.status(400).json({ message: 'Invalid vendor specified' });
    }
    
    res.json(frames);
  } catch (error) {
    console.error(`Error fetching ${req.params.vendor} frames:`, error);
    res.status(500).json({ 
      message: `Error fetching ${req.params.vendor} frames`, 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/vendor-api/search
 * @desc Search frames across all vendor catalogs
 */
router.get('/search', async (req, res) => {
  try {
    const { query, vendor } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const frames = await vendorApiService.searchFrames(
      query as string, 
      vendor as string | undefined
    );
    
    res.json(frames);
  } catch (error) {
    console.error('Error searching frames:', error);
    res.status(500).json({ 
      message: 'Error searching frames', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/vendor-api/sync
 * @desc Sync all vendor catalogs to database
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await vendorApiService.syncCatalogsToDatabase();
    res.json({ 
      message: 'Frame database sync completed successfully',
      added: result.added,
      updated: result.updated
    });
  } catch (error) {
    console.error('Error syncing catalog to database:', error);
    res.status(500).json({ 
      message: 'Error syncing catalog to database', 
      error: error.message 
    });
  }
});

export default router;