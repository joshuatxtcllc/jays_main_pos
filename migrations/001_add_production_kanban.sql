-- Add new fields to orders table without breaking existing structure
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS production_status TEXT DEFAULT 'order_processed',
ADD COLUMN IF NOT EXISTS last_notification_sent TIMESTAMP,
ADD COLUMN IF NOT EXISTS estimated_completion_days INTEGER,
ADD COLUMN IF NOT EXISTS add_to_wholesale_order BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

-- Create the customer notifications table
CREATE TABLE IF NOT EXISTS customer_notifications (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  order_id INTEGER REFERENCES orders(id),
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  successful BOOLEAN NOT NULL,
  response_data JSONB,
  previous_status TEXT,
  new_status TEXT
);