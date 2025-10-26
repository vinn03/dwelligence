import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../context/AppContext";

const H3HexPolygon = () => {
  const { amenityVisualization, transportMode, detailedViewTab } = useAppContext();
  const map = useMap();
  const [polygon, setPolygon] = useState(null);

  useEffect(() => {
    // Clear existing polygon
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);
    }

    // Only render when on nearby tab with valid data
    if (
      !map ||
      !window.google ||
      !amenityVisualization ||
      !amenityVisualization.hexBoundary ||
      detailedViewTab !== 'nearby'
    ) {
      return;
    }

    // Color based on transport mode
    const getColorForMode = (mode) => {
      switch (mode) {
        case 'walking':
          return '#10b981'; // green
        case 'bicycling':
          return '#3b82f6'; // blue
        case 'driving':
          return '#ef4444'; // red
        case 'transit':
          return '#8b5cf6'; // purple
        default:
          return '#6b7280'; // gray
      }
    };

    const color = getColorForMode(transportMode);

    // Convert hex boundary to Google Maps format
    const paths = amenityVisualization.hexBoundary.map(point => ({
      lat: point.lat,
      lng: point.lng
    }));

    // Create polygon
    const hexPolygon = new window.google.maps.Polygon({
      paths: paths,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: color,
      fillOpacity: 0.15,
      map: map,
      zIndex: 50
    });

    setPolygon(hexPolygon);

    // Cleanup
    return () => {
      if (hexPolygon) {
        hexPolygon.setMap(null);
      }
    };
  }, [map, amenityVisualization, transportMode, detailedViewTab]);

  // This component doesn't render anything directly
  return null;
};

export default H3HexPolygon;
