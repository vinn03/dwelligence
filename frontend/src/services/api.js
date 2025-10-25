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
  // Get all properties with filters
  getAll: (filters = {}) => {
    return api.get('/properties', { params: filters });
  },

  // Get properties within map bounds with filters
  getInBounds: (bounds, filters = {}) => {
    return api.get('/properties/map-bounds', {
      params: { ...bounds, ...filters }
    });
  },

  // Get single property
  getById: (id) => {
    return api.get(`/properties/${id}`);
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
