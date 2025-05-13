
-- Add the artwork image path column to orders table
ALTER TABLE orders ADD COLUMN artwork_image_path TEXT;

-- Update any existing orders that have artworkImage data to use the new path
-- This will convert any existing base64 data to actual files during app startup
