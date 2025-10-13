-- Add normalized address fields to missions table
ALTER TABLE missions
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS street_number TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Italia',
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lon DOUBLE PRECISION;

-- Add indexes for geographic queries
CREATE INDEX IF NOT EXISTS idx_missions_city ON missions(city);
CREATE INDEX IF NOT EXISTS idx_missions_coordinates ON missions(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;

-- Add normalized address fields to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS street_number TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Add comment for documentation
COMMENT ON COLUMN missions.street IS 'Street name from Mapbox geocoding';
COMMENT ON COLUMN missions.street_number IS 'Street number/civic number';
COMMENT ON COLUMN missions.city IS 'City name';
COMMENT ON COLUMN missions.province IS 'Province/region';
COMMENT ON COLUMN missions.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN missions.lat IS 'Latitude coordinate';
COMMENT ON COLUMN missions.lon IS 'Longitude coordinate';