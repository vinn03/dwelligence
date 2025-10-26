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
  getInBounds: (bounds, filters = {}, transportMode = 'walking', selectedAmenities = []) => {
    // Only include non-null filter values
    const filterParams = {};
    if (filters.minPrice) filterParams.minPrice = filters.minPrice;
    if (filters.maxPrice) filterParams.maxPrice = filters.maxPrice;
    if (filters.bedrooms) filterParams.bedrooms = filters.bedrooms;
    if (filters.bathrooms) filterParams.bathrooms = filters.bathrooms;
    if (filters.propertyType) filterParams.propertyType = filters.propertyType;

    // Add transport mode
    if (transportMode) filterParams.transportMode = transportMode;

    // Add amenities as comma-separated string
    if (selectedAmenities.length > 0) {
      filterParams.amenities = selectedAmenities.join(',');
    }

    return api.get('/properties/map-bounds', {
      params: { ...bounds, ...filterParams }
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
  },

  // Get route alternatives from origin to destination
  getRoutes: (origin, destination, mode = 'transit') => {
    return api.post('/commute/routes', {
      origin,
      destination,
      mode
    });
  }
};

export default api;
