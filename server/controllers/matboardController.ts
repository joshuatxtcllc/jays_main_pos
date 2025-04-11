import { Request, Response } from 'express';
import { db } from '../db';
import { larsonJuhlCatalog, matColors } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { importCrescentSelectMats } from '../services/crescentSelectService';

/**
 * Fetches all matboards from the Larson Juhl catalog
 */
export async function getAllLarsonMatboards(req: Request, res: Response) {
  try {
    const matboards = await db.select().from(larsonJuhlCatalog);
    return res.status(200).json(matboards);
  } catch (error) {
    console.error('Error fetching matboards:', error);
    return res.status(500).json({ error: 'Failed to fetch matboards' });
  }
}

/**
 * Fetches Crescent matboards from the Larson Juhl catalog
 */
export async function getCrescentMatboards(req: Request, res: Response) {
  try {
    const matboards = await db.select()
      .from(larsonJuhlCatalog)
      .where(eq(larsonJuhlCatalog.manufacturer, 'Crescent'));
    
    return res.status(200).json(matboards);
  } catch (error) {
    console.error('Error fetching Crescent matboards:', error);
    return res.status(500).json({ error: 'Failed to fetch Crescent matboards' });
  }
}

/**
 * Synchronizes matboards from the Larson Juhl catalog to the mat_colors table
 * This ensures that the matboards available in the catalog can be used in orders
 */
export async function syncMatboardsToMatColors(req: Request, res: Response) {
  try {
    console.log('Syncing matboards from Larson Juhl catalog to mat_colors table');
    
    // Get all matboards from the Larson Juhl catalog
    const catalogMatboards = await db.select().from(larsonJuhlCatalog);
    console.log(`Found ${catalogMatboards.length} matboards in the Larson Juhl catalog`);
    
    // Get existing mat_colors to avoid duplicates
    const existingMatColors = await db.select().from(matColors);
    const existingIds = new Set(existingMatColors.map(mc => mc.id));
    console.log(`Found ${existingMatColors.length} existing mat colors`);
    
    // Filter out matboards that already exist in mat_colors
    const newMatboards = catalogMatboards.filter(mb => !existingIds.has(mb.id));
    console.log(`Found ${newMatboards.length} new matboards to sync`);
    
    if (newMatboards.length === 0) {
      return res.status(200).json({ 
        message: 'No new matboards to sync',
        totalMatboards: catalogMatboards.length,
        existingMatColors: existingMatColors.length
      });
    }
    
    // Convert catalog matboards to mat_colors format
    const matColorsToInsert = newMatboards.map(mb => ({
      id: mb.id,
      name: mb.name,
      color: mb.hex_color,
      price: mb.price,
      manufacturer: mb.manufacturer,
      code: mb.code,
      description: mb.description || null,
      category: mb.category || null
    }));
    
    // Insert new mat colors
    const insertedMatColors = await db.insert(matColors).values(matColorsToInsert).returning();
    console.log(`Successfully synced ${insertedMatColors.length} matboards to mat_colors table`);
    
    return res.status(200).json({
      message: `Successfully synced ${insertedMatColors.length} matboards to mat_colors table`,
      totalMatboards: catalogMatboards.length,
      existingMatColors: existingMatColors.length,
      newMatColorCount: insertedMatColors.length,
      insertedMatColors: insertedMatColors
    });
  } catch (error) {
    console.error('Error syncing matboards:', error);
    return res.status(500).json({ error: 'Failed to sync matboards' });
  }
}