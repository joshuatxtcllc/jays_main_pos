import { Request, Response } from "express";
import { db } from "../db";
import { orders } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Controller for handling frame design image operations
 */
export const frameDesignController = {
  /**
   * Stores a frame design image for an order
   * @param req Express request with orderId and imageData
   * @param res Express response
   */
  async saveFrameDesign(req: Request, res: Response) {
    try {
      const { orderId, imageData } = req.body;
      
      if (!orderId || !imageData) {
        return res.status(400).json({
          success: false,
          message: "Order ID and image data are required"
        });
      }
      
      // Update the order with the frame design image
      await db.update(orders)
        .set({ frameDesignImage: imageData })
        .where(eq(orders.id, parseInt(orderId)));
      
      res.status(200).json({
        success: true,
        message: "Frame design image saved successfully"
      });
    } catch (error) {
      console.error("Error saving frame design:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save frame design image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
  
  /**
   * Retrieves a frame design image for an order
   * @param req Express request with orderId parameter
   * @param res Express response
   */
  async getFrameDesign(req: Request, res: Response) {
    try {
      const orderId = req.params.orderId;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required"
        });
      }
      
      // Get the order with the frame design image
      const [order] = await db.select({ frameDesignImage: orders.frameDesignImage })
        .from(orders)
        .where(eq(orders.id, parseInt(orderId)));
      
      if (!order || !order.frameDesignImage) {
        return res.status(404).json({
          success: false,
          message: "Frame design image not found"
        });
      }
      
      res.status(200).json({
        success: true,
        imageData: order.frameDesignImage
      });
    } catch (error) {
      console.error("Error retrieving frame design:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve frame design image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
};