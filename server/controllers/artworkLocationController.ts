import { Request, Response } from 'express';
import { storage } from '../storage';

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
    const updateData = {
      artworkStorageLocation: location,
      artworkLocationUpdatedAt: new Date()
    };

    // Update the order
    await storage.updateOrder(orderId, updateData);

    // Return updated location data
    return res.status(200).json({
      orderId,
      location: updateData.artworkStorageLocation,
      updatedAt: updateData.artworkLocationUpdatedAt
    });

  } catch (error) {
    console.error('Error saving artwork location:', error);
    return res.status(500).json({ message: 'Error saving artwork location' });
  }
}