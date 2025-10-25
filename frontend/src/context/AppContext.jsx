import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Workplace state
  const [workplace, setWorkplace] = useState(() => {
    const saved = localStorage.getItem('workplace');
    return saved ? JSON.parse(saved) : null;
  });

  // Transport mode state
  const [transportMode, setTransportMode] = useState('transit');

  // Filters state
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    bathrooms: null,
    propertyType: null,
    listingType: null
  });

  // Properties state
  const [properties, setProperties] = useState([]);
  const [visibleProperties, setVisibleProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Favorites state (stored in localStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Map bounds state
  const [mapBounds, setMapBounds] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [calculatingCommutes, setCalculatingCommutes] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState('top'); // 'top' | 'favorites' | 'ai-results'

  // Detailed view state
  const [detailedProperty, setDetailedProperty] = useState(null);
  const [detailedViewTab, setDetailedViewTab] = useState('details'); // 'details' | 'commute' | 'nearby'
  const [selectedRoutes, setSelectedRoutes] = useState([]); // Routes to render on map

  // Persist workplace to localStorage
  useEffect(() => {
    if (workplace) {
      localStorage.setItem('workplace', JSON.stringify(workplace));
    } else {
      localStorage.removeItem('workplace');
    }
  }, [workplace]);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = (propertyId) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const value = {
    // Workplace
    workplace,
    setWorkplace,

    // Transport mode
    transportMode,
    setTransportMode,

    // Filters
    filters,
    updateFilters,

    // Properties
    properties,
    setProperties,
    visibleProperties,
    setVisibleProperties,
    selectedProperty,
    setSelectedProperty,

    // Favorites
    favorites,
    toggleFavorite,

    // Map
    mapBounds,
    setMapBounds,

    // Loading
    loading,
    setLoading,
    calculatingCommutes,
    setCalculatingCommutes,

    // Active tab
    activeTab,
    setActiveTab,

    // Detailed view
    detailedProperty,
    setDetailedProperty,
    detailedViewTab,
    setDetailedViewTab,
    selectedRoutes,
    setSelectedRoutes
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
