-- Seed data for Dwelligence (San Francisco properties)
-- Run this in Supabase SQL Editor

-- Clear existing data
TRUNCATE TABLE properties RESTART IDENTITY CASCADE;

-- Insert San Francisco properties
INSERT INTO properties (name, address, lat, lng, price, bedrooms, bathrooms, sq_ft, property_type, sale_type, description, image_url)
VALUES
  (NULL, '123 Market St, San Francisco, CA', 37.7749, -122.4194, 3500, 2, 1, 900, 'apartment', 'rent', 'Modern downtown apartment with city views', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'),
  (NULL, '456 Mission St, San Francisco, CA', 37.7858, -122.4064, 4200, 3, 2, 1200, 'apartment', 'rent', 'Spacious 3-bedroom in SOMA', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),
  (NULL, '789 Valencia St, San Francisco, CA', 37.7599, -122.4214, 2800, 1, 1, 650, 'apartment', 'rent', 'Cozy studio in vibrant Mission District', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'),
  (NULL, '321 Hayes St, San Francisco, CA', 37.7765, -122.4244, 3200, 2, 1.5, 950, 'apartment', 'rent', 'Beautiful apartment in Hayes Valley', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'),
  (NULL, '654 Haight St, San Francisco, CA', 37.7699, -122.4469, 3000, 2, 2, 1000, 'apartment', 'rent', 'Trendy apartment in iconic Haight-Ashbury', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'),
  (NULL, '987 Folsom St, San Francisco, CA', 37.7795, -122.4056, 2900, 1, 1, 750, 'apartment', 'rent', 'Modern 1-bedroom loft in SOMA', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'),
  (NULL, '159 Grant Ave, San Francisco, CA', 37.7909, -122.4056, 2400, 1, 1, 600, 'apartment', 'rent', 'Character apartment in Chinatown', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'),
  ('The Embarcadero Residences', '753 The Embarcadero, San Francisco, CA', 37.7956, -122.3933, 5500, 3, 2.5, 1600, 'apartment', 'rent', 'Luxury waterfront apartment with Bay views', 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800'),
  (NULL, '852 Post St, San Francisco, CA', 37.7875, -122.4138, 3300, 2, 1, 850, 'apartment', 'rent', 'Modern apartment near Union Square', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'),
  (NULL, '246 Divisadero St, San Francisco, CA', 37.7716, -122.4376, 3400, 2, 2, 1050, 'apartment', 'rent', 'Stylish apartment in trendy NoPa', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800');

-- Verify the insert
SELECT COUNT(*) as total_properties FROM properties;
SELECT * FROM properties ORDER BY id;
