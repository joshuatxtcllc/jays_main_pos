import { Request, Response } from 'express';
import { importCrescentSelectMats, getCrescentSelectMats } from '../services/crescentSelectService';

/**
 * Imports Crescent Select matboards from the specification chart into mat_colors table
 */
export async function importCrescentSelect(req: Request, res: Response) {
  try {
    console.log('Processing request to import Crescent Select matboards');
    const result = await importCrescentSelectMats();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error importing Crescent Select matboards:', error);
    return res.status(500).json({ error: 'Failed to import Crescent Select matboards' });
  }
}

/**
 * Fetches Crescent Select matboards from the mat_colors table
 */
export async function getCrescentSelect(req: Request, res: Response) {
  try {
    const matboards = await getCrescentSelectMats();
    return res.status(200).json(matboards);
  } catch (error) {
    console.error('Error fetching Crescent Select matboards:', error);
    return res.status(500).json({ error: 'Failed to fetch Crescent Select matboards' });
  }
}