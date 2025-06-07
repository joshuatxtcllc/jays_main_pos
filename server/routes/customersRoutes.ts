
import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer
} from '../controllers/customersController';

const router = Router();

// Customer routes
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById);
router.post('/customers', createCustomer);

export default router;
