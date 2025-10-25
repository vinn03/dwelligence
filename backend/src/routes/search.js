import express from 'express';

const router = express.Router();

// NOTE: AI-powered search is Iteration 3
// This file is a placeholder for future implementation

// POST /api/search/ai - Natural language search (Iteration 3)
router.post('/ai', async (req, res, next) => {
  res.status(501).json({
    error: 'AI search not implemented yet',
    message: 'This feature will be available in Iteration 3'
  });
});

export default router;
