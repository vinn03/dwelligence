import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Sample properties in San Francisco, CA
const sampleProperties = [
  {
    name: null,
    address: "123 Market St, San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    price: 3500,
    bedrooms: 2,
    bathrooms: 1,
    sq_ft: 900,
    property_type: "apartment",
    sale_type: "rent",
    description: "Modern downtown apartment with city views",
    image_url:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  },
  {
    name: null,
    address: "456 Mission St, San Francisco, CA",
    lat: 37.7858,
    lng: -122.4064,
    price: 4200,
    bedrooms: 3,
    bathrooms: 2,
    sq_ft: 1200,
    property_type: "apartment",
    sale_type: "rent",
    description: "Spacious 3-bedroom in SOMA",
    image_url:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
  },
  {
    name: null,
    address: "789 Valencia St, San Francisco, CA",
    lat: 37.7599,
    lng: -122.4214,
    price: 2800,
    bedrooms: 1,
    bathrooms: 1,
    sq_ft: 650,
    property_type: "apartment",
    sale_type: "rent",
    description: "Cozy studio in vibrant Mission District",
    image_url:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  },
  {
    name: null,
    address: "321 Hayes St, San Francisco, CA",
    lat: 37.7765,
    lng: -122.4244,
    price: 3200,
    bedrooms: 2,
    bathrooms: 1.5,
    sq_ft: 950,
    property_type: "apartment",
    sale_type: "rent",
    description: "Beautiful apartment in Hayes Valley",
    image_url:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  },
  {
    name: null,
    address: "654 Haight St, San Francisco, CA",
    lat: 37.7699,
    lng: -122.4469,
    price: 3000,
    bedrooms: 2,
    bathrooms: 2,
    sq_ft: 1000,
    property_type: "apartment",
    sale_type: "rent",
    description: "Trendy apartment in iconic Haight-Ashbury",
    image_url:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  },
  {
    name: null,
    address: "987 Folsom St, San Francisco, CA",
    lat: 37.7795,
    lng: -122.4056,
    price: 2900,
    bedrooms: 1,
    bathrooms: 1,
    sq_ft: 750,
    property_type: "apartment",
    sale_type: "rent",
    description: "Modern 1-bedroom loft in SOMA",
    image_url:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
  },
  {
    name: null,
    address: "159 Grant Ave, San Francisco, CA",
    lat: 37.7909,
    lng: -122.4056,
    price: 2400,
    bedrooms: 1,
    bathrooms: 1,
    sq_ft: 600,
    property_type: "apartment",
    sale_type: "rent",
    description: "Character apartment in Chinatown",
    image_url:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  },
  {
    name: "The Embarcadero Residences",
    address: "753 The Embarcadero, San Francisco, CA",
    lat: 37.7956,
    lng: -122.3933,
    price: 5500,
    bedrooms: 3,
    bathrooms: 2.5,
    sq_ft: 1600,
    property_type: "apartment",
    sale_type: "rent",
    description: "Luxury waterfront apartment with Bay views",
    image_url:
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800",
  },
  {
    name: null,
    address: "852 Post St, San Francisco, CA",
    lat: 37.7875,
    lng: -122.4138,
    price: 3300,
    bedrooms: 2,
    bathrooms: 1,
    sq_ft: 850,
    property_type: "apartment",
    sale_type: "rent",
    description: "Modern apartment near Union Square",
    image_url:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
  },
  {
    name: null,
    address: "246 Divisadero St, San Francisco, CA",
    lat: 37.7716,
    lng: -122.4376,
    price: 3400,
    bedrooms: 2,
    bathrooms: 2,
    sq_ft: 1050,
    property_type: "apartment",
    sale_type: "rent",
    description: "Stylish apartment in trendy NoPa",
    image_url:
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
  },
];

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log("🌱 Starting database seed...");

    // Clear existing data
    await client.query("TRUNCATE TABLE properties RESTART IDENTITY CASCADE");
    console.log("✅ Cleared existing properties");

    // Insert sample properties
    for (const property of sampleProperties) {
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
      `;

      await client.query(query, [
        property.name,
        property.address,
        property.lat,
        property.lng,
        property.price,
        property.bedrooms,
        property.bathrooms,
        property.sq_ft,
        property.property_type,
        property.sale_type,
        property.description,
        property.image_url,
      ]);
    }

    console.log(`✅ Seeded ${sampleProperties.length} properties`);
    console.log("🎉 Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seedDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
