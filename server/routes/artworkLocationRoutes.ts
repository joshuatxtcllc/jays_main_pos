
import express from 'express';
import multer from 'multer';
import { 
  getArtworkLocation, 
  saveArtworkLocation, 
  getArtworkLocationImage 
} from '../controllers/artworkLocationController';

const router = express.Router();

// Set up multer for file uploads (store in memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Get artwork location for an order
router.get('/orders/:orderId/location', getArtworkLocation);

// Save artwork location for an order
router.post('/orders/:orderId/location', upload.single('image'), saveArtworkLocation);

// Get artwork location image
router.get('/orders/:orderId/location/image', getArtworkLocationImage);

export default router;
