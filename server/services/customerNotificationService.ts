
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { OrderStatusHistoryEntry } from '../types';

/**
 * Gets all notifications for a specific customer
 */
export async function getCustomerNotifications(customerId: number, limit: number = 50) {
  try {
    const notifications = await db.execute(sql`
      SELECT 
        n.*,
        o.id as order_id,
        o.frame_name,
        o.artwork_description
      FROM 
        customer_notifications n
      JOIN 
        orders o ON n.order_id = o.id
      WHERE 
        o.customer_id = ${customerId}
      ORDER BY 
        n.created_at DESC
      LIMIT ${limit}
    `);
    
    return notifications;
  } catch (error) {
    console.error('Error fetching customer notifications:', error);
    throw error;
  }
}

/**
 * Creates a new notification for a customer
 */
export async function createCustomerNotification(
  customerId: number, 
  orderId: number, 
  type: string, 
  message: string
) {
  try {
    const notification = await db.execute(sql`
      INSERT INTO customer_notifications (
        customer_id, 
        order_id, 
        type, 
        message, 
        created_at
      ) VALUES (
        ${customerId}, 
        ${orderId}, 
        ${type}, 
        ${message}, 
        NOW()
      ) RETURNING *
    `);
    
    return notification[0];
  } catch (error) {
    console.error('Error creating customer notification:', error);
    throw error;
  }
}

/**
 * Mark customer notifications as read
 */
export async function markNotificationsAsRead(notificationIds: number[]) {
  try {
    await db.execute(sql`
      UPDATE customer_notifications 
      SET read = true 
      WHERE id IN (${sql.join(notificationIds)})
    `);
    
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
}
