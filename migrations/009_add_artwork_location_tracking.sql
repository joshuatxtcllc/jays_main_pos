
-- Add artwork location tracking fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS artwork_storage_location TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS artwork_location_image_path TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS artwork_location_updated_at TIMESTAMP;
