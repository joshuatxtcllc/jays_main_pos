
import { Request, Response } from 'express';
import { xmlPriceSheetService } from '../services/xmlPriceSheetService';
import { db } from '../db';
import { frames } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload and process vendor XML price sheet
 */
export async function uploadXmlPriceSheet(req: Request, res: Response) {
  try {
    const { xmlContent, vendorName } = req.body;
    
    if (!xmlContent) {
      return res.status(400).json({ message: 'XML content is required' });
    }
    
    if (!vendorName) {
      return res.status(400).json({ message: 'Vendor name is required' });
    }
    
    console.log(`Processing XML price sheet for vendor: ${vendorName}`);
    
    // Parse the XML price sheet
    const priceItems = await xmlPriceSheetService.parseVendorXmlPriceSheet(xmlContent);
    
    if (priceItems.length === 0) {
      return res.status(400).json({ message: 'No valid price items found in XML' });
    }
    
    // Convert to frame format
    const frameItems = xmlPriceSheetService.convertToFrameFormat(priceItems);
    
    // Store in database (update existing or insert new)
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const frameItem of frameItems) {
      try {
        // Check if frame already exists
        const existingFrame = await db.select()
          .from(frames)
          .where(eq(frames.id, frameItem.id))
          .limit(1);
        
        if (existingFrame.length > 0) {
          // Update existing frame
          await db.update(frames)
            .set({
              name: frameItem.name,
              manufacturer: frameItem.manufacturer,
              material: frameItem.material,
              width: frameItem.width,
              price: frameItem.price,
              color: frameItem.color,
              updatedAt: new Date()
            })
            .where(eq(frames.id, frameItem.id));
          updatedCount++;
        } else {
          // Insert new frame
          await db.insert(frames).values({
            id: frameItem.id,
            name: frameItem.name,
            manufacturer: frameItem.manufacturer,
            material: frameItem.material,
            width: frameItem.width,
            depth: frameItem.depth,
            price: frameItem.price,
            catalogImage: frameItem.catalogImage,
            color: frameItem.color,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          insertedCount++;
        }
      } catch (itemError) {
        console.error(`Error processing frame item ${frameItem.id}:`, itemError);
      }
    }
    
    console.log(`XML price sheet processing complete. Inserted: ${insertedCount}, Updated: ${updatedCount}`);
    
    res.json({
      message: 'XML price sheet processed successfully',
      vendor: vendorName,
      totalItems: priceItems.length,
      inserted: insertedCount,
      updated: updatedCount,
      summary: {
        priceItems: priceItems.slice(0, 5), // Sample of processed items
        frameItems: frameItems.slice(0, 5)  // Sample of converted frames
      }
    });
    
  } catch (error: any) {
    console.error('Error processing XML price sheet:', error);
    res.status(500).json({ 
      message: 'Failed to process XML price sheet', 
      error: error.message 
    });
  }
}

/**
 * Get supported XML formats and examples
 */
export async function getXmlFormats(req: Request, res: Response) {
  res.json({
    supportedFormats: [
      {
        name: 'Standard Catalog Format',
        structure: {
          catalog: {
            items: {
              item: [
                {
                  sku: 'item-number',
                  description: 'item-description',
                  manufacturer: 'vendor-name',
                  wholesalePrice: 'price',
                  width: 'frame-width',
                  collection: 'collection-name'
                }
              ]
            }
          }
        }
      },
      {
        name: 'Products Format',
        structure: {
          products: {
            product: [
              {
                '$': { id: 'item-number' },
                name: ['item-description'],
                manufacturer: ['vendor-name'],
                pricing: {
                  wholesale: ['price']
                }
              }
            ]
          }
        }
      }
    ],
    requiredFields: ['itemNumber', 'description', 'manufacturer', 'wholesalePrice'],
    optionalFields: ['width', 'collection', 'retailPrice', 'category', 'inStock']
  });
}
