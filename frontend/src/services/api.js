import axios from 'axios';

/**
 * @typedef {Object} PropertyFilters
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {number} [bedrooms]
 * @property {number} [bathrooms]
 * @property {string} [propertyType]
 * @property {string} [listingType]
 */

/**
 * @typedef {Object} MapBounds
 * @property {number} north
 * @property {number} south
 * @property {number} east
 * @property {number} west
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {number} [status]
 * @property {any} [data]
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[API] Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('[API] No response received:', error.message);
    } else {
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Creates an AbortController signal for request cancellation
 * @returns {{ signal: AbortSignal }}
 */
export const createCancelToken = () => {
  const controller = new AbortController();
  return { signal: controller.signal };
};

/**
 * Properties API
 * @typedef {Object} PropertiesAPI
 * @property {function(Object=, Object=): Promise} getAll
 * @property {function(MapBounds, Object=, string=): Promise} getInBounds
 * @property {function(string): Promise} getById
 * @property {function(string, string=): Promise} getAmenitiesForProperty
 * @property {function(Object): Promise} create
 * @property {function(string, string): Promise} askAboutListing
 */

/** @type {PropertiesAPI} */
export const propertiesAPI = {
  getAll: (filters = {}, options = {}) => {
    return api.get('/properties', { params: filters, ...options });
  },

  getInBounds: (bounds, filters = {}, transportMode = 'walking', options = {}) => {
    const filterParams = {};
    if (filters.minPrice) filterParams.minPrice = filters.minPrice;
    if (filters.maxPrice) filterParams.maxPrice = filters.maxPrice;
    if (filters.bedrooms) filterParams.bedrooms = filters.bedrooms;
    if (filters.bathrooms) filterParams.bathrooms = filters.bathrooms;
    if (filters.propertyType) filterParams.propertyType = filters.propertyType;
    if (filters.listingType) filterParams.listingType = filters.listingType;
    if (transportMode) filterParams.transportMode = transportMode;

    return api.get('/properties/map-bounds', {
      params: { ...bounds, ...filterParams },
      ...options
    });
  },

  getById: (id, options = {}) => {
    return api.get(`/properties/${id}`, options);
  },

  getAmenitiesForProperty: (id, transportMode = 'walking', options = {}) => {
    return api.get(`/properties/${id}/amenities`, {
      params: { transportMode },
      ...options
    });
  },

  create: (propertyData, options = {}) => {
    return api.post('/properties', propertyData, options);
  },

  askAboutListing: (propertyId, question, options = {}) => {
    return api.post(`/properties/${propertyId}/ask`, { question }, options);
  }
};

/**
 * Commute API
 * @typedef {Object} CommuteAPI
 * @property {function(Object, string[], string=): Promise} calculate
 * @property {function(Object, MapBounds, string=): Promise} calculateForBounds
 * @property {function(Coordinates, Coordinates, string=): Promise} getRoutes
 */

/** @type {CommuteAPI} */
export const commuteAPI = {
  calculate: (workplace, propertyIds, mode = 'transit', options = {}) => {
    return api.post('/commute/calculate', {
      workplace,
      propertyIds,
      mode
    }, options);
  },

  calculateForBounds: (workplace, bounds, mode = 'transit', options = {}) => {
    return api.get('/commute/batch', {
      params: {
        workplaceLat: workplace.lat,
        workplaceLng: workplace.lng,
        mode,
        ...bounds
      },
      ...options
    });
  },

  getRoutes: (origin, destination, mode = 'transit', options = {}) => {
    return api.post('/commute/routes', {
      origin,
      destination,
      mode
    }, options);
  }
};

/**
 * Search API
 * @typedef {Object} SearchAPI
 * @property {function(string, Object=, Object=, number=): Promise} aiSearch
 */

/** @type {SearchAPI} */
export const searchAPI = {
  aiSearch: (query, workplace = null, filters = {}, maxResults = 20, options = {}) => {
    return api.post('/search/ai', {
      query,
      workplace,
      filters,
      maxResults
    }, options);
  }
};

export default api;
