import { Request, Response } from 'express';
import { vendorCatalogService } from '../services/vendorCatalogService';
import { db } from '../db';
import { frames } from '@shared/schema';

/**
 * Fetches frames from Larson-Juhl's catalog API
 */
export async function getLarsonJuhlFrames(req: Request, res: Response) {
  try {
    const larsonFrames = await vendorCatalogService.fetchLarsonJuhlFrames();
    res.json(larsonFrames);
  } catch (error) {
    console.error('Error fetching Larson-Juhl frames:', error);
    res.status(500).json({ message: 'Failed to fetch Larson-Juhl frames' });
  }
}

/**
 * Fetches frames from Nielsen's catalog API
 */
export async function getNielsenFrames(req: Request, res: Response) {
  try {
    const nielsenFrames = await vendorCatalogService.fetchNielsenFrames();
    res.json(nielsenFrames);
  } catch (error) {
    console.error('Error fetching Nielsen frames:', error);
    res.status(500).json({ message: 'Failed to fetch Nielsen frames' });
  }
}

/**
 * Fetches frames from Roma's catalog API
 */
export async function getRomaFrames(req: Request, res: Response) {
  try {
    const romaFrames = await vendorCatalogService.fetchRomaFrames();
    res.json(romaFrames);
  } catch (error) {
    console.error('Error fetching Roma frames:', error);
    res.status(500).json({ message: 'Failed to fetch Roma frames' });
  }
}

/**
 * Fetches frames from all integrated vendor catalog APIs
 */
export async function getAllVendorFrames(req: Request, res: Response) {
  try {
    const allFrames = await vendorCatalogService.fetchAllVendorFrames();
    res.json(allFrames);
  } catch (error) {
    console.error('Error fetching all vendor frames:', error);
    res.status(500).json({ message: 'Failed to fetch frames from vendor catalogs' });
  }
}

/**
 * Searches for frames by item number across all vendor APIs
 */
export async function searchFramesByItemNumber(req: Request, res: Response) {
  try {
    const { itemNumber } = req.params;
    
    if (!itemNumber) {
      return res.status(400).json({ message: 'Item number is required' });
    }
    
    const matchingFrames = await vendorCatalogService.searchFramesByItemNumber(itemNumber);
    
    if (matchingFrames.length === 0) {
      return res.status(404).json({ message: `No frames found with item number: ${itemNumber}` });
    }
    
    res.json(matchingFrames);
  } catch (error) {
    console.error('Error searching frames by item number:', error);
    res.status(500).json({ message: 'Failed to search for frames' });
  }
}

/**
 * Syncs all frame data from vendor APIs with the database
 */
export async function syncFramesWithDatabase(req: Request, res: Response) {
  try {
    await vendorCatalogService.syncFramesWithDatabase();
    res.json({ message: 'Frame database sync completed successfully' });
  } catch (error) {
    console.error('Error syncing frames with database:', error);
    res.status(500).json({ message: 'Failed to sync frames with database' });
  }
}