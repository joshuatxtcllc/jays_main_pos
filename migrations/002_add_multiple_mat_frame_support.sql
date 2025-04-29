-- Migration script to add support for multiple mats and frames

-- Step 1: Add new columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS use_multiple_mats BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS use_multiple_frames BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 2: Create order_mats table for multiple mat support
CREATE TABLE IF NOT EXISTS order_mats (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  mat_color_id TEXT NOT NULL REFERENCES mat_colors(id),
  position INTEGER NOT NULL, -- 1, 2, 3 for top, middle, bottom mats
  width NUMERIC NOT NULL, -- Width of mat in inches
  offset NUMERIC NOT NULL DEFAULT 0, -- Offset from previous mat in inches
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 3: Create order_frames table for multiple frame support
CREATE TABLE IF NOT EXISTS order_frames (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  frame_id TEXT NOT NULL REFERENCES frames(id),
  position INTEGER NOT NULL, -- 1, 2 for inner and outer frames
  distance NUMERIC NOT NULL DEFAULT 0, -- Distance from artwork in inches
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 4: Enhance larson_juhl_catalog table
-- Add new columns if they don't exist
ALTER TABLE larson_juhl_catalog
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'matboard',
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS width NUMERIC,
ADD COLUMN IF NOT EXISTS depth NUMERIC,
ADD COLUMN IF NOT EXISTS edge_texture TEXT,
ADD COLUMN IF NOT EXISTS corner TEXT,
ADD COLUMN IF NOT EXISTS catalog_image TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Step 5: Make hex_color nullable for frames in the catalog
-- Since we need to support both matboards (with hex_color) and frames (without)
ALTER TABLE larson_juhl_catalog
ALTER COLUMN hex_color DROP NOT NULL;

-- Step 6: Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_order_mats_order_id ON order_mats(order_id);
CREATE INDEX IF NOT EXISTS idx_order_frames_order_id ON order_frames(order_id);
CREATE INDEX IF NOT EXISTS idx_larson_juhl_catalog_type ON larson_juhl_catalog(type);