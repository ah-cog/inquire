CREATE TABLE IF NOT EXISTS structure (
  id UUID PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL,
  text TEXT,
  properties JSONB,
  components UUID[],
  context JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS structure_type_idx ON structure(type);
CREATE INDEX IF NOT EXISTS structure_created_idx ON structure(created_at DESC);
