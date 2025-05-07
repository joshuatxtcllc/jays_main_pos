
import db from '../db';

/**
 * Find an order by its order number
 */
export const findOrderByNumber = async (orderNumber: string) => {
  try {
    // Query to find an order by its order number
    const result = await db.query(
      `SELECT 
        id, customer_name as "customerName", 
        frame_width as "frameWidth", frame_height as "frameHeight",
        frame_style as "frameStyle", mat_description as "matDescription",
        glass_type as "glassType", status, total_price as "totalPrice",
        created_at as "createdAt"
      FROM orders 
      WHERE order_number = $1`,
      [orderNumber]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error finding order by number:', error);
    throw error;
  }
};

/**
 * Get orders that will be ready soon (within the next 3 days)
 */
export const getOrdersReadySoon = async () => {
  try {
    const result = await db.query(
      `SELECT 
        id, order_number as "orderNumber", 
        customer_name as "customerName", 
        status, 
        estimated_completion_date as "estimatedCompletionDate"
      FROM orders 
      WHERE status NOT IN ('Complete', 'Picked Up', 'Canceled') 
      AND estimated_completion_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '3 days')
      ORDER BY estimated_completion_date ASC`
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting orders ready soon:', error);
    throw error;
  }
};
