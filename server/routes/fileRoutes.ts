
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
import { Router } from 'express';
import { upload, uploadOrderArtwork, uploadOrderFile, getOrderFiles, deleteOrderFile } from '../controllers/fileController';

const router = Router();

// Upload artwork for an order
router.post('/orders/:orderId/artwork', upload.single('artwork'), uploadOrderArtwork);

// Upload additional files for an order
router.post('/orders/:orderId/files', upload.single('file'), uploadOrderFile);

// Get all files for an order
router.get('/orders/:orderId/files', getOrderFiles);

// Delete a file
router.delete('/files/:fileId', deleteOrderFile);

export default router;
