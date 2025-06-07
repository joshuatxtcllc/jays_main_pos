
import { Router } from 'express';
import { uploadXmlPriceSheet, getXmlFormats } from '../controllers/xmlPriceSheetController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Upload XML price sheet
router.post('/upload', uploadXmlPriceSheet);

// Get supported XML formats
router.get('/formats', getXmlFormats);

export default router;
