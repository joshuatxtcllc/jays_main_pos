import express from 'express';
import { 
  getArtworkLocation, 
  saveArtworkLocation
} from '../controllers/artworkLocationController';

const router = express.Router();

// Get artwork location for an order
router.get('/orders/:orderId/location', getArtworkLocation);

// Save artwork location for an order
router.post('/orders/:orderId/location', saveArtworkLocation);

export default router;