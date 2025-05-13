
import { storage } from '../storage';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Base directory for file storage
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const ORDER_IMAGES_DIR = path.join(UPLOAD_DIR, 'order-images');

// Ensure upload directories exist
async function ensureDirectoriesExist() {
  try {
    // Create base upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
    
    // Create order images directory if it doesn't exist
    if (!existsSync(ORDER_IMAGES_DIR)) {
      await fs.mkdir(ORDER_IMAGES_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating upload directories:', error);
    throw error;
  }
}

// Initialize directories
ensureDirectoriesExist();

/**
 * Save an artwork image for an order
 * @param orderId The ID of the order
 * @param imageData Base64 encoded image data or buffer
 * @param fileName Optional filename (default: "artwork.jpg")
 * @returns Path to the saved file
 */
export async function saveOrderArtworkImage(orderId: number, imageData: string | Buffer, fileName: string = 'artwork.jpg'): Promise<string> {
  try {
    // Create order-specific directory
    const orderDir = path.join(ORDER_IMAGES_DIR, orderId.toString());
    if (!existsSync(orderDir)) {
      await fs.mkdir(orderDir, { recursive: true });
    }
    
    // Determine file path
    const filePath = path.join(orderDir, fileName);
    
    // Handle base64 data URLs
    let imageBuffer: Buffer;
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      const base64Data = imageData.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (typeof imageData === 'string') {
      imageBuffer = Buffer.from(imageData, 'base64');
    } else {
      imageBuffer = imageData;
    }
    
    // Write the file
    await fs.writeFile(filePath, imageBuffer);
    
    // Update the order record with the image path (relative to uploads dir)
    await storage.updateOrder(orderId, {
      artworkImagePath: path.relative(UPLOAD_DIR, filePath)
    });
    
    return filePath;
  } catch (error) {
    console.error(`Error saving artwork image for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Retrieve an artwork image for an order
 * @param orderId The ID of the order
 * @param fileName Optional filename (default: "artwork.jpg")
 * @returns Buffer containing the image data or null if not found
 */
export async function getOrderArtworkImage(orderId: number, fileName: string = 'artwork.jpg'): Promise<Buffer | null> {
  try {
    const filePath = path.join(ORDER_IMAGES_DIR, orderId.toString(), fileName);
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    return await fs.readFile(filePath);
  } catch (error) {
    console.error(`Error retrieving artwork image for order ${orderId}:`, error);
    return null;
  }
}

/**
 * Get all files related to an order
 * @param orderId The ID of the order
 * @returns Array of file paths
 */
export async function getOrderFiles(orderId: number): Promise<string[]> {
  try {
    const orderDir = path.join(ORDER_IMAGES_DIR, orderId.toString());
    
    if (!existsSync(orderDir)) {
      return [];
    }
    
    const files = await fs.readdir(orderDir);
    return files.map(file => path.join(orderDir, file));
  } catch (error) {
    console.error(`Error retrieving files for order ${orderId}:`, error);
    return [];
  }
}

/**
 * Save any file related to an order (QR code, invoice, etc.)
 * @param orderId The ID of the order
 * @param fileData File data as buffer
 * @param fileName Name to save the file as
 * @returns Path to the saved file
 */
export async function saveOrderFile(orderId: number, fileData: Buffer, fileName: string): Promise<string> {
  try {
    // Create order-specific directory
    const orderDir = path.join(ORDER_IMAGES_DIR, orderId.toString());
    if (!existsSync(orderDir)) {
      await fs.mkdir(orderDir, { recursive: true });
    }
    
    // Determine file path
    const filePath = path.join(orderDir, fileName);
    
    // Write the file
    await fs.writeFile(filePath, fileData);
    
    return filePath;
  } catch (error) {
    console.error(`Error saving file for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Save a virtual frame preview for an order
 * @param orderId The ID of the order
 * @param previewData Preview image data (Base64 or Buffer)
 * @returns Path to the saved file
 */
export async function saveOrderFramePreview(orderId: number, previewData: string | Buffer): Promise<string> {
  try {
    return await saveOrderArtworkImage(orderId, previewData, 'frame-preview.jpg');
  } catch (error) {
    console.error(`Error saving frame preview for order ${orderId}:`, error);
    throw error;
  }
}
