-- Add hub integration fields to material_orders table
ALTER TABLE material_orders 
  ADD COLUMN IF NOT EXISTS hub_order_id TEXT,
  ADD COLUMN IF NOT EXISTS hub_sync_status TEXT DEFAULT 'not_synced',
  ADD COLUMN IF NOT EXISTS hub_last_sync_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS hub_tracking_info TEXT,
  ADD COLUMN IF NOT EXISTS hub_estimated_delivery TIMESTAMP,
  ADD COLUMN IF NOT EXISTS hub_supplier_notes TEXT;