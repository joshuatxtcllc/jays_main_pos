
import { Request, Response } from 'express';
import { storage } from '../storage';
import { saveOrderFile } from '../services/fileStorageService';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

// Get artwork location for an order
export async function getArtworkLocation(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    // Get the order from storage
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Return location data
    return res.status(200).json({
      orderId,
      location: order.artworkStorageLocation || '',
      imagePath: order.artworkLocationImagePath || null,
      updatedAt: order.artworkLocationUpdatedAt || null
    });
    
  } catch (error) {
    console.error('Error fetching artwork location:', error);
    return res.status(500).json({ message: 'Error fetching artwork location' });
  }
}

// Save artwork location for an order
export async function saveArtworkLocation(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    const location = req.body.location;
    
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }
    
    // Get the order from storage
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update data
    const updateData: any = {
      artworkStorageLocation: location,
      artworkLocationUpdatedAt: new Date()
    };
    
    // Handle image upload if present
    if (req.file) {
      // Save the file
      const filePath = await saveOrderFile(
        orderId, 
        req.file.buffer, 
        'artwork-location.jpg'
      );
      
      // Update the order with the image path
      updateData.artworkLocationImagePath = path.relative(
        path.join(process.cwd(), 'uploads'), 
        filePath
      );
    }
    
    // Update the order
    await storage.updateOrder(orderId, updateData);
    
    // Return updated location data
    return res.status(200).json({
      orderId,
      location: updateData.artworkStorageLocation,
      imagePath: updateData.artworkLocationImagePath || null,
      updatedAt: updateData.artworkLocationUpdatedAt
    });
    
  } catch (error) {
    console.error('Error saving artwork location:', error);
    return res.status(500).json({ message: 'Error saving artwork location' });
  }
}

// Get artwork location image
export async function getArtworkLocationImage(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    // Get the order from storage
    const order = await storage.getOrderById(orderId);
    
    if (!order || !order.artworkLocationImagePath) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Build the full path
    const imagePath = path.join(process.cwd(), 'uploads', order.artworkLocationImagePath);
    
    // Check if file exists
    if (!existsSync(imagePath)) {
      return res.status(404).json({ message: 'Image file not found' });
    }
    
    // Send the file
    return res.sendFile(imagePath);
    
  } catch (error) {
    console.error('Error fetching artwork location image:', error);
    return res.status(500).json({ message: 'Error fetching artwork location image' });
  }
}
