
import { Request, Response } from 'express';
import { 
  saveOrderArtworkImage, 
  getOrderArtworkImage, 
  getOrderFiles,
  saveOrderFile,
  saveOrderFramePreview
} from '../services/fileStorageService';
import { storage } from '../storage';
import path from 'path';
import fs from 'fs';

// Handle artwork image upload
export async function uploadArtworkImage(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }
    
    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Save the image
    const filePath = await saveOrderArtworkImage(parseInt(orderId), imageData);
    
    // Return success response
    return res.status(200).json({ 
      message: 'Artwork image saved successfully',
      filePath: path.basename(filePath)
    });
  } catch (error) {
    console.error('Error uploading artwork image:', error);
    return res.status(500).json({ message: 'Error saving artwork image' });
  }
}

// Get artwork image
export async function getArtworkImage(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    
    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get the image
    const imageData = await getOrderArtworkImage(parseInt(orderId));
    
    if (!imageData) {
      return res.status(404).json({ message: 'Artwork image not found' });
    }
    
    // Set content type and send the image
    res.contentType('image/jpeg');
    return res.send(imageData);
  } catch (error) {
    console.error('Error retrieving artwork image:', error);
    return res.status(500).json({ message: 'Error retrieving artwork image' });
  }
}

// Get all files for an order
export async function getOrderFilesList(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    
    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get all files for the order
    const files = await getOrderFiles(parseInt(orderId));
    
    // Return file information
    const fileInfos = files.map(file => ({
      name: path.basename(file),
      path: file,
      type: determineFileType(file),
      size: fs.statSync(file).size,
      lastModified: fs.statSync(file).mtime
    }));
    
    return res.status(200).json(fileInfos);
  } catch (error) {
    console.error('Error retrieving order files:', error);
    return res.status(500).json({ message: 'Error retrieving order files' });
  }
}

// Helper to determine file type
function determineFileType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.pdf':
      return 'application/pdf';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

// Upload any file for an order
export async function uploadOrderFile(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { fileData, fileName, fileType } = req.body;
    
    if (!fileData || !fileName) {
      return res.status(400).json({ message: 'File data and name are required' });
    }
    
    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Save the file
    let data: Buffer;
    if (fileData.startsWith('data:')) {
      const base64Data = fileData.split(',')[1];
      data = Buffer.from(base64Data, 'base64');
    } else {
      data = Buffer.from(fileData, 'base64');
    }
    
    const filePath = await saveOrderFile(parseInt(orderId), data, fileName);
    
    // Return success response
    return res.status(200).json({ 
      message: 'File saved successfully',
      filePath: path.basename(filePath)
    });
  } catch (error) {
    console.error('Error uploading order file:', error);
    return res.status(500).json({ message: 'Error saving order file' });
  }
}

// Save a frame preview image
export async function saveFramePreview(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const { previewData } = req.body;
    
    if (!previewData) {
      return res.status(400).json({ message: 'No preview data provided' });
    }
    
    // Validate that the order exists
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Save the preview
    const filePath = await saveOrderFramePreview(parseInt(orderId), previewData);
    
    // Return success response
    return res.status(200).json({ 
      message: 'Frame preview saved successfully',
      filePath: path.basename(filePath)
    });
  } catch (error) {
    console.error('Error saving frame preview:', error);
    return res.status(500).json({ message: 'Error saving frame preview' });
  }
}
