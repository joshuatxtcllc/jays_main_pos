
import { Router } from 'express';
import {
  getMaterialsPickList,
  getMaterialsBySupplier,
  getMaterialsForOrder,
  updateMaterial,
  createPurchaseOrder,
  getMaterialTypes,
  getMaterialSuppliers
} from '../controllers/materialsController';

const router = Router();

// Get materials pick list
router.get('/pick-list', getMaterialsPickList);

// Get materials grouped by supplier
router.get('/by-supplier', getMaterialsBySupplier);

// Get materials for specific order
router.get('/by-order/:orderId', getMaterialsForOrder);

// Update material
router.patch('/:id', updateMaterial);

// Create purchase order from materials
router.post('/purchase-orders', createPurchaseOrder);

// Get material types
router.get('/types', getMaterialTypes);

// Get material suppliers
router.get('/suppliers', getMaterialSuppliers);

export default router;
