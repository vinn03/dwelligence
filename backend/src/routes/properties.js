import express from 'express';
import { db } from '../services/database.js';

const router = express.Router();

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
      transportMode, // 'walking', 'bicycling', 'driving', 'transit'
      amenities // Comma-separated amenity types: 'park,cafe,grocery'
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

    // Parse amenities filter
    const selectedAmenities = amenities ? amenities.split(',').filter(Boolean) : [];

    // Get properties with amenity counts
    const properties = await db.getPropertiesInBounds(
      bounds,
      filters,
      transportMode || 'walking',
      selectedAmenities
    );

    res.json(properties);
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

export default router;
