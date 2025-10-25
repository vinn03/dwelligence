import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../context/AppContext";

const RoutePolylines = () => {
  const { selectedRoutes, detailedProperty, selectedRouteIndex } =
    useAppContext();
  const map = useMap();
  const [polylines, setPolylines] = useState([]);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (
      !map ||
      !window.google ||
      !selectedRoutes ||
      selectedRoutes.length === 0
    ) {
      // Clear existing polylines and markers
      polylines.forEach((polyline) => polyline.setMap(null));
      markers.forEach((marker) => marker.setMap(null));
      setPolylines([]);
      setMarkers([]);
      return;
    }

    // Clear existing polylines and markers
    polylines.forEach((polyline) => polyline.setMap(null));
    markers.forEach((marker) => marker.setMap(null));

    // Create new polylines for each route
    const allPolylines = [];

    selectedRoutes.forEach((route, index) => {
      // Check if this is the selected route
      const isSelected = index === selectedRouteIndex;

      // Different colors for each route
      const colors = ["#4285F4", "#34A853", "#FBBC04"];
      const color = colors[index] || "#4285F4";

      // If we have step-by-step data with polylines, create separate polylines for each step
      if (route.steps && route.steps.length > 0 && route.steps[0].polyline) {
        route.steps.forEach((step) => {
          if (!step.polyline) return;

          // Decode this step's polyline
          const stepPath = window.google.maps.geometry.encoding.decodePath(
            step.polyline
          );

          // Check if this is a walking step
          const isWalking = step.travelMode === 'WALKING';

          // Create polyline with appropriate style
          const polylineConfig = {
            path: stepPath,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: isWalking ? 0 : (isSelected ? 1.0 : 0.8), // No stroke for walking, only dots
            strokeWeight: isSelected ? 7 : 4,
            zIndex: isSelected ? 1000 : 100,
            map: map,
          };

          // Add dashed pattern for walking segments
          if (isWalking) {
            polylineConfig.icons = [
              {
                icon: {
                  path: "M 0,-1 0,1",
                  strokeOpacity: 1,
                  strokeColor: color,
                  scale: isSelected ? 3.5 : 2,
                },
                offset: "0",
                repeat: "15px", // Increased spacing for clearer dots
              },
            ];
          }

          const stepPolyline = new window.google.maps.Polyline(polylineConfig);

          allPolylines.push(stepPolyline);
        });
      } else {
        // Fallback: use overall route polyline
        const decodedPath = window.google.maps.geometry.encoding.decodePath(
          route.polyline
        );

        const polyline = new window.google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: isSelected ? 1.0 : 0.8,
          strokeWeight: isSelected ? 7 : 4,
          zIndex: isSelected ? 1000 : 100,
          map: map,
        });

        allPolylines.push(polyline);
      }
    });

    setPolylines(allPolylines);

    // Create transfer/interchange markers for the selected route
    const selectedRoute = selectedRoutes[selectedRouteIndex];
    const newMarkers = [];

    if (selectedRoute && selectedRoute.steps) {
      // Find all interchange points (any change in travel mode)
      for (let i = 0; i < selectedRoute.steps.length - 1; i++) {
        const currentStep = selectedRoute.steps[i];
        const nextStep = selectedRoute.steps[i + 1];

        let transferLocation = null;
        let transferLabel = '';

        // Walking to transit (boarding)
        if (currentStep.travelMode === 'WALKING' && nextStep.travelMode === 'TRANSIT') {
          transferLocation = nextStep.transit.departureStop.location;
          transferLabel = `Board ${nextStep.transit.line.shortName || nextStep.transit.line.name}`;
        }
        // Transit to walking (alighting)
        else if (currentStep.travelMode === 'TRANSIT' && nextStep.travelMode === 'WALKING') {
          transferLocation = currentStep.transit.arrivalStop.location;
          transferLabel = `Alight ${currentStep.transit.line.shortName || currentStep.transit.line.name}`;
        }
        // Transit to transit (transfer)
        else if (currentStep.travelMode === 'TRANSIT' && nextStep.travelMode === 'TRANSIT') {
          transferLocation = currentStep.transit.arrivalStop.location;
          transferLabel = `Transfer: ${currentStep.transit.line.shortName || currentStep.transit.line.name} → ${nextStep.transit.line.shortName || nextStep.transit.line.name}`;
        }

        if (transferLocation) {
          // Create a custom marker for the interchange point
          const marker = new window.google.maps.Marker({
            position: { lat: transferLocation.lat, lng: transferLocation.lng },
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#FFFFFF',
              fillOpacity: 1,
              strokeColor: '#000000',
              strokeWeight: 2,
            },
            title: transferLabel,
            zIndex: 2000
          });

          newMarkers.push(marker);
        }
      }
    }

    setMarkers(newMarkers);

    // Fit bounds to show the entire route
    if (selectedRoutes.length > 0 && detailedProperty) {
      const bounds = new window.google.maps.LatLngBounds();

      // Add all route points to bounds
      selectedRoutes.forEach((route) => {
        const decodedPath = window.google.maps.geometry.encoding.decodePath(
          route.polyline
        );
        decodedPath.forEach((point) => bounds.extend(point));
      });

      // Fit the map to show all routes
      map.fitBounds(bounds, { padding: 80 });
    }

    // Cleanup function
    return () => {
      allPolylines.forEach((polyline) => polyline.setMap(null));
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, selectedRoutes, detailedProperty, selectedRouteIndex]);

  // This component doesn't render anything directly
  // It manages polylines via the Google Maps API
  return null;
};

export default RoutePolylines;
