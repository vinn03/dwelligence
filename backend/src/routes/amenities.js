import express from 'express';

const router = express.Router();

// NOTE: Amenities are Iteration 2
// This file is a placeholder for future implementation

// GET /api/amenities/nearby - Get nearby amenities (Iteration 2)
router.get('/nearby', async (req, res, next) => {
  res.status(501).json({
    error: 'Amenities not implemented yet',
    message: 'This feature will be available in Iteration 2'
  });
});

export default router;
