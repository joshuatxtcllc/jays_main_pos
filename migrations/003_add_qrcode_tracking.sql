-- 003_add_qrcode_tracking.sql

-- Create QR Code tables
CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  last_scanned TIMESTAMP,
  scan_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS qr_code_scans (
  id SERIAL PRIMARY KEY,
  qr_code_id INTEGER REFERENCES qr_codes(id) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  scanned_at TIMESTAMP DEFAULT NOW(),
  location TEXT,
  action TEXT,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS material_locations (
  id SERIAL PRIMARY KEY,
  material_type TEXT NOT NULL,
  material_id TEXT NOT NULL, 
  location_id INTEGER REFERENCES inventory_locations(id) NOT NULL,
  qr_code_id INTEGER REFERENCES qr_codes(id),
  quantity NUMERIC NOT NULL DEFAULT 1,
  notes TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Create index for faster QR code lookup
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_entity ON qr_codes(entity_id, type);
CREATE INDEX IF NOT EXISTS idx_material_locations ON material_locations(material_type, material_id);

-- Function to generate a unique QR code identifier
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random code: JF (Jay's Frames) + random string
    new_code := 'JF' || substring(md5(random()::text) from 1 for 8);
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM qr_codes WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically fill in the QR code field if not provided
CREATE OR REPLACE FUNCTION set_qr_code_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER qr_code_before_insert
  BEFORE INSERT ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION set_qr_code_before_insert();

-- Function to update last_scanned and scan_count when a QR code is scanned
CREATE OR REPLACE FUNCTION update_qr_code_scan_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the last_scanned timestamp and increment scan_count
  UPDATE qr_codes
  SET last_scanned = NOW(), scan_count = scan_count + 1
  WHERE id = NEW.qr_code_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER qr_code_scan_after_insert
  AFTER INSERT ON qr_code_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_code_scan_stats();