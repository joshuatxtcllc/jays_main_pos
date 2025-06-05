
import { Request, Response } from 'express';
import { storage } from '../storage';
import * as pricingService from '../services/pricingService';
import { generateOrderNumber } from '../utils/idGenerator';

export interface ThreeDDesignOrder {
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  designSpecs: {
    artworkWidth: number;
    artworkHeight: number;
    frameType: string;
    matColors?: string[];
    glassType?: string;
    designType: string; // '2d', '3d', 'shadow_box', etc.
  };
  designFiles: {
    previewImage?: string;
    designFile?: string;
    artworkImage?: string;
  };
  notes?: string;
  rush?: boolean;
}

/**
 * Create order from 3D Designer
 */
export async function createOrderFrom3D(req: Request, res: Response) {
  try {
    const orderData: ThreeDDesignOrder = req.body;
    
    // Validate required fields
    if (!orderData.customerInfo?.name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    
    if (!orderData.designSpecs?.artworkWidth || !orderData.designSpecs?.artworkHeight) {
      return res.status(400).json({ error: 'Artwork dimensions are required' });
    }

    // Create or find customer
    let customer;
    if (orderData.customerInfo.email) {
      const customers = await storage.getCustomers();
      customer = customers.find(c => c.email === orderData.customerInfo.email);
    }
    
    if (!customer) {
      customer = await storage.createCustomer({
        name: orderData.customerInfo.name,
        email: orderData.customerInfo.email || null,
        phone: orderData.customerInfo.phone || null
      });
    }

    // Generate tracking ID
    const trackingId = generateOrderNumber();

    // Calculate pricing
    const pricingData = await pricingService.calculateOrderPricing({
      frameId: orderData.designSpecs.frameType,
      artworkWidth: orderData.designSpecs.artworkWidth,
      artworkHeight: orderData.designSpecs.artworkHeight,
      matColorId: orderData.designSpecs.matColors?.[0],
      glassOptionId: orderData.designSpecs.glassType,
      specialServices: orderData.rush ? ['rush_service'] : []
    });

    // Create order
    const order = await storage.createOrder({
      customerId: customer.id,
      frameId: orderData.designSpecs.frameType,
      matColorId: orderData.designSpecs.matColors?.[0],
      glassOptionId: orderData.designSpecs.glassType || 'regular_glass',
      artworkWidth: orderData.designSpecs.artworkWidth,
      artworkHeight: orderData.designSpecs.artworkHeight,
      matWidth: 2.5, // Default mat width
      artworkDescription: `3D Designer Order - ${orderData.designSpecs.designType}`,
      artworkType: '3d_design',
      subtotal: pricingData.subtotal,
      tax: pricingData.tax,
      total: pricingData.total,
      status: 'pending',
      productionStatus: 'order_processed',
      artworkImage: orderData.designFiles.artworkImage,
      frameDesignImage: orderData.designFiles.previewImage,
      estimatedCompletionDays: orderData.rush ? 3 : 7
    });

    // Store design files if provided
    if (orderData.designFiles.designFile) {
      // You could implement file storage here
      console.log('Design file received for order:', order.id);
    }

    // Log the order creation
    console.log(`3D Designer order created: ${trackingId} for customer: ${customer.name}`);

    res.json({
      success: true,
      trackingId: order.id.toString(),
      orderNumber: trackingId,
      order: {
        id: order.id,
        trackingId: order.id.toString(),
        customerName: customer.name,
        status: order.status,
        productionStatus: order.productionStatus,
        total: order.total,
        estimatedCompletion: order.estimatedCompletionDays,
        designType: orderData.designSpecs.designType
      }
    });
  } catch (error: any) {
    console.error('Error creating 3D designer order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    });
  }
}

/**
 * Check order status by tracking ID
 */
export async function getOrderStatus(req: Request, res: Response) {
  try {
    const { trackingId } = req.params;
    const orderId = parseInt(trackingId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid tracking ID' });
    }

    const order = await storage.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const customer = await storage.getCustomer(order.customerId);

    res.json({
      success: true,
      order: {
        trackingId: order.id.toString(),
        orderNumber: `ORD-${order.id}`,
        customerName: customer?.name,
        status: order.status,
        productionStatus: order.productionStatus,
        total: order.total,
        createdAt: order.createdAt,
        estimatedCompletion: order.estimatedCompletionDays,
        artworkWidth: order.artworkWidth,
        artworkHeight: order.artworkHeight,
        frameType: order.frameId,
        matColor: order.matColorId,
        glassType: order.glassOptionId
      }
    });
  } catch (error: any) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order status',
      message: error.message 
    });
  }
}

/**
 * Update design files for an existing order
 */
export async function updateDesignFiles(req: Request, res: Response) {
  try {
    const { trackingId } = req.params;
    const { previewImage, designFile, artworkImage } = req.body;
    const orderId = parseInt(trackingId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid tracking ID' });
    }

    const order = await storage.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order with new files
    const updateData: any = {};
    if (previewImage) updateData.frameDesignImage = previewImage;
    if (artworkImage) updateData.artworkImage = artworkImage;

    const updatedOrder = await storage.updateOrder(orderId, updateData);

    res.json({
      success: true,
      message: 'Design files updated successfully',
      order: {
        trackingId: updatedOrder.id.toString(),
        frameDesignImage: updatedOrder.frameDesignImage,
        artworkImage: updatedOrder.artworkImage
      }
    });
  } catch (error: any) {
    console.error('Error updating design files:', error);
    res.status(500).json({ 
      error: 'Failed to update design files',
      message: error.message 
    });
  }
}

/**
 * Get pricing for different design types
 */
export async function getDesignPricing(req: Request, res: Response) {
  try {
    const { designType } = req.params;
    const { width, height, frameType, matColor, glassType, rush } = req.query;

    if (!width || !height) {
      return res.status(400).json({ error: 'Width and height are required' });
    }

    const artworkWidth = parseFloat(width as string);
    const artworkHeight = parseFloat(height as string);

    if (isNaN(artworkWidth) || isNaN(artworkHeight)) {
      return res.status(400).json({ error: 'Invalid width or height values' });
    }

    // Calculate pricing based on design type
    const specialServices = [];
    if (rush === 'true') specialServices.push('rush_service');
    if (designType === '3d') specialServices.push('3d_design_service');
    if (designType === 'shadow_box') specialServices.push('shadowbox_service');

    const pricingData = await pricingService.calculateOrderPricing({
      frameId: frameType as string || 'basic_black_frame',
      artworkWidth,
      artworkHeight,
      matColorId: matColor as string,
      glassOptionId: glassType as string || 'regular_glass',
      specialServices
    });

    res.json({
      success: true,
      designType,
      dimensions: { width: artworkWidth, height: artworkHeight },
      pricing: {
        subtotal: pricingData.subtotal,
        tax: pricingData.tax,
        total: pricingData.total,
        breakdown: pricingData.breakdown
      }
    });
  } catch (error: any) {
    console.error('Error calculating design pricing:', error);
    res.status(500).json({ 
      error: 'Failed to calculate pricing',
      message: error.message 
    });
  }
}

/**
 * Get available frame options for 3D designer
 */
export async function getFrameOptions(req: Request, res: Response) {
  try {
    const frames = await storage.getFrames();
    
    const frameOptions = frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      material: frame.material,
      width: frame.width,
      price: frame.price,
      catalogImage: frame.catalogImage
    }));

    res.json({
      success: true,
      frames: frameOptions
    });
  } catch (error: any) {
    console.error('Error fetching frame options:', error);
    res.status(500).json({ 
      error: 'Failed to fetch frame options',
      message: error.message 
    });
  }
}

/**
 * Get available mat color options
 */
export async function getMatOptions(req: Request, res: Response) {
  try {
    const matColors = await storage.getMatColors();
    
    const matOptions = matColors.map(mat => ({
      id: mat.id,
      name: mat.name,
      color: mat.color,
      price: mat.price
    }));

    res.json({
      success: true,
      matColors: matOptions
    });
  } catch (error: any) {
    console.error('Error fetching mat options:', error);
    res.status(500).json({ 
      error: 'Failed to fetch mat options',
      message: error.message 
    });
  }
}



/**
 * Test endpoint to verify 3D Designer integration
 */
export async function testIntegration(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      message: '3D Designer integration is working',
      timestamp: new Date().toISOString(),
      apiKey: req.apiKeyType,
      endpoints: [
        'POST /api/3d-designer/orders',
        'GET /api/3d-designer/orders/{trackingId}',
        'PATCH /api/3d-designer/orders/{trackingId}/files',
        'GET /api/3d-designer/pricing/{designType}',
        'GET /api/3d-designer/frames',
        'GET /api/3d-designer/mats'
      ]
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Integration test failed',
      message: error.message 
    });
  }
}
