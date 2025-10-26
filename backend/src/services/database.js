import pg from 'pg';
import dotenv from 'dotenv';
import { cellToBoundary } from 'h3-js';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Database query methods
// Helper function to transform snake_case DB columns to camelCase for frontend
const transformProperty = (row) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  lat: parseFloat(row.lat),
  lng: parseFloat(row.lng),
  price: parseFloat(row.price),
  bedrooms: row.bedrooms,
  bathrooms: parseFloat(row.bathrooms),
  sqFt: row.sq_ft,
  propertyType: row.property_type,
  saleType: row.sale_type,
  description: row.description,
  imageUrl: row.image_url
});

export const db = {
  /**
   * Get all properties with optional filters
   */
  async getAllProperties(filters = {}) {
    const { minPrice, maxPrice, bedrooms, bathrooms, propertyType, listingType } = filters;

    let query = `
      SELECT
        id,
        name,
        address,
        lat,
        lng,
        price,
        bedrooms,
        bathrooms,
        sq_ft,
        property_type,
        sale_type,
        description,
        image_url
      FROM properties
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (minPrice) {
      query += ` AND price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    if (bedrooms) {
      query += ` AND bedrooms = $${paramCount}`;
      params.push(parseInt(bedrooms));
      paramCount++;
    }

    if (bathrooms) {
      query += ` AND bathrooms >= $${paramCount}`;
      params.push(parseFloat(bathrooms));
      paramCount++;
    }

    if (propertyType) {
      query += ` AND property_type = $${paramCount}`;
      params.push(propertyType);
      paramCount++;
    }

    if (listingType) {
      query += ` AND sale_type = $${paramCount}`;
      params.push(listingType);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows.map(transformProperty);
  },

  /**
   * Get properties within map bounds with optional filters and amenity counts
   */
  async getPropertiesInBounds(bounds, filters = {}, transportMode = 'walking', selectedAmenities = []) {
    const { north, south, east, west } = bounds;
    const { minPrice, maxPrice, bedrooms, bathrooms, propertyType, listingType } = filters;

    // Determine H3 resolution based on transport mode
    const h3Resolution = {
      'walking': 'h3_index_r7',
      'bicycling': 'h3_index_r6',
      'driving': 'h3_index_r5',
      'transit': 'h3_index_r7' // transit users walk to/from stops
    }[transportMode] || 'h3_index_r7';

    // Build amenity counts for all 8 types
    const amenityTypes = ['park', 'grocery', 'cafe', 'restaurant', 'transit_station', 'gym', 'pharmacy', 'community_center'];

    const amenityCounts = amenityTypes.map(type =>
      `COUNT(DISTINCT CASE WHEN a.type = '${type}' THEN a.id END) as ${type}_count`
    ).join(',\n        ');

    let query = `
      SELECT
        p.id,
        p.name,
        p.address,
        p.lat,
        p.lng,
        p.price,
        p.bedrooms,
        p.bathrooms,
        p.sq_ft,
        p.property_type,
        p.sale_type,
        p.description,
        p.image_url,
        ${amenityCounts}
      FROM properties p
      LEFT JOIN amenities a ON p.${h3Resolution} = a.${h3Resolution}
      WHERE p.lat BETWEEN $1 AND $2
        AND p.lng BETWEEN $3 AND $4
    `;

    const params = [south, north, west, east];
    let paramCount = 5;

    if (minPrice) {
      query += ` AND p.price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND p.price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    if (bedrooms) {
      query += ` AND p.bedrooms = $${paramCount}`;
      params.push(parseInt(bedrooms));
      paramCount++;
    }

    if (bathrooms) {
      query += ` AND p.bathrooms >= $${paramCount}`;
      params.push(parseFloat(bathrooms));
      paramCount++;
    }

    if (propertyType) {
      query += ` AND p.property_type = $${paramCount}`;
      params.push(propertyType);
      paramCount++;
    }

    if (listingType) {
      query += ` AND p.sale_type = $${paramCount}`;
      params.push(listingType);
      paramCount++;
    }

    query += ` GROUP BY p.id, p.name, p.address, p.lat, p.lng, p.price, p.bedrooms, p.bathrooms, p.sq_ft, p.property_type, p.sale_type, p.description, p.image_url`;
    query += ' LIMIT 100'; // Reasonable limit for map viewport

    const result = await pool.query(query, params);

    return result.rows.map(row => ({
      ...transformProperty(row),
      amenityCounts: {
        park: parseInt(row.park_count) || 0,
        grocery: parseInt(row.grocery_count) || 0,
        cafe: parseInt(row.cafe_count) || 0,
        restaurant: parseInt(row.restaurant_count) || 0,
        transit_station: parseInt(row.transit_station_count) || 0,
        gym: parseInt(row.gym_count) || 0,
        pharmacy: parseInt(row.pharmacy_count) || 0,
        community_center: parseInt(row.community_center_count) || 0
      }
    }));
  },

  /**
   * Get single property by ID
   */
  async getPropertyById(id) {
    const query = `
      SELECT
        id,
        name,
        address,
        lat,
        lng,
        price,
        bedrooms,
        bathrooms,
        sq_ft,
        property_type,
        sale_type,
        description,
        image_url,
        created_at
      FROM properties
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] ? transformProperty(result.rows[0]) : null;
  },

  /**
   * Create new property
   */
  async createProperty(propertyData) {
    const {
      name,
      address,
      lat,
      lng,
      price,
      bedrooms,
      bathrooms,
      sq_ft,
      property_type,
      sale_type,
      description,
      image_url
    } = propertyData;

    const query = `
      INSERT INTO properties (
        name,
        address,
        lat,
        lng,
        price,
        bedrooms,
        bathrooms,
        sq_ft,
        property_type,
        sale_type,
        description,
        image_url
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      )
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      address,
      lat,
      lng,
      price,
      bedrooms,
      bathrooms,
      sq_ft,
      property_type,
      sale_type,
      description,
      image_url
    ]);

    return result.rows[0] ? transformProperty(result.rows[0]) : null;
  },

  /**
   * Get amenities for a property's H3 hex
   * Returns: { property, hexBoundary, amenities }
   */
  async getAmenitiesForProperty(propertyId, transportMode = 'walking') {
    // Determine H3 resolution based on transport mode
    const h3Resolution = {
      'walking': 'h3_index_r7',
      'bicycling': 'h3_index_r6',
      'driving': 'h3_index_r5',
      'transit': 'h3_index_r7'
    }[transportMode] || 'h3_index_r7';

    // Get property with its H3 index
    const propertyQuery = `
      SELECT
        id, name, address, lat, lng, price, bedrooms, bathrooms, sq_ft,
        property_type, sale_type, description, image_url,
        h3_index_r7, h3_index_r6, h3_index_r5
      FROM properties
      WHERE id = $1
    `;

    const propertyResult = await pool.query(propertyQuery, [propertyId]);

    if (propertyResult.rows.length === 0) {
      return null;
    }

    const property = transformProperty(propertyResult.rows[0]);
    const h3Index = propertyResult.rows[0][h3Resolution];

    if (!h3Index) {
      return {
        property,
        hexBoundary: null,
        amenities: []
      };
    }

    // Get hex boundary using h3-js
    const boundary = cellToBoundary(h3Index, true); // true for [lat, lng] format
    const hexBoundary = boundary.map(([lat, lng]) => ({ lat, lng }));

    // Get only the closest amenity of each type using distance calculation
    const amenitiesQuery = `
      WITH distances AS (
        SELECT
          id, name, type, address, lat, lng, osm_id,
          (
            6371000 * acos(
              cos(radians($2)) * cos(radians(lat)) *
              cos(radians(lng) - radians($3)) +
              sin(radians($2)) * sin(radians(lat))
            )
          ) as distance_meters,
          ROW_NUMBER() OVER (PARTITION BY type ORDER BY (
            6371000 * acos(
              cos(radians($2)) * cos(radians(lat)) *
              cos(radians(lng) - radians($3)) +
              sin(radians($2)) * sin(radians(lat))
            )
          )) as rn
        FROM amenities
        WHERE ${h3Resolution} = $1
      )
      SELECT id, name, type, address, lat, lng, osm_id, distance_meters
      FROM distances
      WHERE rn = 1
      ORDER BY type
    `;

    const amenitiesResult = await pool.query(amenitiesQuery, [
      h3Index,
      property.lat,
      property.lng
    ]);

    const amenities = amenitiesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      address: row.address,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      osmId: row.osm_id,
      distance: Math.round(parseFloat(row.distance_meters))
    }));

    return {
      property,
      hexBoundary,
      amenities,
      h3Index,
      transportMode
    };
  }
};

export { pool };
