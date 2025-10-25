import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Properties API
export const propertiesAPI = {
  // Get all properties with filters (using mock data for MVP)
  getAll: (filters = {}) => {
    return api.get('/mock-properties', { params: filters });
  },

  // Get properties within map bounds with filters (using mock data for MVP)
  getInBounds: (bounds, filters = {}) => {
    return api.get('/mock-properties/map-bounds', {
      params: { ...bounds, ...filters }
    });
  },

  // Get single property (using mock data for MVP)
  getById: (id) => {
    return api.get(`/mock-properties/${id}`);
  },

  // Create property (for testing)
  create: (propertyData) => {
    return api.post('/properties', propertyData);
  }
};

// Commute API
export const commuteAPI = {
  // Calculate commutes for multiple properties
  calculate: (workplace, propertyIds, mode = 'transit') => {
    return api.post('/commute/calculate', {
      workplace,
      propertyIds,
      mode
    });
  },

  // Batch calculate for bounds
  calculateForBounds: (workplace, bounds, mode = 'transit') => {
    return api.get('/commute/batch', {
      params: {
        workplaceLat: workplace.lat,
        workplaceLng: workplace.lng,
        mode,
        ...bounds
      }
    });
  }
};

export default api;
