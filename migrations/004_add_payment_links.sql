-- Add payment links table
CREATE TABLE IF NOT EXISTS payment_links (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  customer_id INTEGER REFERENCES customers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending'
);

-- Add new notification type for payment link
ALTER TABLE customer_notifications 
ADD COLUMN IF NOT EXISTS payment_link_id INTEGER REFERENCES payment_links(id);

-- Add phone verification status to customers
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_notification_channel TEXT DEFAULT 'email';