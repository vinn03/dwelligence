import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import propertiesRouter from './routes/properties.js';
import mockPropertiesRouter from './routes/mock-properties.js';
import commuteRouter from './routes/commute.js';
import searchRouter from './routes/search.js';
import amenitiesRouter from './routes/amenities.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/properties', propertiesRouter);
app.use('/api/mock-properties', mockPropertiesRouter); // Mock data for MVP
app.use('/api/commute', commuteRouter);
app.use('/api/search', searchRouter);
app.use('/api/amenities', amenitiesRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Dwelligence API running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
