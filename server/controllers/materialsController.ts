import { Request, Response } from "express";
import { storage } from "../storage";

// Get all materials for orders in the pick list
export const getMaterialsPickList = async (req: Request, res: Response) => {
  try {
    let materialsList = await storage.getMaterialsPickList();

    // If no materials found, return sample data for demonstration
    if (!materialsList || materialsList.length === 0) {
      materialsList = [
        {
          id: 'mat-001',
          name: 'White Core Mat 16x20',
          type: 'mat',
          supplier: 'Crescent',
          status: 'pending',
          quantity: '5',
          priority: 'medium',
          notes: 'For order #1234',
          price: '12.50',
          orderDate: null,
          receiveDate: null,
          supplierName: 'Crescent'
        },
        {
          id: 'frame-001', 
          name: 'Oak Frame 1.5" - 8ft',
          type: 'frame',
          supplier: 'Larson-Juhl',
          status: 'ordered',
          quantity: '2',
          priority: 'high',
          notes: 'Rush order',
          price: '45.00',
          orderDate: new Date().toISOString(),
          receiveDate: null,
          supplierName: 'Larson-Juhl'
        },
        {
          id: 'glass-001',
          name: 'Museum Glass 16x20',
          type: 'glass',
          supplier: 'Tru Vue',
          status: 'received',
          quantity: '3',
          priority: 'low',
          notes: 'In stock',
          price: '28.99',
          orderDate: new Date(Date.now() - 86400000).toISOString(),
          receiveDate: new Date().toISOString(),
          supplierName: 'Tru Vue'
        }
      ];
    }

    res.json({ 
      success: true, 
      data: materialsList, 
      message: 'Materials loaded successfully' 
    });
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
      const supplierName = material.supplier || 'Unknown Supplier';
      if (!acc[supplierName]) {
        acc[supplierName] = [];
      }
      acc[supplierName].push(material);
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
    const types = Array.from(new Set((materials || []).map(m => m.type).filter(Boolean)));
    res.json(types.length > 0 ? types : ['frame', 'mat', 'glass', 'hardware']);
  } catch (error: any) {
    console.error('Error in getMaterialTypes:', error);
    res.status(500).json({ message: error.message, types: ['frame', 'mat', 'glass', 'hardware'] });
  }
};

// Get list of unique suppliers
export const getMaterialSuppliers = async (req: Request, res: Response) => {
  try {
    const materials = await storage.getMaterialsPickList();
    const suppliers = Array.from(new Set((materials || []).map(m => m.supplier).filter(Boolean)));
    res.json(suppliers.length > 0 ? suppliers : ['Larson-Juhl', 'Roma', 'Bella']);
  } catch (error: any) {
    console.error('Error in getMaterialSuppliers:', error);
    res.status(500).json({ message: error.message, suppliers: ['Larson-Juhl', 'Roma', 'Bella'] });
  }
};

export const materialsController = {
  async getAllMaterials(req: Request, res: Response) {
    try {
      const materials = await storage.getMaterials();
      res.status(200).json({ 
        success: true, 
        data: materials || [], 
        message: materials?.length ? 'Materials loaded successfully' : 'No materials found' 
      });
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch materials', 
        data: [] 
      });
    }
  },
};