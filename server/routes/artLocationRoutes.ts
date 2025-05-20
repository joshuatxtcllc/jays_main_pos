import { Express } from 'express';
import { artLocationController } from '../controllers/artLocationController';

export function registerArtLocationRoutes(app: Express) {
  // Routes for art location functionality
  app.post('/api/art-locations', artLocationController.sendArtLocationData);
  app.get('/api/art-locations/:orderId', artLocationController.getArtLocationData);
}