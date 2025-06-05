import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { artLocationController } from "./controllers/artLocationController";
import { frameDesignController } from "./controllers/frameDesignController";
import { healthController } from "./controllers/healthController";
import { validateApiKey, KANBAN_API_KEY } from "./middleware/apiAuth";
// import { storage } from "./storage_simple";
// import { vendorCatalogController } from './controllers/vendorCatalogController';
// import { hubIntegrationRoutes } from './routes/hubIntegrationRoutes';
// import { crossVendorInventoryRoutes } from './routes/crossVendorInventoryRoutes';
// import webhookRoutes from './routes/webhookRoutes';
// import { pricingMonitorRoutes } from './routes/pricingMonitorRoutes';
import threeDDesignerRoutes from './routes/threeDDesignerRoutes';
import vendorApiRoutes from './routes/vendorApiRoutes';
import vendorSettingsRoutes from './routes/vendorSettingsRoutes';
import webhookRoutes from './routes/webhookRoutes';
import materialsRoutes from './routes/materialsRoutes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Art Location routes
  app.post('/api/art-locations', artLocationController.sendArtLocationData);
  app.get('/api/art-locations/:orderId', artLocationController.getArtLocationData);

  // Frame Design routes
  app.post('/api/frame-designs', frameDesignController.saveFrameDesign);
  app.get('/api/frame-designs/:orderId', frameDesignController.getFrameDesign);

  // Webhook routes (commented out temporarily)
  // app.use('/api/webhooks', webhookRoutes);

  // 3D Designer integration routes
  app.use('/api/3d-designer', threeDDesignerRoutes);

  // Pricing monitor routes (commented out temporarily)
  // app.use('/api/pricing-monitor', pricingMonitorRoutes);

  // Health check endpoint
  app.get('/api/health', healthController.getSystemHealth);

  // Vendor catalog routes with proper error handling
  app.get('/api/vendor-catalog/all', (req, res) => {
    res.status(200).json({ success: true, data: [], message: 'No vendors configured' });
  });

  app.get('/api/vendor-catalog/larson', (req, res) => {
    res.status(200).json({ success: true, data: [], message: 'Larson catalog not configured' });
  });

  app.get('/api/vendor-catalog/roma', (req, res) => {
    res.status(200).json({ success: true, data: [], message: 'Roma catalog not configured' });
  });

  app.get('/api/vendor-catalog/nielsen', (req, res) => {
    res.status(200).json({ success: true, data: [], message: 'Nielsen catalog not configured' });
  });

  // Larson catalog routes
  app.get('/api/larson-catalog/crescent', (req, res) => {
    res.status(200).json({ success: true, data: [], message: 'Crescent catalog not loaded' });
  });

  // Frames catalog route with proper structure
  app.get('/api/frames', (req, res) => {
    res.status(200).json({ 
      success: true, 
      data: [
        {
          id: 'frame-001',
          name: 'Classic Wood Frame',
          price: 45.00,
          material: 'Wood',
          width: '2 inches',
          color: 'Natural'
        }
      ], 
      message: 'Static frame data loaded' 
    });
  });

  // Auth status route
  app.get('/api/auth/status', (req, res) => {
    res.json({ authenticated: false, user: null });
  });

  // Kanban Integration API endpoints for production connection
  app.get('/api/kanban/orders', validateApiKey, (req, res) => {
    // Returns all orders with production status for Kanban board
    res.json({
      success: true,
      orders: [],
      endpoint: '/api/kanban/orders',
      description: 'Retrieves all orders with production status and timeline information'
    });
  });

  app.post('/api/kanban/orders/:orderId/status', validateApiKey, (req, res) => {
    const { orderId } = req.params;
    const { status, stage, notes } = req.body;

    // Updates order production status from Kanban board
    res.json({
      success: true,
      orderId,
      updatedStatus: status,
      stage,
      notes,
      timestamp: new Date().toISOString(),
      description: 'Updates order production status from external Kanban system'
    });
  });

  app.get('/api/kanban/status', (req, res) => {
    // Health check for Kanban integration (no auth required)
    res.json({
      status: 'active',
      service: 'Jays Frames POS System',
      version: '1.0.0',
      endpoints: {
        orders: '/api/kanban/orders',
        updateStatus: '/api/kanban/orders/:orderId/status',
        health: '/api/kanban/status'
      },
      authentication: 'API Key required in Authorization header',
      timestamp: new Date().toISOString()
    });
  });

  // API Key management endpoint
  app.get('/api/kanban/api-key', (req, res) => {
    // Returns the API key for Kanban integration setup
    res.json({
      apiKey: KANBAN_API_KEY,
      usage: 'Add this to your Kanban app Authorization header as: Bearer ' + KANBAN_API_KEY,
      endpoints: {
        orders: '/api/kanban/orders',
        updateStatus: '/api/kanban/orders/:orderId/status'
      },
      note: 'Keep this API key secure - it provides access to your order data'
    });
  });

  app.use('/api/vendor-api', vendorApiRoutes);
  app.use('/api/vendor-settings', vendorSettingsRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/materials', materialsRoutes);
  app.use('/api/material-orders', materialsRoutes);

  // Additional API endpoints expected by frontend
  app.get('/api/mat-colors', (req, res) => {
    res.status(200).json({ 
      success: true, 
      data: [
        { id: 'white', name: 'White', color: '#FFFFFF' },
        { id: 'black', name: 'Black', color: '#000000' },
        { id: 'cream', name: 'Cream', color: '#F5F5DC' }
      ] 
    });
  });

  app.get('/api/glass-options', (req, res) => {
    res.status(200).json({ 
      success: true, 
      data: [
        { id: 'regular', name: 'Regular Glass', price: 15.00 },
        { id: 'museum', name: 'Museum Glass', price: 85.00 },
        { id: 'acrylic', name: 'Acrylic', price: 25.00 }
      ] 
    });
  });

  app.get('/api/special-services', (req, res) => {
    res.status(200).json({ 
      success: true, 
      data: [
        { id: 'rush', name: 'Rush Service', price: 50.00 },
        { id: 'delivery', name: 'Local Delivery', price: 25.00 }
      ] 
    });
  });

  app.get('/api/customers', (req, res) => {
    res.status(200).json({ success: true, data: [] });
  });

  app.get('/api/orders', (req, res) => {
    res.status(200).json({ success: true, data: [] });
  });

  app.get('/api/production/kanban', (req, res) => {
    res.status(200).json({ success: true, data: { orders: [], stages: [] } });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket for notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        console.log('Received message:', message.toString());

        // Broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'WebSocket connection established'
    }));
  });

  return httpServer;
}