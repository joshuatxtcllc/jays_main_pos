
import { Router } from 'express';
import { 
  checkInventoryAcrossVendors, 
  createPurchaseOrderSuggestions 
} from '../services/crossVendorInventoryService';

const router = Router();

/**
 * @route GET /api/inventory/check/:itemNumber
 * @desc Check inventory for a specific item across all vendors
 */
router.get('/check/:itemNumber', async (req, res) => {
  try {
    const { itemNumber } = req.params;
    const { exact } = req.query;
    
    const exactMatch = exact === 'true';
    const results = await checkInventoryAcrossVendors(itemNumber, exactMatch);
    
    res.json(results);
  } catch (error) {
    console.error('Error checking inventory:', error);
    res.status(500).json({ 
      message: 'Error checking inventory', 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/inventory/purchase-order-suggestions
 * @desc Get purchase order suggestions based on items needed
 */
router.post('/purchase-order-suggestions', async (req, res) => {
  try {
    const { items, quantities } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Items must be a non-empty array' 
      });
    }
    
    if (!Array.isArray(quantities) || quantities.length !== items.length) {
      return res.status(400).json({ 
        message: 'Quantities must be an array with the same length as items' 
      });
    }
    
    const suggestions = await createPurchaseOrderSuggestions(items, quantities);
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error creating purchase order suggestions:', error);
    res.status(500).json({ 
      message: 'Error creating purchase order suggestions', 
      error: error.message 
    });
  }
});

export default router;
