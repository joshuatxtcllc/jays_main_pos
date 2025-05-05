
import { db } from '../db';
import { sql } from 'drizzle-orm';
import * as emailService from './emailService';
import { MaterialOrderStatus, Order } from '@shared/schema';

/**
 * Records a status change in the order_status_history table
 */
export async function recordStatusChange(
  orderId: number, 
  previousStatus: MaterialOrderStatus, 
  newStatus: MaterialOrderStatus, 
  notes?: string
) {
  try {
    // Insert the status change record
    await db.execute(sql`
      INSERT INTO order_status_history (order_id, previous_status, new_status, notes)
      VALUES (${orderId}, ${previousStatus}, ${newStatus}, ${notes || null})
    `);
    
    // Return the new record
    const [record] = await db.execute(sql`
      SELECT * FROM order_status_history 
      WHERE order_id = ${orderId}
      ORDER BY changed_at DESC LIMIT 1
    `);
    
    return record;
  } catch (error) {
    console.error('Error recording status change:', error);
    throw error;
  }
}

/**
 * Gets all status changes for a specific order
 */
export async function getOrderStatusHistory(orderId: number) {
  try {
    const history = await db.execute(sql`
      SELECT * FROM order_status_history 
      WHERE order_id = ${orderId}
      ORDER BY changed_at DESC
    `);
    
    return history;
  } catch (error) {
    console.error('Error fetching order status history:', error);
    throw error;
  }
}

/**
 * Gets all status changes for all orders of a specific customer
 */
export async function getCustomerOrderStatusHistory(customerId: number) {
  try {
    const history = await db.execute(sql`
      SELECT h.*, o.id as order_id, o.frame_name, o.artwork_description
      FROM order_status_history h
      JOIN orders o ON h.order_id = o.id
      WHERE o.customer_id = ${customerId}
      ORDER BY h.changed_at DESC
    `);
    
    return history;
  } catch (error) {
    console.error('Error fetching customer order status history:', error);
    throw error;
  }
}

/**
 * Notifies customer about status change if they have notifications enabled
 */
export async function notifyCustomerOfStatusChange(order: Order, previousStatus: string, newStatus: string) {
  try {
    if (!order.customerId) return;
    
    // Get customer details including notification preferences
    const [customer] = await db.execute(sql`
      SELECT * FROM customers WHERE id = ${order.customerId}
    `);
    
    if (!customer || !customer.status_notifications_enabled) {
      return;
    }
    
    // Send email notification
    await emailService.sendOrderStatusUpdate(
      customer.email,
      customer.name,
      order.id,
      newStatus,
      order.dueDate
    );
    
    return true;
  } catch (error) {
    console.error('Error notifying customer of status change:', error);
    return false;
  }
}
