import { Router } from 'express';
import {
  getAllInventoryLocations,
  getInventoryLocationById,
  createInventoryLocation,
  updateInventoryLocation,
  deleteInventoryLocation,
  getAllInventoryItems,
  getLowStockItems,
  getAllSuppliers
} from '../controllers/inventoryController';

const router = Router();

// Inventory location routes
router.get('/inventory/locations', getAllInventoryLocations);
router.get('/inventory/locations/:id', getInventoryLocationById);
router.post('/inventory/locations', createInventoryLocation);
router.put('/inventory/locations/:id', updateInventoryLocation);
router.delete('/inventory/locations/:id', deleteInventoryLocation);

// Inventory item routes
router.get('/inventory/items', getAllInventoryItems);
router.get('/inventory/items/low-stock', getLowStockItems);

// Supplier routes
router.get('/inventory/suppliers', getAllSuppliers);

export default router;