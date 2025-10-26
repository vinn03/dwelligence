import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { commuteAPI, propertiesAPI } from "../../services/api";

const DetailedListingView = ({ property, onBack }) => {
  const {
    workplace,
    transportMode,
    detailedViewTab,
    setDetailedViewTab,
    selectedRoutes,
    setSelectedRoutes,
    selectedRouteIndex,
    setSelectedRouteIndex,
    favorites,
    toggleFavorite,
    amenityVisualization,
    setAmenityVisualization,
  } = useAppContext();
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  const isFavorite = favorites.includes(property.id);

  // Fetch routes when Commute tab is active
  useEffect(() => {
    if (detailedViewTab === "commute" && workplace && property) {
      fetchRoutes();
    } else {
      // Clear routes when switching away from commute tab
      setRoutes([]);
      setSelectedRoutes([]);
      setSelectedRouteIndex(0);
    }
  }, [detailedViewTab, workplace, property, transportMode]);

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const response = await commuteAPI.getRoutes(
        { lat: property.lat, lng: property.lng },
        { lat: workplace.lat, lng: workplace.lng },
        transportMode
      );
      setRoutes(response.data);
      setSelectedRoutes(response.data); // Update context for map rendering
      setSelectedRouteIndex(0); // Reset to first route
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Fetch amenities when Nearby tab is active
  useEffect(() => {
    if (detailedViewTab === "nearby" && property) {
      fetchAmenities();
    } else {
      // Clear amenity visualization when switching away from nearby tab
      setAmenityVisualization(null);
    }
  }, [detailedViewTab, property, transportMode]);

  const fetchAmenities = async () => {
    try {
      setLoadingAmenities(true);
      const response = await propertiesAPI.getAmenitiesForProperty(
        property.id,
        transportMode
      );
      setAmenityVisualization(response.data);
    } catch (error) {
      console.error("Error fetching amenities:", error);
    } finally {
      setLoadingAmenities(false);
    }
  };

  // Handle route selection
  const handleRouteClick = (routeIndex) => {
    setSelectedRouteIndex(routeIndex);
  };

  const renderDetailsTab = () => (
    <div className="space-y-4">
      {/* Price */}
      <div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-primary-600">
            ${property.price.toLocaleString()}
          </span>
          <span className="text-gray-600 mb-1">
            {property.sale_type === "rent" ? "/month" : ""}
          </span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Bedrooms</p>
          <p className="text-lg font-semibold">{property.bedrooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Bathrooms</p>
          <p className="text-lg font-semibold">{property.bathrooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Square Feet</p>
          <p className="text-lg font-semibold">
            {property.sq_ft?.toLocaleString() || "N/A"}
          </p>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Property Type</p>
          <p className="font-medium capitalize">{property.property_type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Listing Type</p>
          <p className="font-medium capitalize">{property.sale_type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Address</p>
          <p className="font-medium">{property.address}</p>
        </div>
      </div>
    </div>
  );

  // Helper to get icon for travel mode
  const getTravelModeIcon = (mode, vehicleType) => {
    if (mode === "TRANSIT") {
      switch (vehicleType) {
        case "BUS":
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
            </svg>
          );
        case "SUBWAY":
        case "HEAVY_RAIL":
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z" />
            </svg>
          );
        case "TRAIN":
        case "COMMUTER_TRAIN":
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zm-1 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2.5-8h-11V5h11v2.5z" />
            </svg>
          );
        case "TRAM":
        case "LIGHT_RAIL":
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 16.94V8.5c0-2.79-2.61-3.4-6.01-3.49l.76-1.51H17V2H7v1.5h4.75l-.76 1.52C7.86 5.11 5 5.73 5 8.5v8.44c0 1.45 1.19 2.66 2.59 2.97L6 21.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 20h-.08c1.69 0 2.58-1.37 2.58-3.06zm-7 1.56c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5-4.5H7V9h10v5z" />
            </svg>
          );
        default:
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4z" />
            </svg>
          );
      }
    } else if (mode === "WALKING") {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
        </svg>
      );
    } else if (mode === "DRIVING") {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
        </svg>
      );
    }
    return null;
  };

  const renderCommuteTab = () => {
    if (!workplace) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 text-sm">
            Set your workplace to see commute routes
          </p>
        </div>
      );
    }

    if (loadingRoutes) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Finding routes...</p>
          </div>
        </div>
      );
    }

    if (routes.length === 0) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 text-sm">No routes found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {routes.map((route, index) => {
          const isSelected = selectedRouteIndex === route.routeIndex;
          return (
            <div
              key={route.routeIndex}
              onClick={() => handleRouteClick(route.routeIndex)}
              className={`border-2 rounded-lg cursor-pointer transition-all overflow-hidden ${
                isSelected
                  ? "border-primary-600 shadow-md"
                  : "border-gray-200 hover:border-primary-400"
              }`}
            >
              {/* Route Header */}
              <div
                className={`p-3 border-b ${
                  isSelected
                    ? "bg-primary-50 border-primary-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    {route.durationText}
                  </span>
                  <span className="text-sm text-gray-600">
                    {route.distanceText}
                  </span>
                </div>
                {route.departureTime && route.arrivalTime && (
                  <div className="text-xs text-gray-600 mt-1">
                    {route.departureTime} - {route.arrivalTime}
                  </div>
                )}
              </div>

              {/* Route Steps */}
              <div className="p-3 space-y-3">
                {route.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex gap-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 mt-0.5 ${
                        step.travelMode === "TRANSIT"
                          ? "text-white p-1 rounded"
                          : "text-gray-600"
                      }`}
                      style={
                        step.travelMode === "TRANSIT" &&
                        step.transit?.line?.color
                          ? { backgroundColor: `#${step.transit.line.color}` }
                          : {}
                      }
                    >
                      {getTravelModeIcon(
                        step.travelMode,
                        step.transit?.line?.vehicle?.type
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0">
                      {step.travelMode === "TRANSIT" && step.transit ? (
                        // Transit Step
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{
                                backgroundColor: step.transit.line.color
                                  ? `#${step.transit.line.color}`
                                  : "#666",
                                color: step.transit.line.textColor
                                  ? `#${step.transit.line.textColor}`
                                  : "#fff",
                              }}
                            >
                              {step.transit.line.shortName ||
                                step.transit.line.name}
                            </span>
                            <span className="text-xs text-gray-600">
                              {step.transit.line.vehicle.name}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div className="text-gray-700">
                              {step.transit.headsign && (
                                <span className="font-medium">
                                  toward {step.transit.headsign}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              From{" "}
                              <span className="font-medium">
                                {step.transit.departureStop.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              To{" "}
                              <span className="font-medium">
                                {step.transit.arrivalStop.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {step.transit.numStops}{" "}
                              {step.transit.numStops === 1 ? "stop" : "stops"} •{" "}
                              {step.duration}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Walking/Driving Step
                        <div>
                          <div
                            className="text-sm text-gray-700"
                            dangerouslySetInnerHTML={{
                              __html: step.instruction,
                            }}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {step.distance} • {step.duration}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNearbyTab = () => {
    // Amenity types with emojis
    const amenityTypes = [
      { id: 'park', label: 'Parks', emoji: '🌳' },
      { id: 'grocery', label: 'Groceries', emoji: '🛒' },
      { id: 'cafe', label: 'Cafes', emoji: '☕' },
      { id: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
      { id: 'transit_station', label: 'Transit', emoji: '🚉' },
      { id: 'gym', label: 'Gyms', emoji: '💪' },
      { id: 'pharmacy', label: 'Pharmacies', emoji: '💊' },
      { id: 'community_center', label: 'Community', emoji: '🏢' },
    ];

    // Show loading state
    if (loadingAmenities) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading amenities...</p>
          </div>
        </div>
      );
    }

    // Get amenity counts from the response (calculated before filtering to closest)
    const amenityCounts = amenityVisualization?.amenityCounts || {};

    // Check if any amenity data is available
    const hasAmenityData = Object.values(amenityCounts).some(count => count > 0);

    if (!hasAmenityData && !loadingAmenities) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 text-sm">
            No nearby amenities found within range
          </p>
        </div>
      );
    }

    // Get transport mode info for display
    const getTransportModeInfo = () => {
      const modes = {
        'walking': { label: 'Walking Distance', range: '~1.2km', emoji: '🚶' },
        'bicycling': { label: 'Biking Distance', range: '~3.2km', emoji: '🚴' },
        'driving': { label: 'Driving Distance', range: '~8.5km', emoji: '🚗' },
        'transit': { label: 'Transit Distance', range: '~1.2km', emoji: '🚇' }
      };
      return modes[transportMode] || modes['walking'];
    };

    const modeInfo = getTransportModeInfo();

    const totalAmenities = Object.values(amenityCounts).reduce((sum, count) => sum + count, 0);
    const amenityTypesCount = Object.values(amenityCounts).filter(count => count > 0).length;

    return (
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">📍</span>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Showing closest amenity of each type
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                {amenityTypesCount} marker{amenityTypesCount !== 1 ? 's' : ''} on map represent the nearest of {totalAmenities} total amenities in this area.
              </p>
            </div>
          </div>
        </div>

        {/* Header with transport mode info */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-2xl">{modeInfo.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{modeInfo.label}</p>
            <p className="text-xs text-gray-600">Approximately {modeInfo.range}</p>
            {transportMode === 'transit' && (
              <p className="text-xs text-gray-500 mt-1 italic">
                Note: Transit mode shows amenities within walking distance, as most transit users walk to reach nearby amenities.
              </p>
            )}
          </div>
        </div>

        {/* Amenity Grid */}
        <div className="grid grid-cols-2 gap-3">
          {amenityTypes.map((amenity) => {
            const count = amenityCounts[amenity.id] || 0;

            return (
              <div
                key={amenity.id}
                className={`p-3 rounded-lg border transition-colors ${
                  count > 0
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{amenity.emoji}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {amenity.label}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${
                  count > 0 ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            Counts are based on your current transport mode. Change the transport mode in the header to see different ranges.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Enlarged Thumbnail with Back Button */}
      <div className="relative h-64 flex-shrink-0">
        <img
          src={property.imageUrl || "https://via.placeholder.com/400x300"}
          alt={property.address}
          className="w-full h-full object-cover"
        />
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id, property);
          }}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          {isFavorite ? (
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setDetailedViewTab("details")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            detailedViewTab === "details"
              ? "border-b-2 border-primary-600 text-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Details
        </button>
        {workplace && (
          <button
            onClick={() => setDetailedViewTab("commute")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              detailedViewTab === "commute"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Commute
          </button>
        )}
        <button
          onClick={() => setDetailedViewTab("nearby")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            detailedViewTab === "nearby"
              ? "border-b-2 border-primary-600 text-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Nearby
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {detailedViewTab === "details" && renderDetailsTab()}
        {detailedViewTab === "commute" && renderCommuteTab()}
        {detailedViewTab === "nearby" && renderNearbyTab()}
      </div>
    </div>
  );
};

export default DetailedListingView;
