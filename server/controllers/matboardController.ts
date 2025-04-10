import { Request, Response } from 'express';
import { db } from '../db';
import { larsonJuhlCatalog } from '@shared/schema';
import { eq } from 'drizzle-orm';

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