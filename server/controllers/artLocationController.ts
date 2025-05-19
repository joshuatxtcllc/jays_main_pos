import { Request, Response } from 'express';
import { storage } from '../storage';
import axios from 'axios';
import { z } from 'zod';

// Validation schema for art location data
const artLocationSchema = z.object({
  orderId: z.number(),
  artworkDescription: z.string(),
  artworkType: z.string(),
  artworkLocation: z.string(),
  artworkImage: z.string().optional(),
  artworkWidth: z.number(),
  artworkHeight: z.number()
});

// Type for art location data
type ArtLocationData = z.infer<typeof artLocationSchema>;

/**
 * Controller for handling art location operations
 */
export const artLocationController = {
  /**
   * Sends artwork location data to the Art Locations app
   * @param req Express request object
   * @param res Express response object
   */
  async sendArtLocationData(req: Request, res: Response) {
    try {
      // Validate incoming data
      const validationResult = artLocationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid art location data', 
          errors: validationResult.error.errors 
        });
      }
      
      const artLocationData = validationResult.data;
      
      // Update the order with the location information
      await storage.updateOrderArtLocation(
        artLocationData.orderId, 
        artLocationData.artworkLocation
      );
      
      // If there's an external Art Locations app, send the data there
      // This would typically use an environment variable for the API URL
      const artLocationsApiUrl = process.env.ART_LOCATIONS_API_URL;
      
      if (artLocationsApiUrl) {
        try {
          // Send data to external Art Locations app
          const response = await axios.post(`${artLocationsApiUrl}/api/artwork`, {
            orderReference: `POS-${artLocationData.orderId}`,
            description: artLocationData.artworkDescription,
            type: artLocationData.artworkType,
            location: artLocationData.artworkLocation,
            imageUrl: artLocationData.artworkImage,
            width: artLocationData.artworkWidth,
            height: artLocationData.artworkHeight,
            status: 'active',
            source: 'pos_system'
          });
          
          return res.status(200).json({
            message: 'Art location data successfully sent to Art Locations app',
            remoteId: response.data.id
          });
        } catch (apiError) {
          console.error('Error sending data to Art Locations app:', apiError);
          
          // Even if external sync fails, we've updated our local database
          return res.status(207).json({
            message: 'Updated local database but failed to sync with Art Locations app',
            error: (apiError as Error).message
          });
        }
      }
      
      // If no external API is configured, just return success for the local update
      return res.status(200).json({
        message: 'Art location data saved locally',
        info: 'Art Locations app integration not configured'
      });
      
    } catch (error) {
      console.error('Error handling art location data:', error);
      return res.status(500).json({ 
        message: 'Server error processing art location data', 
        error: (error as Error).message 
      });
    }
  },
  
  /**
   * Retrieves artwork location data for an order
   * @param req Express request object
   * @param res Express response object
   */
  async getArtLocationData(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Return the art location information from the order
      return res.status(200).json({
        orderId: order.id,
        artworkDescription: order.artworkDescription || '',
        artworkType: order.artworkType || '',
        artworkLocation: order.artworkLocation || '',
        artworkImage: order.artworkImage || '',
        artworkWidth: order.artworkWidth,
        artworkHeight: order.artworkHeight
      });
      
    } catch (error) {
      console.error('Error retrieving art location data:', error);
      return res.status(500).json({ 
        message: 'Server error retrieving art location data', 
        error: (error as Error).message 
      });
    }
  }
};