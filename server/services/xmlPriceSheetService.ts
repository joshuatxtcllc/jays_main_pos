
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXml = promisify(parseString);

export interface VendorPriceItem {
  itemNumber: string;
  description: string;
  width?: string;
  collection?: string;
  manufacturer: string;
  wholesalePrice: number;
  retailPrice?: number;
  category?: string;
  inStock?: boolean;
  unitOfMeasure?: string;
}

export class XmlPriceSheetService {
  /**
   * Parse vendor XML price sheet and extract pricing data
   */
  async parseVendorXmlPriceSheet(xmlContent: string): Promise<VendorPriceItem[]> {
    try {
      console.log('Parsing vendor XML price sheet...');
      
      const result = await parseXml(xmlContent);
      const items: VendorPriceItem[] = [];
      
      // Handle different XML structures - adapt based on actual XML format
      if (result.catalog?.items?.item) {
        const xmlItems = Array.isArray(result.catalog.items.item) 
          ? result.catalog.items.item 
          : [result.catalog.items.item];
          
        for (const xmlItem of xmlItems) {
          const item: VendorPriceItem = {
            itemNumber: this.extractValue(xmlItem.sku || xmlItem.itemNumber || xmlItem.id),
            description: this.extractValue(xmlItem.description || xmlItem.name),
            width: this.extractValue(xmlItem.width),
            collection: this.extractValue(xmlItem.collection || xmlItem.series),
            manufacturer: this.extractValue(xmlItem.manufacturer || xmlItem.vendor || 'Unknown'),
            wholesalePrice: this.extractNumericValue(xmlItem.wholesalePrice || xmlItem.cost || xmlItem.price),
            retailPrice: this.extractNumericValue(xmlItem.retailPrice || xmlItem.msrp),
            category: this.extractValue(xmlItem.category || xmlItem.type),
            inStock: this.extractBooleanValue(xmlItem.inStock || xmlItem.available),
            unitOfMeasure: this.extractValue(xmlItem.unitOfMeasure || xmlItem.uom || 'each')
          };
          
          if (item.itemNumber && item.wholesalePrice > 0) {
            items.push(item);
          }
        }
      }
      // Handle alternative XML structures
      else if (result.products?.product) {
        const xmlItems = Array.isArray(result.products.product) 
          ? result.products.product 
          : [result.products.product];
          
        for (const xmlItem of xmlItems) {
          const item: VendorPriceItem = {
            itemNumber: this.extractValue(xmlItem.$.id || xmlItem.$.sku),
            description: this.extractValue(xmlItem.name?.[0] || xmlItem.description?.[0]),
            width: this.extractValue(xmlItem.dimensions?.width?.[0]),
            collection: this.extractValue(xmlItem.collection?.[0]),
            manufacturer: this.extractValue(xmlItem.manufacturer?.[0] || 'Unknown'),
            wholesalePrice: this.extractNumericValue(xmlItem.pricing?.wholesale?.[0] || xmlItem.cost?.[0]),
            retailPrice: this.extractNumericValue(xmlItem.pricing?.retail?.[0]),
            category: this.extractValue(xmlItem.category?.[0]),
            inStock: this.extractBooleanValue(xmlItem.inventory?.inStock?.[0]),
            unitOfMeasure: this.extractValue(xmlItem.unitOfMeasure?.[0] || 'each')
          };
          
          if (item.itemNumber && item.wholesalePrice > 0) {
            items.push(item);
          }
        }
      }
      
      console.log(`Successfully parsed ${items.length} items from XML price sheet`);
      return items;
      
    } catch (error) {
      console.error('Error parsing XML price sheet:', error);
      throw new Error(`Failed to parse XML price sheet: ${error.message}`);
    }
  }
  
  private extractValue(value: any): string {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value) && value.length > 0) return String(value[0]).trim();
    if (value && typeof value === 'object' && value._) return String(value._).trim();
    return '';
  }
  
  private extractNumericValue(value: any): number {
    const stringValue = this.extractValue(value);
    const numericValue = parseFloat(stringValue.replace(/[^0-9.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  }
  
  private extractBooleanValue(value: any): boolean {
    const stringValue = this.extractValue(value).toLowerCase();
    return stringValue === 'true' || stringValue === 'yes' || stringValue === '1';
  }
  
  /**
   * Convert vendor price items to Frame format for catalog integration
   */
  convertToFrameFormat(items: VendorPriceItem[]): any[] {
    return items.map(item => ({
      id: `vendor-${item.manufacturer.toLowerCase().replace(/\s+/g, '-')}-${item.itemNumber}`,
      name: `${item.collection ? item.collection + ' ' : ''}${item.description}`,
      manufacturer: item.manufacturer,
      material: this.inferMaterial(item.description, item.category),
      width: item.width || '',
      depth: '', // Not typically provided in price sheets
      price: item.wholesalePrice.toString(),
      catalogImage: '', // Would need separate image mapping
      color: this.inferColor(item.description),
      itemNumber: item.itemNumber,
      collection: item.collection || '',
      category: item.category || '',
      inStock: item.inStock !== false,
      unitOfMeasure: item.unitOfMeasure
    }));
  }
  
  private inferMaterial(description: string, category?: string): string {
    const desc = description.toLowerCase();
    const cat = category?.toLowerCase() || '';
    
    if (desc.includes('wood') || cat.includes('wood')) return 'wood';
    if (desc.includes('metal') || cat.includes('metal')) return 'metal';
    if (desc.includes('plastic') || cat.includes('plastic')) return 'plastic';
    if (desc.includes('composite') || cat.includes('composite')) return 'composite';
    
    return 'wood'; // Default assumption for frames
  }
  
  private inferColor(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('black')) return '#000000';
    if (desc.includes('white')) return '#FFFFFF';
    if (desc.includes('brown')) return '#8B4513';
    if (desc.includes('gold')) return '#FFD700';
    if (desc.includes('silver')) return '#C0C0C0';
    if (desc.includes('red')) return '#FF0000';
    if (desc.includes('blue')) return '#0000FF';
    
    return '#8B4513'; // Default to brown for wood frames
  }
}

export const xmlPriceSheetService = new XmlPriceSheetService();
