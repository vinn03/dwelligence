import { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import { commuteAPI } from "../../../services/api";
import TravelModeIcon from "./TravelModeIcon";

const CommuteTab = ({ property }) => {
  const {
    workplace,
    transportMode,
    setSelectedRoutes,
    selectedRouteIndex,
    setSelectedRouteIndex,
  } = useAppContext();

  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [expandedRoutes, setExpandedRoutes] = useState(new Set());

  useEffect(() => {
    if (workplace && property) {
      fetchRoutes();
    } else {
      setRoutes([]);
      setSelectedRoutes([]);
      setSelectedRouteIndex(0);
    }
  }, [workplace, property, transportMode]);

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const response = await commuteAPI.getRoutes(
        { lat: property.lat, lng: property.lng },
        { lat: workplace.lat, lng: workplace.lng },
        transportMode
      );
      setRoutes(response.data);
      setSelectedRoutes(response.data);
      setSelectedRouteIndex(0);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleRouteClick = (routeIndex) => {
    setSelectedRouteIndex(routeIndex);
  };

  const toggleRouteExpanded = (routeIndex) => {
    setExpandedRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeIndex)) {
        newSet.delete(routeIndex);
      } else {
        newSet.add(routeIndex);
      }
      return newSet;
    });
  };

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
      {routes.map((route) => {
        const isSelected = selectedRouteIndex === route.routeIndex;
        const isExpanded = expandedRoutes.has(route.routeIndex);
        return (
          <div
            key={route.routeIndex}
            className={`border-2 rounded-lg transition-all overflow-hidden ${
              isSelected
                ? "border-primary-600 shadow-md"
                : "border-gray-200 hover:border-primary-400"
            }`}
          >
            <div
              onClick={() => handleRouteClick(route.routeIndex)}
              className={`p-3 border-b cursor-pointer ${
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

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRouteExpanded(route.routeIndex);
              }}
              className="w-full p-2 bg-gray-50 hover:bg-gray-100 border-b border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-600"
            >
              <span>{isExpanded ? "Hide" : "Show"} directions</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isExpanded && (
              <div className="p-3 space-y-3">
                {route.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex gap-3">
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
                      <TravelModeIcon
                        mode={step.travelMode}
                        vehicleType={step.transit?.line?.vehicle?.type}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {step.travelMode === "TRANSIT" && step.transit ? (
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
                              {step.transit.numStops === 1 ? "stop" : "stops"}{" "}
                              • {step.duration}
                            </div>
                          </div>
                        </div>
                      ) : (
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
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CommuteTab;
