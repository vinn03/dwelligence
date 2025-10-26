import pg from 'pg';
import { latLngToCell } from 'h3-js';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Radius in meters around each property to search for amenities
const SEARCH_RADIUS_METERS = 5000; // 5km should cover most amenities

// Amenity types with their OSM query filters
const AMENITY_TYPES = {
  park: {
    query: `(
  node["leisure"="park"];
  way["leisure"="park"];
);`,
  },
  grocery: {
    query: `(
  node["shop"~"supermarket|convenience|grocery"];
  way["shop"~"supermarket|convenience|grocery"];
);`,
  },
  cafe: {
    query: `(
  node["amenity"="cafe"];
  way["amenity"="cafe"];
);`,
  },
  restaurant: {
    query: `(
  node["amenity"="restaurant"];
  way["amenity"="restaurant"];
);`,
  },
  transit_station: {
    query: `(
  node["railway"~"station|subway_entrance"];
  node["highway"="bus_stop"];
  way["railway"~"station|subway_entrance"];
);`,
  },
  gym: {
    query: `(
  node["leisure"="fitness_centre"];
  way["leisure"="fitness_centre"];
);`,
  },
  pharmacy: {
    query: `(
  node["amenity"="pharmacy"];
  way["amenity"="pharmacy"];
);`,
  },
  community_center: {
    query: `(
  node["amenity"="community_centre"];
  way["amenity"="community_centre"];
);`,
  },
};

async function fetchOverpassData(query, minLat, minLng, maxLat, maxLng) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const fullQuery = `[out:json][timeout:90][bbox:${minLat},${minLng},${maxLat},${maxLng}];
${query}
out center;`;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(fullQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Error fetching from Overpass API:', error.message);
    return [];
  }
}

function extractLatLng(element) {
  // For nodes, use lat/lon directly
  if (element.lat && element.lon) {
    return { lat: element.lat, lng: element.lon };
  }
  // For ways/relations, use center if available
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

async function fetchOSMAmenities() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Fetching amenities from OpenStreetMap...');
    console.log(`Search radius: ${SEARCH_RADIUS_METERS}m around each property`);
    console.log('');

    // Get all property locations
    const { rows: properties } = await pool.query(
      'SELECT id, lat, lng, address FROM properties ORDER BY id'
    );
    console.log(`Found ${properties.length} properties to search around`);
    console.log('');

    // Calculate a combined bounding box around all properties
    const lats = properties.map(p => p.lat);
    const lngs = properties.map(p => p.lng);
    const minLat = Math.min(...lats) - 0.05; // ~5km buffer
    const maxLat = Math.max(...lats) + 0.05;
    const minLng = Math.min(...lngs) - 0.05;
    const maxLng = Math.max(...lngs) + 0.05;

    console.log(`Combined bounding box: [${minLat.toFixed(2)}, ${minLng.toFixed(2)}, ${maxLat.toFixed(2)}, ${maxLng.toFixed(2)}]`);
    console.log('');

    let totalInserted = 0;
    const seenOsmIds = new Set();

    for (const [type, config] of Object.entries(AMENITY_TYPES)) {
      console.log(`Fetching ${type}...`);

      // Simply pass the query - bbox is already set in the fetchOverpassData function
      const elements = await fetchOverpassData(config.query, minLat, minLng, maxLat, maxLng);
      console.log(`  Found ${elements.length} ${type} amenities`);

      let inserted = 0;
      for (const element of elements) {
        // Skip duplicates
        if (seenOsmIds.has(element.id)) continue;
        seenOsmIds.add(element.id);

        const coords = extractLatLng(element);
        if (!coords) continue;

        const { lat, lng } = coords;
        const name = element.tags?.name || `Unnamed ${type}`;
        const address = element.tags?.['addr:street'] || null;

        // Calculate H3 indexes
        const h3_r7 = latLngToCell(lat, lng, 7);
        const h3_r6 = latLngToCell(lat, lng, 6);
        const h3_r5 = latLngToCell(lat, lng, 5);

        try {
          await pool.query(
            `INSERT INTO amenities (name, type, address, lat, lng, h3_index_r7, h3_index_r6, h3_index_r5, osm_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT DO NOTHING`,
            [name, type, address, lat, lng, h3_r7, h3_r6, h3_r5, element.id.toString()]
          );
          inserted++;
        } catch (error) {
          console.error(`  Error inserting ${type}:`, error.message);
        }
      }

      console.log(`  Inserted ${inserted} ${type} amenities`);
      totalInserted += inserted;

      // Rate limiting: wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('');
    }

    console.log(`✅ Successfully fetched and inserted ${totalInserted} amenities!`);
    console.log('');

    // Show summary
    const { rows } = await pool.query(
      `SELECT type, COUNT(*) as count FROM amenities GROUP BY type ORDER BY count DESC`
    );
    console.log('Amenity summary:');
    rows.forEach((row) => {
      console.log(`  ${row.type}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ OSM fetch failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

fetchOSMAmenities();
