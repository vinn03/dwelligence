import pg from 'pg';
import dotenv from 'dotenv';

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
   * Get properties within map bounds with optional filters
   */
  async getPropertiesInBounds(bounds, filters = {}) {
    const { north, south, east, west } = bounds;
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
      WHERE lat BETWEEN $1 AND $2
        AND lng BETWEEN $3 AND $4
    `;

    const params = [south, north, west, east];
    let paramCount = 5;

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

    query += ' LIMIT 100'; // Reasonable limit for map viewport

    const result = await pool.query(query, params);
    return result.rows.map(transformProperty);
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
  }
};

export { pool };
