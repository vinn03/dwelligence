import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runSchema() {
  const client = await pool.connect();

  try {
    console.log('📋 Reading schema.sql...');
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

    console.log('🚀 Running schema on database...');
    await client.query(schemaSQL);

    console.log('✅ Schema created successfully!');
  } catch (error) {
    console.error('❌ Error running schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runSchema().catch(err => {
  console.error(err);
  process.exit(1);
});
