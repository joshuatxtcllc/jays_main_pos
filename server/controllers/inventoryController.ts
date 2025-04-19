import { Request, Response } from "express";
import { storage } from "../storage";
import { 
  insertInventoryItemSchema, 
  insertSupplierSchema, 
  insertInventoryLocationSchema,
  insertPurchaseOrderSchema,
  insertInventoryTransactionSchema
} from "@shared/schema";
import { validateBody, validateParams, validateQuery } from "../middleware/validation";

// Inventory Items controllers
export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    const items = await storage.getAllInventoryItems();
    res.json(items);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({ error: "Failed to fetch inventory items" });
  }
};

export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await storage.getInventoryItem(parseInt(id));
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error(`Error fetching inventory item with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
};

export const createInventoryItem = [
  validateBody(insertInventoryItemSchema),
  async (req: Request, res: Response) => {
    try {
      const newItem = await storage.createInventoryItem(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ error: "Failed to create inventory item" });
    }
  }
];

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedItem = await storage.updateInventoryItem(parseInt(id), req.body);
    if (!updatedItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    console.error(`Error updating inventory item with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteInventoryItem(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting inventory item with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
};

export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const items = await storage.getLowStockItems();
    res.json(items);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({ error: "Failed to fetch low stock items" });
  }
};

// Suppliers controllers
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await storage.getAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await storage.getSupplier(parseInt(id));
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    console.error(`Error fetching supplier with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch supplier" });
  }
};

export const createSupplier = [
  validateBody(insertSupplierSchema),
  async (req: Request, res: Response) => {
    try {
      const newSupplier = await storage.createSupplier(req.body);
      res.status(201).json(newSupplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ error: "Failed to create supplier" });
    }
  }
];

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedSupplier = await storage.updateSupplier(parseInt(id), req.body);
    if (!updatedSupplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(updatedSupplier);
  } catch (error) {
    console.error(`Error updating supplier with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update supplier" });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteSupplier(parseInt(id));
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting supplier with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
};

// Inventory Locations controllers
export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const locations = await storage.getAllInventoryLocations();
    res.json(locations);
  } catch (error) {
    console.error("Error fetching inventory locations:", error);
    res.status(500).json({ error: "Failed to fetch inventory locations" });
  }
};

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const location = await storage.getInventoryLocation(parseInt(id));
    if (!location) {
      return res.status(404).json({ error: "Inventory location not found" });
    }
    res.json(location);
  } catch (error) {
    console.error(`Error fetching inventory location with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch inventory location" });
  }
};

export const createLocation = [
  validateBody(insertInventoryLocationSchema),
  async (req: Request, res: Response) => {
    try {
      const newLocation = await storage.createInventoryLocation(req.body);
      res.status(201).json(newLocation);
    } catch (error) {
      console.error("Error creating inventory location:", error);
      res.status(500).json({ error: "Failed to create inventory location" });
    }
  }
];

// Purchase Order controllers
export const getAllPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const purchaseOrders = await storage.getAllPurchaseOrders();
    res.json(purchaseOrders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
};

export const getPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await storage.getPurchaseOrder(parseInt(id));
    if (!purchaseOrder) {
      return res.status(404).json({ error: "Purchase order not found" });
    }
    res.json(purchaseOrder);
  } catch (error) {
    console.error(`Error fetching purchase order with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch purchase order" });
  }
};

export const createPurchaseOrder = [
  validateBody(insertPurchaseOrderSchema),
  async (req: Request, res: Response) => {
    try {
      // Extract purchase order and lines from request
      const { lines, ...purchaseOrderData } = req.body;
      
      // Create purchase order and its lines
      const newPurchaseOrder = await storage.createPurchaseOrderWithLines(purchaseOrderData, lines);
      res.status(201).json(newPurchaseOrder);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  }
];

// Inventory Transactions controller
export const createInventoryTransaction = [
  validateBody(insertInventoryTransactionSchema),
  async (req: Request, res: Response) => {
    try {
      const newTransaction = await storage.createInventoryTransaction(req.body);
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      res.status(500).json({ error: "Failed to create inventory transaction" });
    }
  }
];

// Barcode lookup
export const lookupItemByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;
    const item = await storage.getInventoryItemByBarcode(barcode);
    if (!item) {
      return res.status(404).json({ error: "No item found with this barcode" });
    }
    res.json(item);
  } catch (error) {
    console.error(`Error looking up item with barcode ${req.params.barcode}:`, error);
    res.status(500).json({ error: "Failed to lookup item by barcode" });
  }
};

// Inventory valuation
export const getInventoryValuation = async (req: Request, res: Response) => {
  try {
    const valuation = await storage.getInventoryValuation();
    res.json(valuation);
  } catch (error) {
    console.error("Error calculating inventory valuation:", error);
    res.status(500).json({ error: "Failed to calculate inventory valuation" });
  }
};

// Generate recommended purchase orders
export const generateRecommendedPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const recommendations = await storage.generateRecommendedPurchaseOrders();
    res.json(recommendations);
  } catch (error) {
    console.error("Error generating recommended purchase orders:", error);
    res.status(500).json({ error: "Failed to generate recommended purchase orders" });
  }
};

// CSV Import/Export
export const importInventoryFromCSV = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file provided" });
    }
    
    const result = await storage.importInventoryFromCSV(req.file.path);
    res.json(result);
  } catch (error) {
    console.error("Error importing inventory from CSV:", error);
    res.status(500).json({ error: "Failed to import inventory from CSV" });
  }
};

export const exportInventoryToCSV = async (req: Request, res: Response) => {
  try {
    const csvData = await storage.exportInventoryToCSV();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.csv');
    res.send(csvData);
  } catch (error) {
    console.error("Error exporting inventory to CSV:", error);
    res.status(500).json({ error: "Failed to export inventory to CSV" });
  }
};