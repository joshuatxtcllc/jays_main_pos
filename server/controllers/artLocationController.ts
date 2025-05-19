import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";

/**
 * Schema for validating art location data
 */
const artLocationSchema = z.object({
  orderId: z.number(),
  location: z.string(),
  artworkType: z.string(),
  artworkDescription: z.string(),
  artworkWidth: z.number(),
  artworkHeight: z.number()
});

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
      const data = artLocationSchema.parse(req.body);
      
      // Update order with artwork location
      const updatedOrder = await storage.updateOrderArtLocation(
        data.orderId, 
        data.location
      );
      
      // Here we would also send the data to the Art Locations app via an API call
      // For now, we're just updating our own database
      
      res.status(200).json({ 
        success: true, 
        message: "Art location data recorded successfully",
        data: updatedOrder
      });
    } catch (error) {
      console.error("Error recording art location data:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to record art location data",
        error: error instanceof Error ? error.message : "Unknown error"
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
      const orderId = Number(req.params.orderId);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid order ID" 
        });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }
      
      // Return the relevant art location data
      res.status(200).json({
        orderId: order.id,
        location: order.artworkLocation || "",
        artworkType: order.artworkType || "",
        artworkDescription: order.artworkDescription || "",
        artworkWidth: order.artworkWidth || 0,
        artworkHeight: order.artworkHeight || 0
      });
    } catch (error) {
      console.error("Error fetching art location data:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch art location data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
};