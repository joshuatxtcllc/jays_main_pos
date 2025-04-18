/**
 * Inventory Routes
 * 
 * This file defines all the API routes for the inventory management system.
 */

import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController';

const router = Router();

// Inventory Items routes
router.get('/items', inventoryController.getInventoryItems);
router.get('/items/:id', inventoryController.getInventoryItem);
router.post('/items', inventoryController.createInventoryItem);
router.patch('/items/:id', inventoryController.updateInventoryItem);
router.delete('/items/:id', inventoryController.deleteInventoryItem);

// Stock Management routes
router.post('/stock/:id', inventoryController.updateStockLevel);
router.post('/stock/transfer/:id', inventoryController.transferStock);

// Inventory Transactions routes
router.get('/transactions', inventoryController.getInventoryTransactions);

// Vendor Management routes
router.get('/vendors', inventoryController.getVendors);
router.get('/vendors/:id', inventoryController.getVendor);
router.post('/vendors', inventoryController.createVendor);
router.patch('/vendors/:id', inventoryController.updateVendor);
router.delete('/vendors/:id', inventoryController.deleteVendor);

// Purchase Order routes
router.get('/purchase-orders', inventoryController.getPurchaseOrders);
router.get('/purchase-orders/:id', inventoryController.getPurchaseOrder);
router.post('/purchase-orders', inventoryController.createPurchaseOrder);
router.patch('/purchase-orders/:id', inventoryController.updatePurchaseOrder);
router.patch('/purchase-orders/items/:id', inventoryController.updatePurchaseOrderItem);
router.delete('/purchase-orders/:id', inventoryController.deletePurchaseOrder);

// Report routes
router.get('/low-stock', inventoryController.getLowStockAlerts);
router.get('/reorder-report', inventoryController.getReorderReport);
router.get('/valuation', inventoryController.getInventoryValuation);
router.get('/activity', inventoryController.getInventoryActivity);
router.post('/purchase-orders/auto-generate', inventoryController.createAutomaticPurchaseOrders);

export default router;