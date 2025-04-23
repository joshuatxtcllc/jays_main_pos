import { Request, Response } from "express";
import { storage } from "../storage";

// Get all materials for orders in the pick list
export const getMaterialsPickList = async (req: Request, res: Response) => {
  try {
    const materialsList = await storage.getMaterialsPickList();
    res.json(materialsList);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get materials grouped by supplier
export const getMaterialsBySupplier = async (req: Request, res: Response) => {
  try {
    const materialsList = await storage.getMaterialsPickList();
    
    // Group materials by supplier
    const bySupplier = materialsList.reduce((acc, material) => {
      if (!acc[material.supplier]) {
        acc[material.supplier] = [];
      }
      acc[material.supplier].push(material);
      return acc;
    }, {} as Record<string, any[]>);
    
    res.json(bySupplier);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get materials for a specific order
export const getMaterialsForOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const materials = await storage.getMaterialsForOrder(orderId);
    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update material status and notes
export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const materialId = req.params.id;
    const { status, notes, orderDate, receiveDate } = req.body;
    
    // Update material in storage
    const updatedMaterial = await storage.updateMaterialOrder(materialId, {
      status,
      notes,
      orderDate,
      receiveDate
    });
    
    res.json(updatedMaterial);
  } catch (error: any) {
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
    const types = Array.from(new Set(materials.map(m => m.type)));
    res.json(types);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get list of unique suppliers
export const getMaterialSuppliers = async (req: Request, res: Response) => {
  try {
    const materials = await storage.getMaterialsPickList();
    const suppliers = Array.from(new Set(materials.map(m => m.supplier)));
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};