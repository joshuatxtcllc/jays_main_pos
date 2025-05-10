
import axios from 'axios';
import { vendorApiService, VendorFrame } from './vendorApiService';
import { log } from '../vite';

/**
 * Cross-Vendor Inventory Service
 * 
 * Aggregates inventory information from multiple frame vendors
 * to provide a unified view of availability and pricing
 */

export interface VendorInventoryResult {
  vendor: string;
  itemNumber: string;
  name: string;
  inStock: boolean;
  price: string;
  estimatedDelivery?: string;
  minimumOrder?: number;
  availableLength?: number;
  alternativeSuggestions?: VendorFrame[];
}

export interface AggregatedInventoryResult {
  query: string;
  results: VendorInventoryResult[];
  totalVendors: number;
  vendorsWithStock: number;
  bestPrice?: VendorInventoryResult;
  fastestDelivery?: VendorInventoryResult;
  lastUpdated: Date;
}

/**
 * Checks real-time inventory across all connected vendors
 * @param itemNumber The item/SKU number to check
 * @param exactMatchOnly Only return exact matches for the item number
 */
export async function checkInventoryAcrossVendors(
  itemNumber: string,
  exactMatchOnly: boolean = false
): Promise<AggregatedInventoryResult> {
  try {
    const startTime = Date.now();
    log(`Checking inventory across vendors for ${itemNumber}`, 'crossVendorInventory');
    
    const results: VendorInventoryResult[] = [];
    
    // Check Larson Juhl inventory
    try {
      const larsonResults = await checkLarsonInventory(itemNumber, exactMatchOnly);
      results.push(...larsonResults);
    } catch (error) {
      log(`Error checking Larson inventory: ${error}`, 'crossVendorInventory');
    }
    
    // Check Roma inventory
    try {
      const romaResults = await checkRomaInventory(itemNumber, exactMatchOnly);
      results.push(...romaResults);
    } catch (error) {
      log(`Error checking Roma inventory: ${error}`, 'crossVendorInventory');
    }
    
    // Check Bella inventory
    try {
      const bellaResults = await checkBellaInventory(itemNumber, exactMatchOnly);
      results.push(...bellaResults);
    } catch (error) {
      log(`Error checking Bella inventory: ${error}`, 'crossVendorInventory');
    }
    
    // Get counts and best options
    const vendorsWithStock = results.filter(r => r.inStock).length;
    
    // Find best price from in-stock items
    const inStockItems = results.filter(r => r.inStock);
    let bestPrice: VendorInventoryResult | undefined;
    
    if (inStockItems.length > 0) {
      bestPrice = inStockItems.reduce((best, current) => {
        const bestPriceNum = parseFloat(best.price);
        const currentPriceNum = parseFloat(current.price);
        return currentPriceNum < bestPriceNum ? current : best;
      }, inStockItems[0]);
    }
    
    // Find fastest delivery from in-stock items with estimated delivery
    const itemsWithDeliveryEst = inStockItems.filter(r => r.estimatedDelivery);
    let fastestDelivery: VendorInventoryResult | undefined;
    
    if (itemsWithDeliveryEst.length > 0) {
      fastestDelivery = itemsWithDeliveryEst.reduce((fastest, current) => {
        // Parse estimated delivery into days
        const fastestDays = parseInt(fastest.estimatedDelivery?.split(' ')[0] || '999');
        const currentDays = parseInt(current.estimatedDelivery?.split(' ')[0] || '999');
        return currentDays < fastestDays ? current : fastest;
      }, itemsWithDeliveryEst[0]);
    }
    
    const endTime = Date.now();
    log(`Inventory check completed in ${endTime - startTime}ms`, 'crossVendorInventory');
    
    return {
      query: itemNumber,
      results,
      totalVendors: 3, // Number of vendors we're checking
      vendorsWithStock,
      bestPrice,
      fastestDelivery,
      lastUpdated: new Date()
    };
  } catch (error) {
    log(`Error in checkInventoryAcrossVendors: ${error}`, 'crossVendorInventory');
    throw error;
  }
}

/**
 * Checks inventory with Larson Juhl
 */
async function checkLarsonInventory(
  itemNumber: string,
  exactMatchOnly: boolean = false
): Promise<VendorInventoryResult[]> {
  try {
    // First try to get real-time data from Larson API
    if (process.env.LARSON_API_KEY) {
      try {
        const response = await axios.get(
          `${process.env.LARSON_API_URL || 'https://api.larsonjuhl.com/v1'}/inventory/check`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.LARSON_API_KEY}`,
              'Content-Type': 'application/json'
            },
            params: {
              item_number: itemNumber,
              exact_match: exactMatchOnly
            }
          }
        );
        
        if (response.status === 200 && response.data.items) {
          return response.data.items.map((item: any) => ({
            vendor: 'Larson Juhl',
            itemNumber: item.item_number,
            name: item.name,
            inStock: item.in_stock,
            price: item.price_per_foot.toString(),
            estimatedDelivery: item.estimated_delivery || undefined,
            minimumOrder: item.minimum_order || undefined,
            availableLength: item.available_length || undefined,
            alternativeSuggestions: item.alternatives || []
          }));
        }
      } catch (apiError) {
        log(`Larson API error: ${apiError}`, 'crossVendorInventory');
        // Fall back to catalog data
      }
    }
    
    // Fallback to catalog data if API call fails or isn't configured
    const catalog = await vendorApiService.fetchLarsonCatalog();
    let matches = catalog;
    
    if (exactMatchOnly) {
      matches = catalog.filter(frame => 
        frame.itemNumber.toLowerCase() === itemNumber.toLowerCase());
    } else {
      matches = catalog.filter(frame => 
        frame.itemNumber.toLowerCase().includes(itemNumber.toLowerCase()) ||
        frame.name.toLowerCase().includes(itemNumber.toLowerCase()));
    }
    
    return matches.map(frame => ({
      vendor: 'Larson Juhl',
      itemNumber: frame.itemNumber,
      name: frame.name,
      inStock: frame.inStock || false,
      price: frame.price,
      // Static fallback values
      estimatedDelivery: frame.inStock ? '7 days' : '14-21 days',
      minimumOrder: 12,
      availableLength: frame.inStock ? 96 : 0
    }));
  } catch (error) {
    log(`Error in checkLarsonInventory: ${error}`, 'crossVendorInventory');
    return []; // Return empty array on error
  }
}

/**
 * Checks inventory with Roma Moulding
 */
async function checkRomaInventory(
  itemNumber: string,
  exactMatchOnly: boolean = false
): Promise<VendorInventoryResult[]> {
  try {
    // First try to get real-time data from Roma API
    if (process.env.ROMA_API_KEY) {
      try {
        const response = await axios.get(
          `${process.env.ROMA_API_URL || 'https://api.romamoulding.com/v2'}/inventory/check`,
          {
            headers: {
              'X-Api-Key': process.env.ROMA_API_KEY,
              'Content-Type': 'application/json'
            },
            params: {
              sku: itemNumber,
              exact_match: exactMatchOnly
            }
          }
        );
        
        if (response.status === 200 && response.data.items) {
          return response.data.items.map((item: any) => ({
            vendor: 'Roma Moulding',
            itemNumber: item.sku,
            name: item.name,
            inStock: item.in_stock,
            price: item.wholesale_price.toString(),
            estimatedDelivery: item.estimated_delivery || undefined,
            minimumOrder: item.minimum_order || undefined,
            availableLength: item.available_length || undefined,
            alternativeSuggestions: item.alternatives || []
          }));
        }
      } catch (apiError) {
        log(`Roma API error: ${apiError}`, 'crossVendorInventory');
        // Fall back to catalog data
      }
    }
    
    // Fallback to catalog data if API call fails or isn't configured
    const catalog = await vendorApiService.fetchRomaCatalog();
    let matches = catalog;
    
    if (exactMatchOnly) {
      matches = catalog.filter(frame => 
        frame.itemNumber.toLowerCase() === itemNumber.toLowerCase());
    } else {
      matches = catalog.filter(frame => 
        frame.itemNumber.toLowerCase().includes(itemNumber.toLowerCase()) ||
        frame.name.toLowerCase().includes(itemNumber.toLowerCase()));
    }
    
    return matches.map(frame => ({
      vendor: 'Roma Moulding',
      itemNumber: frame.itemNumber,
      name: frame.name,
      inStock: frame.inStock || false,
      price: frame.price,
      // Static fallback values
      estimatedDelivery: frame.inStock ? '5 days' : '10-15 days',
      minimumOrder: 8,
      availableLength: frame.inStock ? 120 : 0
    }));
  } catch (error) {
    log(`Error in checkRomaInventory: ${error}`, 'crossVendorInventory');
    return []; // Return empty array on error
  }
}

/**
 * Checks inventory with Bella Moulding
 */
async function checkBellaInventory(
  itemNumber: string,
  exactMatchOnly: boolean = false
): Promise<VendorInventoryResult[]> {
  try {
    // First try to get real-time data from Bella API
    if (process.env.BELLA_API_KEY) {
      try {
        const response = await axios.get(
          `${process.env.BELLA_API_URL || 'https://api.bellamoulding.com/v1'}/inventory/check`,
          {
            headers: {
              'X-API-Key': process.env.BELLA_API_KEY,
              'X-API-Secret': process.env.BELLA_API_SECRET || '',
              'Content-Type': 'application/json'
            },
            params: {
              item_code: itemNumber,
              exact_match: exactMatchOnly
            }
          }
        );
        
        if (response.status === 200 && response.data.items) {
          return response.data.items.map((item: any) => ({
            vendor: 'Bella Moulding',
            itemNumber: item.item_code,
            name: item.title,
            inStock: item.inventory_status === 'available',
            price: item.price.wholesale.toString(),
            estimatedDelivery: item.shipping_estimate || undefined,
            minimumOrder: item.minimum_order || undefined,
            availableLength: item.available_length || undefined,
            alternativeSuggestions: item.alternatives || []
          }));
        }
      } catch (apiError) {
        log(`Bella API error: ${apiError}`, 'crossVendorInventory');
        // Fall back to catalog data
      }
    }
    
    // Fallback to catalog data if API call fails or isn't configured
    const catalog = await vendorApiService.fetchBellaCatalog();
    let matches = catalog;
    
    if (exactMatchOnly) {
      matches = catalog.filter(frame => 
        frame.itemNumber.toLowerCase() === itemNumber.toLowerCase());
    } else {
      matches = catalog.filter(frame => 
        frame.itemNumber.toLowerCase().includes(itemNumber.toLowerCase()) ||
        frame.name.toLowerCase().includes(itemNumber.toLowerCase()));
    }
    
    return matches.map(frame => ({
      vendor: 'Bella Moulding',
      itemNumber: frame.itemNumber,
      name: frame.name,
      inStock: frame.inStock || false,
      price: frame.price,
      // Static fallback values
      estimatedDelivery: frame.inStock ? '6 days' : '12-18 days',
      minimumOrder: 10,
      availableLength: frame.inStock ? 108 : 0
    }));
  } catch (error) {
    log(`Error in checkBellaInventory: ${error}`, 'crossVendorInventory');
    return []; // Return empty array on error
  }
}

/**
 * Creates a purchase order suggestion based on inventory status
 * @param items Array of item numbers to order
 * @param quantities Quantities for each item
 */
export async function createPurchaseOrderSuggestions(
  items: string[],
  quantities: number[]
): Promise<Record<string, any>> {
  try {
    // Check inventory for all items
    const inventoryResults = await Promise.all(
      items.map(item => checkInventoryAcrossVendors(item, true))
    );
    
    // Create purchase orders by vendor
    const purchaseOrdersByVendor: Record<string, {
      vendor: string,
      items: Array<{
        itemNumber: string,
        name: string,
        quantity: number,
        price: string,
        inStock: boolean,
        estimatedDelivery?: string
      }>,
      totalAmount: number,
      estimatedDelivery?: string
    }> = {};
    
    inventoryResults.forEach((result, index) => {
      // Find the best vendor for this item (in stock with best price)
      const inStockResults = result.results.filter(r => r.inStock);
      
      if (inStockResults.length === 0) {
        // No vendor has it in stock, use the first result
        if (result.results.length > 0) {
          const vendor = result.results[0].vendor;
          
          if (!purchaseOrdersByVendor[vendor]) {
            purchaseOrdersByVendor[vendor] = {
              vendor,
              items: [],
              totalAmount: 0
            };
          }
          
          purchaseOrdersByVendor[vendor].items.push({
            itemNumber: result.results[0].itemNumber,
            name: result.results[0].name,
            quantity: quantities[index] || 1,
            price: result.results[0].price,
            inStock: false,
            estimatedDelivery: result.results[0].estimatedDelivery
          });
          
          purchaseOrdersByVendor[vendor].totalAmount += 
            parseFloat(result.results[0].price) * (quantities[index] || 1);
        }
      } else {
        // Find best price from in-stock items
        const bestPriceItem = inStockResults.reduce((best, current) => {
          const bestPrice = parseFloat(best.price);
          const currentPrice = parseFloat(current.price);
          return currentPrice < bestPrice ? current : best;
        }, inStockResults[0]);
        
        const vendor = bestPriceItem.vendor;
        
        if (!purchaseOrdersByVendor[vendor]) {
          purchaseOrdersByVendor[vendor] = {
            vendor,
            items: [],
            totalAmount: 0
          };
        }
        
        purchaseOrdersByVendor[vendor].items.push({
          itemNumber: bestPriceItem.itemNumber,
          name: bestPriceItem.name,
          quantity: quantities[index] || 1,
          price: bestPriceItem.price,
          inStock: true,
          estimatedDelivery: bestPriceItem.estimatedDelivery
        });
        
        purchaseOrdersByVendor[vendor].totalAmount += 
          parseFloat(bestPriceItem.price) * (quantities[index] || 1);
      }
    });
    
    // Calculate estimated delivery for each PO
    Object.keys(purchaseOrdersByVendor).forEach(vendor => {
      const po = purchaseOrdersByVendor[vendor];
      const deliveryDays = po.items
        .filter(item => item.estimatedDelivery)
        .map(item => {
          const days = item.estimatedDelivery?.split(' ')[0];
          return parseInt(days || '0');
        });
      
      if (deliveryDays.length > 0) {
        // Use the maximum delivery time for the PO
        const maxDays = Math.max(...deliveryDays);
        po.estimatedDelivery = `${maxDays} days`;
      }
    });
    
    return {
      purchaseOrders: Object.values(purchaseOrdersByVendor),
      itemsChecked: items.length,
      vendorsUsed: Object.keys(purchaseOrdersByVendor).length,
      createdAt: new Date()
    };
  } catch (error) {
    log(`Error in createPurchaseOrderSuggestions: ${error}`, 'crossVendorInventory');
    throw error;
  }
}
