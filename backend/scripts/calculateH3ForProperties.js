import pg from 'pg';
import { latLngToCell } from 'h3-js';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function calculateH3ForProperties() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Calculating H3 indexes for existing properties...');

    // Fetch all properties
    const { rows: properties } = await pool.query(
      'SELECT id, lat, lng FROM properties'
    );

    console.log(`Found ${properties.length} properties to process`);

    let updated = 0;
    for (const property of properties) {
      const { id, lat, lng } = property;

      // Calculate H3 indexes at three resolutions
      const h3_r7 = latLngToCell(lat, lng, 7); // Walking (~1.22km edge)
      const h3_r6 = latLngToCell(lat, lng, 6); // Biking (~3.23km edge)
      const h3_r5 = latLngToCell(lat, lng, 5); // Driving (~8.54km edge)

      // Update property with H3 indexes
      await pool.query(
        `UPDATE properties
         SET h3_index_r7 = $1, h3_index_r6 = $2, h3_index_r5 = $3
         WHERE id = $4`,
        [h3_r7, h3_r6, h3_r5, id]
      );

      updated++;
      if (updated % 10 === 0) {
        console.log(`  Processed ${updated}/${properties.length} properties...`);
      }
    }

    console.log(`✅ Successfully calculated H3 indexes for ${updated} properties!`);
    console.log('   Resolution 7 (walking): ~1.22km edge');
    console.log('   Resolution 6 (biking): ~3.23km edge');
    console.log('   Resolution 5 (driving): ~8.54km edge');

  } catch (error) {
    console.error('❌ H3 calculation failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

calculateH3ForProperties();
