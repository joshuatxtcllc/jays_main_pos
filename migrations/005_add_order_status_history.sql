
-- Create a table to track order status changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  previous_status TEXT,
  new_status TEXT,
  changed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- Add notification preference flag to customers table if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS status_notifications_enabled BOOLEAN DEFAULT true;
