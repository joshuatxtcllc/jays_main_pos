
import { Router } from 'express';
import {
  uploadArtworkImage,
  getArtworkImage,
  getOrderFilesList,
  uploadOrderFile,
  saveFramePreview
} from '../controllers/fileController';

const router = Router();

// Artwork image routes
router.post('/orders/:orderId/artwork', uploadArtworkImage);
router.get('/orders/:orderId/artwork', getArtworkImage);

// Frame preview routes
router.post('/orders/:orderId/preview', saveFramePreview);

// General file management routes
router.get('/orders/:orderId/files', getOrderFilesList);
router.post('/orders/:orderId/files', uploadOrderFile);

export default router;
