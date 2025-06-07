
import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getAllOrderGroups,
  createOrderGroup
} from '../controllers/ordersController';

const router = Router();

// Order routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.patch('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

// Order group routes
router.get('/order-groups', getAllOrderGroups);
router.post('/order-groups', createOrderGroup);

export default router;
