
-- Add artwork fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS artwork_image_path TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS artwork_file_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS artwork_file_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS artwork_upload_date TIMESTAMP;

-- Create order_files table for additional files
CREATE TABLE IF NOT EXISTS order_files (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- qr-code, work-order, invoice, virtual-frame, other
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_order_files_file_type ON order_files(file_type);
