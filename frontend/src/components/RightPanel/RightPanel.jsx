import { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import TabsContainer from './TabsContainer';
import Listing from '../Listing/Listing';
import DetailedListingView from './DetailedListingView';

const RightPanel = () => {
  const {
    activeTab,
    setActiveTab,
    visibleProperties,
    favorites,
    favoriteProperties,
    addPropertyToFavoritesCache,
    loading,
    workplace,
    detailedProperty,
    setDetailedProperty,
    setSelectedRoutes,
    setSelectedRouteIndex,
    setDetailedViewTab,
    aiResults,
    aiInterpretation
  } = useAppContext();

  // Cache visible properties that are favorited
  useEffect(() => {
    visibleProperties.forEach(property => {
      if (favorites.includes(property.id)) {
        addPropertyToFavoritesCache(property);
      }
    });
  }, [visibleProperties, favorites, addPropertyToFavoritesCache]);

  // Sort properties by commute-aware ranking (for Top tab)
  const getSortedProperties = () => {
    if (!workplace) {
      // No workplace set, sort by price only
      return [...visibleProperties].sort((a, b) => a.price - b.price);
    }

    // Commute-aware ranking: (duration_seconds * 0.5) + (price * 0.5)
    // Lower score = better
    return [...visibleProperties].sort((a, b) => {
      const getDurationSeconds = (property) => {
        return property.commute?.duration || 999999; // Properties without commute go to bottom
      };

      const scoreA = (getDurationSeconds(a) * 0.5) + (a.price * 0.5);
      const scoreB = (getDurationSeconds(b) * 0.5) + (b.price * 0.5);

      return scoreA - scoreB;
    });
  };

  // Render properties based on active tab
  const renderProperties = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
      );
    }

    let propertiesToShow = [];
    let emptyMessage = '';

    if (activeTab === 'top') {
      const sortedProperties = getSortedProperties();
      propertiesToShow = sortedProperties.slice(0, 20); // Top 20
      emptyMessage = 'No properties found in this area.';
    } else if (activeTab === 'favorites') {
      propertiesToShow = favoriteProperties;
      emptyMessage = 'No favorites yet. Click the heart icon on any listing to save it.';
    } else if (activeTab === 'ai-results') {
      propertiesToShow = aiResults || [];
      emptyMessage = 'No AI search results yet. Try using the Ask search mode.';
    }

    if (propertiesToShow.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {propertiesToShow.map((property) => (
          <div key={property.id} className="cursor-pointer" onClick={() => setDetailedProperty(property)}>
            <Listing property={property} compact={false} />
          </div>
        ))}
      </div>
    );
  };

  // Show detailed view if property is selected
  if (detailedProperty) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <DetailedListingView
          property={detailedProperty}
          onBack={() => {
            setDetailedProperty(null);
            setSelectedRoutes([]);
            setSelectedRouteIndex(0);
            setDetailedViewTab('details');
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* Tabs */}
      <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Show AI interpretation banner if on AI Results tab */}
        {activeTab === 'ai-results' && aiInterpretation && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-primary-900">
                  {aiInterpretation.summary}
                </p>
                <p className="text-xs text-primary-700 mt-1">
                  Found {aiInterpretation.totalResults} properties matching your query
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show workplace prompt if not set */}
        {!workplace && activeTab === 'top' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Set your workplace to see properties ranked by commute time
            </p>
          </div>
        )}

        {renderProperties()}
      </div>
    </div>
  );
};

export default RightPanel;
