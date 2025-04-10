-- Create Larson Juhl catalog table
CREATE TABLE IF NOT EXISTS "larson_juhl_catalog" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "manufacturer" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "colorHex" TEXT,
  "price" TEXT NOT NULL,
  "dimensions" TEXT,
  "thickness" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on manufacturer for faster queries
CREATE INDEX IF NOT EXISTS "larson_juhl_catalog_manufacturer_idx" ON "larson_juhl_catalog" ("manufacturer");
CREATE INDEX IF NOT EXISTS "larson_juhl_catalog_category_idx" ON "larson_juhl_catalog" ("category");