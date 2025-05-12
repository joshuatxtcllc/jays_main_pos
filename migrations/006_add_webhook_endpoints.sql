
-- Create webhook_endpoints table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT NOT NULL, -- JSON array of events
  active INTEGER DEFAULT 1,
  createdAt TEXT NOT NULL,
  lastTriggered TEXT,
  failCount INTEGER DEFAULT 0
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_webhook_active ON webhook_endpoints(active);
