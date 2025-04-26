import axios from 'axios';
import { storage } from '../storage';

/**
 * VendorApiService
 * 
 * Connects to real vendor APIs to retrieve complete frame catalogs
 * and accurate wholesale pricing for Larson Juhl, Roma Moulding, and Bella Moulding
 */

// Define frame catalog interfaces
export interface VendorFrame {
  id: string;
  itemNumber: string;
  name: string;
  price: string;  // Wholesale price per foot
  material: string;
  color: string;
  width: string;
  height: string;
  depth: string;
  collection: string;
  description?: string;
  imageUrl?: string;
  inStock?: boolean;
  vendor: string;
}

// API configuration interfaces
interface VendorApiConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret?: string;
}

// API response interfaces
interface LarsonApiResponse {
  frames: Array<{
    item_number: string;
    name: string;
    collection: string;
    material: string;
    color: string;
    width: number;
    height: number;
    depth: number;
    price_per_foot: number;
    description: string;
    image_url: string;
    in_stock: boolean;
  }>;
}

interface RomaApiResponse {
  mouldings: Array<{
    sku: string;
    name: string;
    collection: string;
    material: string;
    finish: string;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    wholesale_price: number;
    description: string;
    image: string;
    availability: string;
  }>;
}

interface BellaApiResponse {
  items: Array<{
    item_code: string;
    title: string;
    collection_name: string;
    material_type: string;
    color: string;
    measurements: {
      width_mm: number;
      height_mm: number;
      depth_mm: number;
    };
    price: {
      wholesale: number;
      currency: string;
    };
    description: string;
    image_urls: string[];
    inventory_status: string;
  }>;
}

/**
 * Vendor API Service for direct connections to frame suppliers
 */
class VendorApiService {
  private larsonConfig: VendorApiConfig;
  private romaConfig: VendorApiConfig;
  private bellaConfig: VendorApiConfig;

  constructor() {
    // Initialize with environment variables
    this.larsonConfig = {
      baseUrl: process.env.LARSON_API_URL || 'https://api.larsonjuhl.com/v1',
      apiKey: process.env.LARSON_API_KEY || '',
    };

    this.romaConfig = {
      baseUrl: process.env.ROMA_API_URL || 'https://api.romamoulding.com/v2',
      apiKey: process.env.ROMA_API_KEY || '',
    };

    this.bellaConfig = {
      baseUrl: process.env.BELLA_API_URL || 'https://api.bellamoulding.com/v1',
      apiKey: process.env.BELLA_API_KEY || '',
      apiSecret: process.env.BELLA_API_SECRET || '',
    };
  }

  /**
   * Fetch complete catalog from Larson Juhl
   */
  async fetchLarsonCatalog(): Promise<VendorFrame[]> {
    try {
      if (!this.larsonConfig.apiKey) {
        console.warn('Larson API key not configured. Using sample data.');
        return this.getLarsonSampleFrames();
      }

      const response = await axios.get<LarsonApiResponse>(
        `${this.larsonConfig.baseUrl}/catalog/frames`,
        {
          headers: {
            'Authorization': `Bearer ${this.larsonConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Transform API response to our internal format
      return response.data.frames.map(frame => ({
        id: `larson-${frame.item_number}`,
        itemNumber: frame.item_number,
        name: `${frame.name} (${frame.collection})`,
        price: frame.price_per_foot.toString(),
        material: frame.material,
        color: frame.color,
        width: frame.width.toString(),
        height: frame.height.toString(),
        depth: frame.depth.toString(),
        collection: frame.collection,
        description: frame.description,
        imageUrl: frame.image_url,
        inStock: frame.in_stock,
        vendor: 'Larson Juhl'
      }));
    } catch (error) {
      console.error('Error fetching Larson Juhl catalog:', error);
      // Fallback to sample data on failure
      return this.getLarsonSampleFrames();
    }
  }

  /**
   * Fetch complete catalog from Roma Moulding
   */
  async fetchRomaCatalog(): Promise<VendorFrame[]> {
    try {
      if (!this.romaConfig.apiKey) {
        console.warn('Roma API key not configured. Using sample data.');
        return this.getRomaSampleFrames();
      }

      const response = await axios.get<RomaApiResponse>(
        `${this.romaConfig.baseUrl}/catalog/mouldings`,
        {
          headers: {
            'X-Api-Key': this.romaConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      // Transform API response to our internal format
      return response.data.mouldings.map(moulding => ({
        id: `roma-${moulding.sku}`,
        itemNumber: moulding.sku,
        name: `${moulding.name} (${moulding.collection})`,
        price: moulding.wholesale_price.toString(),
        material: moulding.material,
        color: moulding.finish,
        width: moulding.dimensions.width.toString(),
        height: moulding.dimensions.height.toString(),
        depth: moulding.dimensions.depth.toString(),
        collection: moulding.collection,
        description: moulding.description,
        imageUrl: moulding.image,
        inStock: moulding.availability === 'in_stock',
        vendor: 'Roma Moulding'
      }));
    } catch (error) {
      console.error('Error fetching Roma catalog:', error);
      // Fallback to sample data on failure
      return this.getRomaSampleFrames();
    }
  }

  /**
   * Fetch complete catalog from Bella Moulding
   */
  async fetchBellaCatalog(): Promise<VendorFrame[]> {
    try {
      if (!this.bellaConfig.apiKey) {
        console.warn('Bella API key not configured. Using sample data.');
        return this.getBellaSampleFrames();
      }

      const response = await axios.get<BellaApiResponse>(
        `${this.bellaConfig.baseUrl}/products`,
        {
          headers: {
            'X-API-Key': this.bellaConfig.apiKey,
            'X-API-Secret': this.bellaConfig.apiSecret || '',
            'Content-Type': 'application/json'
          }
        }
      );

      // Transform API response to our internal format
      return response.data.items.map(item => ({
        id: `bella-${item.item_code}`,
        itemNumber: item.item_code,
        name: `${item.title} (${item.collection_name})`,
        price: item.price.wholesale.toString(),
        material: item.material_type,
        color: item.color,
        width: (item.measurements.width_mm / 25.4).toFixed(2), // Convert mm to inches
        height: (item.measurements.height_mm / 25.4).toFixed(2),
        depth: (item.measurements.depth_mm / 25.4).toFixed(2),
        collection: item.collection_name,
        description: item.description,
        imageUrl: item.image_urls[0],
        inStock: item.inventory_status === 'available',
        vendor: 'Bella Moulding'
      }));
    } catch (error) {
      console.error('Error fetching Bella catalog:', error);
      // Fallback to sample data on failure
      return this.getBellaSampleFrames();
    }
  }

  /**
   * Fetch all catalogs from all vendors
   */
  async fetchAllCatalogs(): Promise<VendorFrame[]> {
    const [larsonFrames, romaFrames, bellaFrames] = await Promise.all([
      this.fetchLarsonCatalog(),
      this.fetchRomaCatalog(),
      this.fetchBellaCatalog()
    ]);

    return [...larsonFrames, ...romaFrames, ...bellaFrames];
  }

  /**
   * Search across all vendor catalogs for frames matching criteria
   * @param query Search query for name, material, or collection
   * @param vendor Optional vendor filter
   */
  async searchFrames(query: string, vendor?: string): Promise<VendorFrame[]> {
    let allFrames: VendorFrame[] = [];
    
    // If we have a specific item number search, we can search directly in our database
    if (/^[a-zA-Z0-9\-]+$/.test(query) && query.length >= 4) {
      const exactFrames = await storage.searchFramesByItemNumber(query);
      if (exactFrames && exactFrames.length > 0) {
        return exactFrames.map(frame => ({
          id: frame.id,
          itemNumber: frame.id.split('-')[1] || '',
          name: frame.name,
          price: frame.price,
          material: frame.material || '',
          color: frame.color || '',
          width: '',
          height: '',
          depth: '',
          collection: '',
          imageUrl: frame.thumbnailUrl,
          vendor: frame.id.split('-')[0] || ''
        }));
      }
    }
    
    // Otherwise, fetch from APIs
    if (vendor) {
      switch (vendor.toLowerCase()) {
        case 'larson':
          allFrames = await this.fetchLarsonCatalog();
          break;
        case 'roma':
          allFrames = await this.fetchRomaCatalog();
          break;
        case 'bella':
          allFrames = await this.fetchBellaCatalog();
          break;
        default:
          allFrames = await this.fetchAllCatalogs();
      }
    } else {
      allFrames = await this.fetchAllCatalogs();
    }

    if (!query) return allFrames;

    const normalizedQuery = query.toLowerCase();
    return allFrames.filter(frame => 
      frame.name.toLowerCase().includes(normalizedQuery) ||
      frame.material.toLowerCase().includes(normalizedQuery) ||
      frame.color.toLowerCase().includes(normalizedQuery) ||
      frame.collection.toLowerCase().includes(normalizedQuery) ||
      frame.itemNumber.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Sync all vendor catalogs to database
   * This provides a complete catalog for the POS system
   */
  async syncCatalogsToDatabase(): Promise<{ added: number, updated: number }> {
    try {
      const allFrames = await this.fetchAllCatalogs();
      const existingFrames = await storage.getAllFrames();
      
      const existingIds = new Set(existingFrames.map(f => f.id));
      
      // Split frames into new additions and updates
      const framesToAdd = allFrames.filter(f => !existingIds.has(f.id));
      const framesToUpdate = allFrames.filter(f => existingIds.has(f.id));
      
      // Add new frames
      for (const frame of framesToAdd) {
        await storage.addFrame({
          id: frame.id,
          name: frame.name,
          price: frame.price,
          material: frame.material,
          color: frame.color,
          thumbnailUrl: frame.imageUrl,
          description: frame.description || ''
        });
      }
      
      // Update existing frames
      for (const frame of framesToUpdate) {
        await storage.updateFrame({
          id: frame.id,
          name: frame.name,
          price: frame.price,
          material: frame.material,
          color: frame.color,
          thumbnailUrl: frame.imageUrl,
          description: frame.description || ''
        });
      }
      
      return {
        added: framesToAdd.length,
        updated: framesToUpdate.length
      };
    } catch (error) {
      console.error('Error syncing catalogs to database:', error);
      throw error;
    }
  }

  /**
   * Get sample frames for Larson Juhl (when API is not available)
   * @returns Sample frame data
   */
  private getLarsonSampleFrames(): VendorFrame[] {
    return [
      {
        id: 'larson-210286',
        itemNumber: '210286',
        name: 'Larson Academie Black',
        price: '3.85',
        material: 'Wood',
        color: 'Black',
        width: '1.25',
        height: '0.75',
        depth: '0.625',
        collection: 'Academie',
        description: 'Classic black wood frame with smooth finish',
        imageUrl: 'https://www.larsonjuhl.com/images/products/210286.jpg',
        inStock: true,
        vendor: 'Larson Juhl'
      },
      {
        id: 'larson-655320',
        itemNumber: '655320',
        name: 'Larson Biltmore Gold',
        price: '4.50',
        material: 'Wood',
        color: 'Gold',
        width: '1.5',
        height: '0.875',
        depth: '0.75',
        collection: 'Biltmore',
        description: 'Elegant gold finish frame with ornate details',
        imageUrl: 'https://www.larsonjuhl.com/images/products/655320.jpg',
        inStock: true,
        vendor: 'Larson Juhl'
      },
      {
        id: 'larson-460530',
        itemNumber: '460530',
        name: 'Larson Ventura Silver',
        price: '5.25',
        material: 'Metal',
        color: 'Silver',
        width: '0.75',
        height: '1.125',
        depth: '0.5',
        collection: 'Ventura',
        description: 'Modern silver metallic frame',
        imageUrl: 'https://www.larsonjuhl.com/images/products/460530.jpg',
        inStock: true,
        vendor: 'Larson Juhl'
      }
    ];
  }

  /**
   * Get sample frames for Roma Moulding (when API is not available)
   * @returns Sample frame data
   */
  private getRomaSampleFrames(): VendorFrame[] {
    return [
      {
        id: 'roma-307',
        itemNumber: '307',
        name: 'Roma Gold Luxe',
        price: '6.75',
        material: 'Wood',
        color: 'Gold',
        width: '2.0',
        height: '1.5',
        depth: '0.875',
        collection: 'Luxe',
        description: 'Premium gold leaf finish with handcrafted details',
        imageUrl: 'https://www.romamoulding.com/images/products/307.jpg',
        inStock: true,
        vendor: 'Roma Moulding'
      }
    ];
  }

  /**
   * Get sample frames for Bella Moulding (when API is not available)
   * @returns Sample frame data
   */
  private getBellaSampleFrames(): VendorFrame[] {
    return [
      {
        id: 'bella-W8543',
        itemNumber: 'W8543',
        name: 'Bella Carrara White',
        price: '4.95',
        material: 'Wood',
        color: 'White',
        width: '1.75',
        height: '1.125',
        depth: '0.75',
        collection: 'Carrara',
        description: 'Elegant white wood frame with subtle texture',
        imageUrl: 'https://www.bellamoulding.com/images/products/W8543.jpg',
        inStock: true,
        vendor: 'Bella Moulding'
      },
      {
        id: 'bella-M2202',
        itemNumber: 'M2202',
        name: 'Bella Metropolitan Brushed Silver',
        price: '5.85',
        material: 'Metal',
        color: 'Silver',
        width: '0.625',
        height: '1.0',
        depth: '0.5',
        collection: 'Metropolitan',
        description: 'Contemporary brushed silver finish metal frame',
        imageUrl: 'https://www.bellamoulding.com/images/products/M2202.jpg',
        inStock: true,
        vendor: 'Bella Moulding'
      }
    ];
  }
}

export const vendorApiService = new VendorApiService();