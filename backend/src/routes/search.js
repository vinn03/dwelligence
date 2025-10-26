import express from 'express';
import { parseSearchQuery, rankProperties } from '../services/gemini.js';
import { db } from '../services/database.js';
import { googleMaps } from '../services/googleMaps.js';

const router = express.Router();

// Helper function to calculate commutes for properties
async function calculateBatchCommutes(properties, workplace, mode) {
  try {
    // Get property IDs
    const propertyIds = properties.map(p => p.id);

    // Calculate commutes using googleMaps service
    const commutes = await googleMaps.batchCalculateCommutes(propertyIds, workplace, mode);

    // Merge commute data back into properties
    return properties.map(property => {
      const commute = commutes.find(c => c.propertyId === property.id);
      return {
        ...property,
        commute: commute || null
      };
    });
  } catch (error) {
    console.error('Error calculating batch commutes:', error);
    // Return properties without commute data rather than failing
    return properties;
  }
}

// POST /api/search/ai - Natural language search (Iteration 3)
router.post('/ai', async (req, res, next) => {
  try {
    const { query, workplace, filters = {}, maxResults = 20 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required',
        message: 'Please provide a valid search query'
      });
    }

    console.log(`[AI Search] Query: "${query}"`);

    // Step 1: Parse query with Gemini
    const searchParams = await parseSearchQuery(query);
    console.log('[AI Search] Parsed parameters:', searchParams);

    // Step 2: Check if transport mode clarity is needed
    if (searchParams.needsTransportModeClarity && !searchParams.transportMode) {
      return res.json({
        query,
        needsClarity: true,
        clarificationQuestion: "I found properties matching your criteria! How would you like to get to nearby amenities? (walking, biking, driving, or transit)",
        suggestion: "Using walking distance by default, but you can specify your preferred mode for more accurate results.",
        defaultMode: 'walking',
        searchParams // Return parsed params so user doesn't lose their query
      });
    }

    // Step 3: Build database filters from parsed params
    const dbFilters = {
      minPrice: searchParams.priceRange?.min || filters.minPrice,
      maxPrice: searchParams.priceRange?.max || filters.maxPrice,
      bedrooms: searchParams.bedrooms?.min || filters.bedrooms,
      bathrooms: searchParams.bathrooms?.min || filters.bathrooms,
      propertyType: searchParams.propertyType || filters.propertyType,
      listingType: searchParams.listingType || filters.listingType
    };

    // Step 4: Query properties from database
    let properties = await db.getAllProperties(dbFilters);
    console.log(`[AI Search] Found ${properties.length} properties from database`);

    // If no properties found, return early
    if (properties.length === 0) {
      return res.json({
        query,
        interpretation: searchParams.summary,
        results: [],
        message: 'No properties match your criteria. Try adjusting your requirements.',
        searchParams
      });
    }

    // Step 5: Filter by amenities if specified
    if (searchParams.amenityPreferences && searchParams.amenityPreferences.length > 0) {
      // Filter properties that have at least one of the preferred amenities
      const transportMode = searchParams.transportMode || 'walking';

      // Get bounds that encompass all properties for amenity query
      const lats = properties.map(p => p.lat);
      const lngs = properties.map(p => p.lng);
      const bounds = {
        north: Math.max(...lats) + 0.1,
        south: Math.min(...lats) - 0.1,
        east: Math.max(...lngs) + 0.1,
        west: Math.min(...lngs) - 0.1
      };

      // Re-query with amenity counts
      properties = await db.getPropertiesInBounds(bounds, dbFilters, transportMode);

      // Filter to properties with at least one preferred amenity
      properties = properties.filter(property => {
        return searchParams.amenityPreferences.some(amenityType => {
          return property.amenityCounts && property.amenityCounts[amenityType] > 0;
        });
      });

      console.log(`[AI Search] After amenity filtering: ${properties.length} properties`);
    }

    // Step 6: Calculate commutes if workplace is provided
    if (workplace && workplace.lat && workplace.lng) {
      const transportMode = searchParams.transportMode || 'transit';
      console.log(`[AI Search] Calculating commutes via ${transportMode}...`);

      try {
        properties = await calculateBatchCommutes(
          properties,
          { lat: workplace.lat, lng: workplace.lng },
          transportMode
        );
      } catch (commuteError) {
        console.error('[AI Search] Commute calculation error:', commuteError);
        // Continue without commute data rather than failing
      }
    }

    // Step 7: Rank properties with Gemini
    console.log('[AI Search] Ranking properties with AI...');
    const rankedResults = await rankProperties(properties, query, workplace);

    // Step 8: Reorder properties based on AI ranking
    const rankedProperties = rankedResults
      .map(item => {
        const property = properties.find(p => p.id === item.id);
        if (property) {
          return {
            ...property,
            aiReason: item.reason // Add AI's reasoning
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, maxResults);

    console.log(`[AI Search] Returning ${rankedProperties.length} ranked results`);

    res.json({
      query,
      interpretation: searchParams.summary,
      results: rankedProperties,
      totalResults: properties.length,
      searchParams
    });

  } catch (error) {
    console.error('[AI Search] Error:', error);
    next(error);
  }
});

export default router;
