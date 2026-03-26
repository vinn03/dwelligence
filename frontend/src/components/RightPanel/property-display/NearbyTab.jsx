import { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import { propertiesAPI } from "../../../services/api";

const AMENITY_TYPES = [
  { id: "park", label: "Parks", emoji: "🌳" },
  { id: "grocery", label: "Groceries", emoji: "🛒" },
  { id: "cafe", label: "Cafes", emoji: "☕" },
  { id: "restaurant", label: "Restaurants", emoji: "🍽️" },
  { id: "transit_station", label: "Transit", emoji: "🚈" },
  { id: "gym", label: "Gyms", emoji: "💪" },
  { id: "pharmacy", label: "Pharmacies", emoji: "💊" },
  { id: "community_center", label: "Community", emoji: "🏢" },
];

const TRANSPORT_MODE_INFO = {
  walking: { label: "Walking Distance", range: "~1.2km", emoji: "🚶" },
  bicycling: { label: "Biking Distance", range: "~3.2km", emoji: "🚴" },
  driving: { label: "Driving Distance", range: "~8.5km", emoji: "🚗" },
  transit: { label: "Transit Distance", range: "~1.2km", emoji: "🚈" },
};

const NearbyTab = ({ property }) => {
  const { transportMode, amenityVisualization, setAmenityVisualization } =
    useAppContext();

  const [loadingAmenities, setLoadingAmenities] = useState(false);

  useEffect(() => {
    if (property) {
      fetchAmenities();
    } else {
      setAmenityVisualization(null);
    }
  }, [property, transportMode]);

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

  const amenityCounts = amenityVisualization?.amenityCounts || {};

  const hasAmenityData = Object.values(amenityCounts).some((count) => count > 0);

  if (!hasAmenityData && !loadingAmenities) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">
          No nearby amenities found within range
        </p>
      </div>
    );
  }

  const modeInfo = TRANSPORT_MODE_INFO[transportMode] || TRANSPORT_MODE_INFO.walking;

  const totalAmenities = Object.values(amenityCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const amenityTypesCount = Object.values(amenityCounts).filter(
    (count) => count > 0
  ).length;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-lg">📍</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Showing closest amenity of each type
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              {amenityTypesCount} marker{amenityTypesCount !== 1 ? "s" : ""} on
              map represent the nearest of {totalAmenities} total amenities in
              this area.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-2xl">{modeInfo.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {modeInfo.label}
          </p>
          <p className="text-xs text-gray-600">
            Approximately {modeInfo.range}
          </p>
          {transportMode === "transit" && (
            <p className="text-xs text-gray-500 mt-1 italic">
              Note: Transit mode shows amenities within walking distance, as most
              transit users walk to reach nearby amenities.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {AMENITY_TYPES.map((amenity) => {
          const count = amenityCounts[amenity.id] || 0;

          return (
            <div
              key={amenity.id}
              className={`p-3 rounded-lg border transition-colors ${
                count > 0
                  ? "bg-primary-50 border-primary-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{amenity.emoji}</span>
                <span className="text-sm font-medium text-gray-900">
                  {amenity.label}
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  count > 0 ? "text-primary-600" : "text-gray-400"
                }`}
              >
                {count}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          Counts are based on your current transport mode. Change the transport
          mode in the header to see different ranges.
        </p>
      </div>
    </div>
  );
};

export default NearbyTab;
