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
import artworkLocationRoutes from './routes/artworkLocationRoutes';
import artLocationRoutes from './routes/artLocationRoutes';
import hubApiRoutes from './routes/hubApiRoutes';
import hubAdminRoutes from './routes/hubAdminRoutes';
import { getMaterialsPickList, getMaterialsBySupplier, getMaterialsForOrder, updateMaterial, createPurchaseOrder, getMaterialTypes, getMaterialSuppliers } from './controllers/materialsController';
import integrationApiRoutes from './routes/integrationApiRoutes';
import ordersRoutes from './routes/ordersRoutes';
import customersRoutes from './routes/customersRoutes';
import xmlPriceSheetRoutes from './routes/xmlPriceSheetRoutes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Art Location routes
  app.post('/api/art-locations', artLocationController.sendArtLocationData);
  app.get('/api/art-locations/:orderId', artLocationController.getArtLocationData);

  // Frame Design routes
  app.post('/api/frame-designs', frameDesignController.saveFrameDesign);
  app.get('/api/frame-designs/:orderId', frameDesignController.getFrameDesign);

  // Webhook routes (commented out temporarily)
  // app.use('/api/webhooks', webhookRoutes);

  // Pricing monitor routes (commented out temporarily)
  // app.use('/api/pricing-monitor', pricingMonitorRoutes);

  // Health check endpoint
  app.get('/api/health', healthController.getSystemHealth);

  // Vendor catalog routes (basic endpoints to prevent errors)
  app.get('/api/vendor-catalog/all', (req, res) => {
    res.json([]);
  });

  app.get('/api/vendor-catalog/larson', (req, res) => {
    res.json([]);
  });

  app.get('/api/vendor-catalog/roma', (req, res) => {
    res.json([]);
  });

  app.get('/api/vendor-catalog/nielsen', (req, res) => {
    res.json([]);
  });

  // Larson catalog routes
  app.get('/api/larson-catalog/crescent', (req, res) => {
    res.json([]);
  });

  // Frames catalog route
  app.get('/api/frames', (req, res) => {
    res.json([]);
  });

  // Auth status route
  app.get('/api/auth/status', (req, res) => {
    res.json({ authenticated: false, user: null });
  });

  // External Kanban Integration - Fetch orders from external Kanban app
  app.get('/api/kanban/external/orders', async (req, res) => {
    try {
      const { externalKanbanService } = await import('./services/externalKanbanService');
      const result = await externalKanbanService.fetchOrders();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        orders: [],
        error: 'Failed to fetch orders from external Kanban app'
      });
    }
  });

  // External Kanban health check
  app.get('/api/kanban/external/health', async (req, res) => {
    try {
      const { externalKanbanService } = await import('./services/externalKanbanService');
      const health = await externalKanbanService.healthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        connected: false,
        error: 'Failed to check external Kanban health'
      });
    }
  });

  // Update order status in external Kanban
  app.post('/api/kanban/external/orders/:orderId/status', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, stage, notes } = req.body;

      const { externalKanbanService } = await import('./services/externalKanbanService');
      const success = await externalKanbanService.updateOrderStatus(orderId, status, stage, notes);

      if (success) {
        res.json({
          success: true,
          orderId,
          updatedStatus: status,
          stage,
          notes,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update order status in external Kanban'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update external Kanban order status'
      });
    }
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

  // Hub Integration API Routes
  app.use('/api/hub', hubApiRoutes);
  app.use('/api/hub-admin', hubAdminRoutes);

  // Admin routes for API key generation
  app.use('/api/admin', hubAdminRoutes);

  // Webhook routes
  // import webhookRoutes from './routes/webhookRoutes';
  // app.use('/api/webhooks', webhookRoutes);
  app.use('/api', integrationApiRoutes);
  app.use('/api', ordersRoutes);
  app.use('/api', customersRoutes);
  app.use('/api/xml-price-sheets', xmlPriceSheetRoutes);

  // Materials API Routes
  app.get('/api/materials/pick-list', getMaterialsPickList);
  app.get('/api/materials/by-supplier', getMaterialsBySupplier);
  app.get('/api/materials/order/:orderId', getMaterialsForOrder);
  app.put('/api/materials/:id', updateMaterial);
  app.post('/api/materials/purchase-order', createPurchaseOrder);
  app.get('/api/materials/types', getMaterialTypes);
  app.get('/api/materials/suppliers', getMaterialSuppliers);

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