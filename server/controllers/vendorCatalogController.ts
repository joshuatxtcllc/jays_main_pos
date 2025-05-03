import { Request, Response } from 'express';
import { vendorCatalogService } from '../services/vendorCatalogService';
import { vendorApiService } from '../services/vendorApiService';
import { storage } from '../storage';
import { db } from '../db';
import { frames } from '@shared/schema';
import { 
  larsonJuhlWholesalePrices, 
  getLarsonJuhlCollections, 
  getLarsonJuhlWholesalePricesByCollection 
} from '../services/larsonJuhlWholesalePricing';

/**
 * Fetches frames from Larson-Juhl's catalog API
 */
export async function getLarsonJuhlFrames(req: Request, res: Response) {
  try {
    console.log('Fetching frames from Larson-Juhl API...');
    // First try the new vendor API service
    try {
      const larsonFrames = await vendorApiService.fetchLarsonCatalog();
      console.log(`Retrieved ${larsonFrames.length} frames from Larson-Juhl API`);
      res.json(larsonFrames);
    } catch (apiError) {
      console.error('Error using direct vendor API, falling back to catalog service:', apiError);
      // Fall back to the catalog service if the API call fails
      const larsonFrames = await vendorCatalogService.fetchLarsonJuhlFrames();
      res.json(larsonFrames);
    }
  } catch (error: any) {
    console.error('Error fetching Larson-Juhl frames:', error);
    res.status(500).json({ message: 'Failed to fetch Larson-Juhl frames', error: error.message });
  }
}

/**
 * Fetches Larson-Juhl wholesale pricing data
 */
export async function getLarsonJuhlWholesalePricing(req: Request, res: Response) {
  try {
    console.log('Fetching Larson-Juhl wholesale pricing data...');
    res.json(larsonJuhlWholesalePrices);
  } catch (error: any) {
    console.error('Error fetching Larson-Juhl wholesale pricing:', error);
    res.status(500).json({ message: 'Failed to fetch Larson-Juhl wholesale pricing', error: error.message });
  }
}

/**
 * Fetches Larson-Juhl wholesale pricing data for a specific collection
 */
export async function getLarsonJuhlWholesalePricingByCollection(req: Request, res: Response) {
  try {
    const collection = req.params.collection;
    console.log(`Fetching Larson-Juhl wholesale pricing data for collection: ${collection}`);
    
    if (!collection) {
      return res.status(400).json({ message: 'Collection name is required' });
    }
    
    const prices = getLarsonJuhlWholesalePricesByCollection(collection);
    res.json(prices);
  } catch (error: any) {
    console.error('Error fetching Larson-Juhl wholesale pricing by collection:', error);
    res.status(500).json({ 
      message: 'Failed to fetch Larson-Juhl wholesale pricing by collection', 
      error: error.message 
    });
  }
}

/**
 * Fetches all available Larson-Juhl collections
 */
export async function getLarsonJuhlCollectionsList(req: Request, res: Response) {
  try {
    console.log('Fetching Larson-Juhl collections list...');
    const collections = getLarsonJuhlCollections();
    res.json(collections);
  } catch (error: any) {
    console.error('Error fetching Larson-Juhl collections:', error);
    res.status(500).json({ message: 'Failed to fetch Larson-Juhl collections', error: error.message });
  }
}

/**
 * Fetches frames from Nielsen's catalog API
 */
export async function getNielsenFrames(req: Request, res: Response) {
  try {
    console.log('Fetching frames from Nielsen Bainbridge API...');
    // First try the new vendor API service
    try {
      const nielsenFrames = await vendorApiService.fetchBellaCatalog(); // Using Bella as Nielsen replacement
      console.log(`Retrieved ${nielsenFrames.length} frames from Nielsen API`);
      res.json(nielsenFrames);
    } catch (apiError) {
      console.error('Error using direct vendor API, falling back to catalog service:', apiError);
      // Fall back to the catalog service if the API call fails
      const nielsenFrames = await vendorCatalogService.fetchNielsenFrames();
      res.json(nielsenFrames);
    }
  } catch (error: any) {
    console.error('Error fetching Nielsen frames:', error);
    res.status(500).json({ message: 'Failed to fetch Nielsen frames', error: error.message });
  }
}

/**
 * Fetches frames from Roma's catalog API
 */
export async function getRomaFrames(req: Request, res: Response) {
  try {
    console.log('Fetching frames from Roma API...');
    // First try the new vendor API service
    try {
      const romaFrames = await vendorApiService.fetchRomaCatalog();
      console.log(`Retrieved ${romaFrames.length} frames from Roma API`);
      res.json(romaFrames);
    } catch (apiError) {
      console.error('Error using direct vendor API, falling back to catalog service:', apiError);
      // Fall back to the catalog service if the API call fails
      const romaFrames = await vendorCatalogService.fetchRomaFrames();
      res.json(romaFrames);
    }
  } catch (error: any) {
    console.error('Error fetching Roma frames:', error);
    res.status(500).json({ message: 'Failed to fetch Roma frames', error: error.message });
  }
}

/**
 * Fetches frames from all integrated vendor catalog APIs
 */
export async function getAllVendorFrames(req: Request, res: Response) {
  try {
    console.log('Fetching frames from all vendor APIs...');
    // First try the new vendor API service
    try {
      const allFrames = await vendorApiService.fetchAllCatalogs();
      console.log(`Retrieved ${allFrames.length} total frames from all vendor APIs`);
      res.json(allFrames);
    } catch (apiError) {
      console.error('Error using direct vendor API, falling back to catalog service:', apiError);
      // Fall back to the catalog service if the API call fails
      const allFrames = await vendorCatalogService.fetchAllVendorFrames();
      res.json(allFrames);
    }
  } catch (error: any) {
    console.error('Error fetching all vendor frames:', error);
    res.status(500).json({ message: 'Failed to fetch frames from vendor catalogs', error: error.message });
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
    
    console.log(`Searching for frame with item number: ${itemNumber} across vendor APIs`);
    
    // First try the new vendor API service
    try {
      const matchingFrames = await vendorApiService.searchFrames(itemNumber);
      
      if (matchingFrames.length > 0) {
        console.log(`Found ${matchingFrames.length} frames matching item number ${itemNumber} in vendor APIs`);
        return res.json(matchingFrames);
      }
      
      // If no matches found in vendor APIs, try database search
      console.log(`No frames found in vendor APIs, checking database`);
      
      // Try database search using IStorage
      const databaseFrames = await storage.searchFramesByItemNumber(itemNumber);
      
      if (databaseFrames.length > 0) {
        console.log(`Found ${databaseFrames.length} frames matching item number ${itemNumber} in database`);
        return res.json(databaseFrames);
      }
      
      // Finally, fall back to catalog service if needed
      console.log(`No frames found in database, falling back to catalog service`);
      const catalogFrames = await vendorCatalogService.searchFramesByItemNumber(itemNumber);
      
      if (catalogFrames.length === 0) {
        return res.status(404).json({ message: `No frames found with item number: ${itemNumber}` });
      }
      
      console.log(`Found ${catalogFrames.length} frames matching item number ${itemNumber} in catalog service`);
      return res.json(catalogFrames);
    } catch (apiError) {
      console.error('Error using direct vendor API, falling back to catalog service:', apiError);
      
      // Fall back to catalog service
      const catalogFrames = await vendorCatalogService.searchFramesByItemNumber(itemNumber);
      
      if (catalogFrames.length === 0) {
        return res.status(404).json({ message: `No frames found with item number: ${itemNumber}` });
      }
      
      return res.json(catalogFrames);
    }
  } catch (error: any) {
    console.error('Error searching frames by item number:', error);
    res.status(500).json({ message: 'Failed to search for frames', error: error.message });
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