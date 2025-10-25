-- Properties table (Iteration 1)
-- No PostGIS needed! Using simple lat/lng columns
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,

  -- Property details
  name TEXT, -- For apartment complex names (optional)
  address TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  sq_ft INTEGER,
  property_type VARCHAR(50), -- 'apartment', 'house'
  sale_type VARCHAR(20), -- 'rent', 'sale'

  -- Location
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,

  -- Display
  description TEXT,
  image_url TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for viewport queries (lat/lng bounds)
CREATE INDEX IF NOT EXISTS idx_properties_lat ON properties(lat);
CREATE INDEX IF NOT EXISTS idx_properties_lng ON properties(lng);

-- Indexes for common filters
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_sale_type ON properties(sale_type);

-- Commute cache table (optional optimization for Iteration 1)
CREATE TABLE IF NOT EXISTS commute_cache (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  workplace_lat DECIMAL(10, 8) NOT NULL,
  workplace_lng DECIMAL(11, 8) NOT NULL,
  transport_mode VARCHAR(20) NOT NULL, -- 'driving', 'walking', 'bicycling', 'transit'
  duration_seconds INTEGER NOT NULL,
  distance_meters INTEGER NOT NULL,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, workplace_lat, workplace_lng, transport_mode)
);

CREATE INDEX IF NOT EXISTS idx_commute_cache_property ON commute_cache(property_id);
CREATE INDEX IF NOT EXISTS idx_commute_cache_lookup ON commute_cache(property_id, workplace_lat, workplace_lng, transport_mode);

-- NOTE: The following tables are for future iterations and are commented out for now

-- -- Amenities table (Iteration 2)
-- -- Using simple lat/lng + H3 indexes for proximity queries
-- CREATE TABLE IF NOT EXISTS amenities (
--   id SERIAL PRIMARY KEY,
--   name TEXT NOT NULL,
--   type VARCHAR(50) NOT NULL, -- 'park', 'cafe', 'restaurant', 'grocery', 'gym', 'transit_stop'
--   address TEXT,
--   lat DECIMAL(10, 8) NOT NULL,
--   lng DECIMAL(11, 8) NOT NULL,
--   h3_index_r7 VARCHAR(15), -- H3 resolution 7 (walkable, ~1.22km edge)
--   h3_index_r6 VARCHAR(15), -- H3 resolution 6 (bikeable, ~3.23km edge)
--   h3_index_r5 VARCHAR(15), -- H3 resolution 5 (drivable, ~8.54km edge)
--   google_place_id VARCHAR(255),
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE INDEX IF NOT EXISTS idx_amenities_type ON amenities(type);
-- CREATE INDEX IF NOT EXISTS idx_amenities_h3_r7 ON amenities(h3_index_r7);
-- CREATE INDEX IF NOT EXISTS idx_amenities_h3_r6 ON amenities(h3_index_r6);
-- CREATE INDEX IF NOT EXISTS idx_amenities_h3_r5 ON amenities(h3_index_r5);

-- -- H3 columns for properties (Iteration 2)
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS h3_index_r7 VARCHAR(15);
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS h3_index_r6 VARCHAR(15);
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS h3_index_r5 VARCHAR(15);

-- CREATE INDEX IF NOT EXISTS idx_properties_h3_r7 ON properties(h3_index_r7);
-- CREATE INDEX IF NOT EXISTS idx_properties_h3_r6 ON properties(h3_index_r6);
-- CREATE INDEX IF NOT EXISTS idx_properties_h3_r5 ON properties(h3_index_r5);
