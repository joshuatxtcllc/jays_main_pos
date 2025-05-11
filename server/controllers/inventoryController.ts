import { Request, Response } from 'express';
import { db } from '../db';
import { inventoryLocations, inventoryItems, suppliers, insertInventoryLocationSchema } from '@shared/schema';
import { eq, lt, and } from 'drizzle-orm';

// Get all inventory locations
export async function getAllInventoryLocations(req: Request, res: Response) {
  try {
    const allLocations = await db.select().from(inventoryLocations);
    return res.status(200).json(allLocations);
  } catch (error) {
    console.error('Error fetching inventory locations:', error);
    return res.status(500).json({ message: 'Error fetching inventory locations', details: error.message });
  }
}

// Get inventory location by ID
export async function getInventoryLocationById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const location = await db.select()
      .from(inventoryLocations)
      .where(eq(inventoryLocations.id, parseInt(id)))
      .limit(1);

    if (location.length === 0) {
      return res.status(404).json({ message: 'Inventory location not found' });
    }

    return res.status(200).json(location[0]);
  } catch (error) {
    console.error('Error fetching inventory location:', error);
    return res.status(500).json({ message: 'Error fetching inventory location', details: error.message });
  }
}

// Create a new inventory location
export async function createInventoryLocation(req: Request, res: Response) {
  try {
    const validatedData = insertInventoryLocationSchema.parse(req.body);

    const [newLocation] = await db.insert(inventoryLocations)
      .values(validatedData)
      .returning();

    return res.status(201).json(newLocation);
  } catch (error) {
    console.error('Error creating inventory location:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid location data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Error creating inventory location', details: error.message });
  }
}

// Update an inventory location
export async function updateInventoryLocation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validatedData = insertInventoryLocationSchema.parse(req.body);

    const [updatedLocation] = await db.update(inventoryLocations)
      .set(validatedData)
      .where(eq(inventoryLocations.id, parseInt(id)))
      .returning();

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Inventory location not found' });
    }

    return res.status(200).json(updatedLocation);
  } catch (error) {
    console.error('Error updating inventory location:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid location data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Error updating inventory location', details: error.message });
  }
}

// Delete an inventory location
export async function deleteInventoryLocation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if there are any items assigned to this location
    const itemsInLocation = await db.select({ count: db.fn.count() })
      .from(inventoryItems)
      .where(eq(inventoryItems.locationId, parseInt(id)));

    if (parseInt(itemsInLocation[0].count as string) > 0) {
      return res.status(400).json({
        message: 'Cannot delete location with assigned items. Move items to another location first.'
      });
    }

    // Delete the location
    const result = await db.delete(inventoryLocations)
      .where(eq(inventoryLocations.id, parseInt(id)))
      .returning({ id: inventoryLocations.id });

    if (result.length === 0) {
      return res.status(404).json({ message: 'Inventory location not found' });
    }

    return res.status(200).json({ message: 'Inventory location deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory location:', error);
    return res.status(500).json({ message: 'Error deleting inventory location', details: error.message });
  }
}

// Get all inventory items
export async function getAllInventoryItems(req: Request, res: Response) {
  try {
    const allItems = await db.select({
      ...inventoryItems,
      locationName: inventoryLocations.name
    })
      .from(inventoryItems)
      .leftJoin(inventoryLocations, eq(inventoryItems.locationId, inventoryLocations.id));

    return res.status(200).json(allItems || []);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return res.status(500).json({ message: 'Error fetching inventory items', details: error.message });
  }
}

// Get low stock inventory items
export async function getLowStockItems(req: Request, res: Response) {
  try {
    const lowStockItems = await db.select({
      ...inventoryItems,
      locationName: inventoryLocations.name
    })
      .from(inventoryItems)
      .leftJoin(inventoryLocations, eq(inventoryItems.locationId, inventoryLocations.id))
      .where(
        and(
          lt(inventoryItems.currentStock, inventoryItems.reorderPoint),
          eq(inventoryItems.active, true)
        )
      );

    return res.status(200).json(lowStockItems || []);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return res.status(500).json({ message: 'Error fetching low stock items', details: error.message });
  }
}

// Get all suppliers
export async function getAllSuppliers(req: Request, res: Response) {
  try {
    const allSuppliers = await db.select().from(suppliers);
    return res.status(200).json(allSuppliers || []);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({ message: 'Error fetching suppliers', details: error.message });
  }
}