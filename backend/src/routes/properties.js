import express from 'express';
import { db } from '../services/database.js';
import { answerPOIQuery } from '../services/gemini.js';
import { Client } from '@googlemaps/google-maps-services-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const googleMapsClient = new Client({});

// GET /api/properties - Get all properties with optional filters
router.get('/', async (req, res, next) => {
  try {
    const {
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      listingType
    } = req.query;

    // TODO: Implement filtering logic
    const properties = await db.getAllProperties({
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      listingType
    });

    res.json(properties);
  } catch (error) {
    next(error);
  }
});

// GET /api/properties/map-bounds - Get properties within viewport bounds with filters
router.get('/map-bounds', async (req, res, next) => {
  try {
    const {
      north,
      south,
      east,
      west,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      listingType,
      transportMode // 'walking', 'bicycling', 'driving', 'transit'
    } = req.query;

    if (!north || !south || !east || !west) {
      return res.status(400).json({
        error: 'Missing required bounds parameters (north, south, east, west)'
      });
    }

    const bounds = {
      north: parseFloat(north),
      south: parseFloat(south),
      east: parseFloat(east),
      west: parseFloat(west)
    };

    const filters = {
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      listingType
    };

    // Get properties with amenity counts
    const properties = await db.getPropertiesInBounds(
      bounds,
      filters,
      transportMode || 'walking'
    );

    res.json(properties);
  } catch (error) {
    next(error);
  }
});

// GET /api/properties/:id/amenities - Get amenities for a property's hex
router.get('/:id/amenities', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transportMode } = req.query;

    const result = await db.getAmenitiesForProperty(
      parseInt(id),
      transportMode || 'walking'
    );

    if (!result) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/properties/:id - Get single property details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Implement single property lookup
    const property = await db.getPropertyById(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    next(error);
  }
});

// POST /api/properties - Create new property (for testing/seeding)
router.post('/', async (req, res, next) => {
  try {
    const propertyData = req.body;

    // TODO: Implement property creation
    const newProperty = await db.createProperty(propertyData);

    res.status(201).json(newProperty);
  } catch (error) {
    next(error);
  }
});

// POST /api/properties/:id/ask - Ask questions about nearby POIs for a property
router.post('/:id/ask', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        error: 'Question is required',
        message: 'Please provide a valid question'
      });
    }

    console.log(`[POI Query] Property ${id}, Question: "${question}"`);

    // Get property details
    const property = await db.getPropertyById(parseInt(id));

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Use Google Places API to search for nearby POIs based on question
    // Extract search keywords from question (simplified approach)
    const searchKeywords = question
      .toLowerCase()
      .replace(/\b(where|what|is|are|there|any|nearby|near|close|around|the|a|an)\b/g, '')
      .trim();

    console.log(`[POI Query] Search keywords: "${searchKeywords}"`);

    // Search for nearby places
    let nearbyPOIs = [];

    try {
      const placesResponse = await googleMapsClient.placesNearby({
        params: {
          location: { lat: property.lat, lng: property.lng },
          radius: 1500, // 1.5km radius
          keyword: searchKeywords,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      if (placesResponse.data.results) {
        // Get top 10 results
        nearbyPOIs = placesResponse.data.results.slice(0, 10).map(place => ({
          name: place.name,
          types: place.types,
          rating: place.rating,
          vicinity: place.vicinity,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          placeId: place.place_id
        }));
      }

      console.log(`[POI Query] Found ${nearbyPOIs.length} places from Google Places API`);
    } catch (placesError) {
      console.error('[POI Query] Google Places API error:', placesError);
      // Continue with empty array if Places API fails
    }

    // Use Gemini to generate natural language answer
    const answer = await answerPOIQuery(property, question, nearbyPOIs);

    res.json({
      question,
      answer,
      nearbyPOIs: nearbyPOIs.slice(0, 5), // Return top 5 for reference
      property: {
        id: property.id,
        address: property.address
      }
    });

  } catch (error) {
    console.error('[POI Query] Error:', error);
    next(error);
  }
});

export default router;
