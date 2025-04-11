-- Add previousStatus column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS previous_status TEXT;