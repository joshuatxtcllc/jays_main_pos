import { Request, Response } from "express";
import { storage } from "../storage";

// Get all materials for orders in the pick list
export const getMaterialsPickList = async (req: Request, res: Response) => {
  try {
    const materialsList = await storage.getMaterialsPickList();
    res.json(materialsList || []);
  } catch (error: any) {
    console.error('Error in getMaterialsPickList:', error);
    res.status(500).json({ message: error.message, materials: [] });
  }
};

// Get materials grouped by supplier
export const getMaterialsBySupplier = async (req: Request, res: Response) => {
  try {
    const materialsList = await storage.getMaterialsPickList();

    // Group materials by supplier
    const bySupplier = (materialsList || []).reduce((acc, material) => {
      if (!acc[material.supplier]) {
        acc[material.supplier] = [];
      }
      acc[material.supplier].push(material);
      return acc;
    }, {} as Record<string, any[]>);

    res.json(bySupplier);
  } catch (error: any) {
    console.error('Error in getMaterialsBySupplier:', error);
    res.status(500).json({ message: error.message, suppliers: {} });
  }
};

// Get materials for a specific order
export const getMaterialsForOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID", materials: [] });
    }

    const materials = await storage.getMaterialsForOrder(orderId);
    res.json(materials || []);
  } catch (error: any) {
    console.error('Error in getMaterialsForOrder:', error);
    res.status(500).json({ message: error.message, materials: [] });
  }
};

// Update material status and notes
export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const materialId = req.params.id;

    // Handle both formats: direct properties or nested in data property
    let updateData;
    if (req.body.data) {
      // Client is sending { id, data: { status, notes, etc. } }
      updateData = req.body.data;
    } else {
      // Client is sending properties directly
      const { status, notes, orderDate, receiveDate, supplierName } = req.body;
      updateData = {
        status,
        notes,
        orderDate,
        receiveDate,
        supplierName
      };
    }

    // Filter out undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    console.log('Updating material order with data:', cleanedData);

    // Update material in storage
    const updatedMaterial = await storage.updateMaterialOrder(materialId, cleanedData);

    res.json(updatedMaterial);
  } catch (error: any) {
    console.error('Error updating material:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a purchase order from materials
export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { materialIds } = req.body;

    if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({ message: "No materials selected" });
    }

    // Create a purchase order in storage
    const purchaseOrder = await storage.createPurchaseOrder(materialIds);

    res.status(201).json(purchaseOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get list of unique material types
export const getMaterialTypes = async (req: Request, res: Response) => {
  try {
    const materials = await storage.getMaterialsPickList();
    const types = Array.from(new Set((materials || []).map(m => m.type)));
    res.json(types);
  } catch (error: any) {
    console.error('Error in getMaterialTypes:', error);
    res.status(500).json({ message: error.message, types: [] });
  }
};

// Get list of unique suppliers
export const getMaterialSuppliers = async (req: Request, res: Response) => {
  try {
    const materials = await storage.getMaterialsPickList();
    const suppliers = Array.from(new Set((materials || []).map(m => m.supplier)));
    res.json(suppliers);
  } catch (error: any) {
    console.error('Error in getMaterialSuppliers:', error);
    res.status(500).json({ message: error.message, suppliers: [] });
  }
};