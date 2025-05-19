import { Router } from 'express';
import { artLocationController } from '../controllers/artLocationController';

const router = Router();

// Routes for art location functionality
router.post('/api/art-locations', artLocationController.sendArtLocationData);
router.get('/api/art-locations/:orderId', artLocationController.getArtLocationData);

export default router;