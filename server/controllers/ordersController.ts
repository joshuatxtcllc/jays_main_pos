
import { Request, Response } from 'express';
import { db } from '../db';
import { orders, orderGroups, customers, insertOrderSchema, insertOrderGroupSchema } from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// Get all orders
export async function getAllOrders(req: Request, res: Response) {
  try {
    const allOrders = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        orderGroupId: orders.orderGroupId,
        frameId: orders.frameId,
        matColorId: orders.matColorId,
        glassOptionId: orders.glassOptionId,
        artworkWidth: orders.artworkWidth,
        artworkHeight: orders.artworkHeight,
        matWidth: orders.matWidth,
        total: orders.total,
        status: orders.status,
        productionStatus: orders.productionStatus,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt));

    return res.status(200).json(allOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Error fetching orders' });
  }
}

// Get order by ID
export async function getOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(order[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Error fetching order' });
  }
}

// Create new order
export async function createOrder(req: Request, res: Response) {
  try {
    const validatedData = insertOrderSchema.parse(req.body);
    
    const [newOrder] = await db
      .insert(orders)
      .values(validatedData)
      .returning();

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid order data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Error creating order' });
  }
}

// Update order
export async function updateOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    const updates = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (existingOrder.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ message: 'Error updating order' });
  }
}

// Delete order
export async function deleteOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (existingOrder.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await db.delete(orders).where(eq(orders.id, orderId));

    return res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ message: 'Error deleting order' });
  }
}

// Get all order groups
export async function getAllOrderGroups(req: Request, res: Response) {
  try {
    const allOrderGroups = await db
      .select()
      .from(orderGroups)
      .orderBy(desc(orderGroups.createdAt));

    return res.status(200).json(allOrderGroups);
  } catch (error) {
    console.error('Error fetching order groups:', error);
    return res.status(500).json({ message: 'Error fetching order groups' });
  }
}

// Create new order group
export async function createOrderGroup(req: Request, res: Response) {
  try {
    const validatedData = insertOrderGroupSchema.parse(req.body);
    
    const [newOrderGroup] = await db
      .insert(orderGroups)
      .values(validatedData)
      .returning();

    return res.status(201).json(newOrderGroup);
  } catch (error) {
    console.error('Error creating order group:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid order group data', errors: error.errors });
    }
    return res.status(500).json({ message: 'Error creating order group' });
  }
}
