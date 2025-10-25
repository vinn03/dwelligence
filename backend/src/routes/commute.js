import express from 'express';
import { googleMaps } from '../services/googleMaps.js';

const router = express.Router();

// POST /api/commute/calculate - Calculate commute for multiple properties
router.post('/calculate', async (req, res, next) => {
  try {
    const { workplace, propertyIds, mode = 'transit' } = req.body;

    if (!workplace || !workplace.lat || !workplace.lng) {
      return res.status(400).json({
        error: 'Workplace location required (lat, lng)'
      });
    }

    if (!propertyIds || !Array.isArray(propertyIds)) {
      return res.status(400).json({
        error: 'Property IDs array required'
      });
    }

    // TODO: Implement batch commute calculation using Distance Matrix API
    const commuteResults = await googleMaps.batchCalculateCommutes(
      propertyIds,
      workplace,
      mode
    );

    res.json(commuteResults);
  } catch (error) {
    next(error);
  }
});

// GET /api/commute/batch - Batch calculate commutes for properties in bounds
router.get('/batch', async (req, res, next) => {
  try {
    const { workplaceLat, workplaceLng, mode = 'transit', bounds } = req.query;

    if (!workplaceLat || !workplaceLng) {
      return res.status(400).json({
        error: 'Workplace coordinates required (workplaceLat, workplaceLng)'
      });
    }

    const workplace = {
      lat: parseFloat(workplaceLat),
      lng: parseFloat(workplaceLng)
    };

    // TODO: Get properties in bounds and calculate commutes
    // This combines property lookup + commute calculation
    const results = await googleMaps.calculateCommutesForBounds(
      workplace,
      bounds,
      mode
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
