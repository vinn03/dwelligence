export const FILTERS = {
  PRICE_MIN: 0,
  PRICE_MAX: 10000,
  DEFAULT_LISTING_TYPE: 'rent',
};

export const MAP = {
  DEFAULT_CENTER: { lat: 37.7749, lng: -122.4194 },
  DEFAULT_ZOOM: 15,
  BOUNDS_OFFSET: 0.01,
  DEBOUNCE_TIMEOUT: 500,
  TILE_LOAD_TIMEOUT: 3000,
};

export const TRANSPORT_MODE_RANGES = {
  walking: { label: 'Walking Distance', range: '~1.2km', emoji: '🚶' },
  bicycling: { label: 'Biking Distance', range: '~3.2km', emoji: '🚴' },
  driving: { label: 'Driving Distance', range: '~8.5km', emoji: '🚗' },
  transit: { label: 'Transit Distance', range: '~1.2km', emoji: '🚈' },
};

export const ROUTE_COLORS = ['#4285F4', '#34A853', '#FBBC04'];

export const MARKER_COLORS = {
  selected: '#2563EB',
  selectedStroke: '#1E40AF',
  default: '#FFFFFF',
  defaultStroke: '#E5E7EB',
};

export const AMENITY_TYPES = [
  { id: 'park', label: 'Parks', emoji: '🌳' },
  { id: 'grocery', label: 'Groceries', emoji: '🛒' },
  { id: 'cafe', label: 'Cafes', emoji: '☕' },
  { id: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
  { id: 'transit_station', label: 'Transit', emoji: '🚈' },
  { id: 'gym', label: 'Gyms', emoji: '💪' },
  { id: 'pharmacy', label: 'Pharmacies', emoji: '💊' },
  { id: 'community_center', label: 'Community', emoji: '🏢' },
];

export const EXAMPLE_QUESTIONS = [
  'Are there any coffee shops nearby?',
  'What grocery stores are close?',
  'Where can I find gyms?',
  'Any good restaurants in the area?',
  'Is there a pharmacy nearby?',
];

export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300';
