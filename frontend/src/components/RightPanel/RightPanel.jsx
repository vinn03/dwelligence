import { useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { usePropertySorting } from "../../hooks/usePropertySorting";
import TabsContainer from "./TabsContainer";
import DetailedListingView from "./property-display/DetailedListingView";
import PropertyGrid from "./property-display//PropertyGrid";
import AIInterpretationBanner from "./ai/AIInterpretationBanner";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";

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
    aiInterpretation,
  } = useAppContext();

  const sortedProperties = usePropertySorting(visibleProperties, workplace);

  // Cache visible properties that are favorited
  useEffect(() => {
    visibleProperties.forEach((property) => {
      if (favorites.includes(property.id)) {
        addPropertyToFavoritesCache(property);
      }
    });
  }, [visibleProperties, favorites, addPropertyToFavoritesCache]);

  // Render properties based on active tab
  const renderProperties = () => {
    if (loading) {
      return <LoadingSpinner message="Loading properties..." />;
    }

    let propertiesToShow = [];
    let emptyMessage = "";

    if (activeTab === "top") {
      propertiesToShow = sortedProperties.slice(0, 20); // Top 20
      emptyMessage = "No properties found in this area.";
    } else if (activeTab === "favorites") {
      propertiesToShow = favoriteProperties;
      emptyMessage =
        "No favorites yet. Click the heart icon on any listing to save it.";
    } else if (activeTab === "ai-results") {
      propertiesToShow = aiResults || [];
      emptyMessage = "No AI search results yet. Try using the Ask search mode.";
    }

    if (propertiesToShow.length === 0) {
      return <EmptyState message={emptyMessage} />;
    }

    return (
      <PropertyGrid
        properties={propertiesToShow}
        onPropertyClick={setDetailedProperty}
      />
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
            setDetailedViewTab("details");
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
        {activeTab === "ai-results" && (
          <AIInterpretationBanner aiInterpretation={aiInterpretation} />
        )}

        {/* Show workplace prompt if not set */}
        {!workplace && activeTab === "top" && (
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
