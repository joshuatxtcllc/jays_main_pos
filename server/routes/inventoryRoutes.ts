import express from 'express';
import multer from 'multer';
import * as inventoryController from '../controllers/inventoryController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Inventory Items routes
router.get('/items', inventoryController.getAllInventoryItems);
router.get('/items/low-stock', inventoryController.getLowStockItems);
router.get('/items/:id', inventoryController.getInventoryItemById);
router.post('/items', inventoryController.createInventoryItem);
router.patch('/items/:id', inventoryController.updateInventoryItem);
router.delete('/items/:id', inventoryController.deleteInventoryItem);

// Suppliers routes
router.get('/suppliers', inventoryController.getAllSuppliers);
router.get('/suppliers/:id', inventoryController.getSupplierById);
router.post('/suppliers', inventoryController.createSupplier);
router.patch('/suppliers/:id', inventoryController.updateSupplier);
router.delete('/suppliers/:id', inventoryController.deleteSupplier);

// Locations routes
router.get('/locations', inventoryController.getAllLocations);
router.get('/locations/:id', inventoryController.getLocationById);
router.post('/locations', inventoryController.createLocation);

// Purchase Orders routes
router.get('/purchase-orders', inventoryController.getAllPurchaseOrders);
router.get('/purchase-orders/:id', inventoryController.getPurchaseOrderById);
router.post('/purchase-orders', inventoryController.createPurchaseOrder);

// Inventory Transactions route
router.post('/transactions', inventoryController.createInventoryTransaction);

// Barcode lookup
router.get('/barcode/:barcode', inventoryController.lookupItemByBarcode);

// Inventory valuation
router.get('/valuation', inventoryController.getInventoryValuation);

// Recommended purchase orders
router.get('/recommended-orders', inventoryController.generateRecommendedPurchaseOrders);

// CSV Import/Export
router.post('/import', upload.single('csvFile'), inventoryController.importInventoryFromCSV);
router.get('/export', inventoryController.exportInventoryToCSV);

export default router;