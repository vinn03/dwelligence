import { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useAppContext } from '../../context/AppContext';

const RoutePolylines = () => {
  const { selectedRoutes, detailedProperty } = useAppContext();
  const map = useMap();
  const [polylines, setPolylines] = useState([]);

  useEffect(() => {
    if (!map || !window.google || !selectedRoutes || selectedRoutes.length === 0) {
      // Clear existing polylines
      polylines.forEach(polyline => polyline.setMap(null));
      setPolylines([]);
      return;
    }

    // Clear existing polylines
    polylines.forEach(polyline => polyline.setMap(null));

    // Create new polylines for each route
    const newPolylines = selectedRoutes.map((route, index) => {
      // Decode the polyline string
      const decodedPath = window.google.maps.geometry.encoding.decodePath(route.polyline);

      // Different colors for each route
      const colors = ['#4285F4', '#34A853', '#FBBC04'];
      const color = colors[index] || '#4285F4';

      // Create polyline
      const polyline = new window.google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: map
      });

      return polyline;
    });

    setPolylines(newPolylines);

    // Fit bounds to show the entire route
    if (selectedRoutes.length > 0 && detailedProperty) {
      const bounds = new window.google.maps.LatLngBounds();

      // Add all route points to bounds
      selectedRoutes.forEach(route => {
        const decodedPath = window.google.maps.geometry.encoding.decodePath(route.polyline);
        decodedPath.forEach(point => bounds.extend(point));
      });

      // Fit the map to show all routes
      map.fitBounds(bounds, { padding: 80 });
    }

    // Cleanup function
    return () => {
      newPolylines.forEach(polyline => polyline.setMap(null));
    };
  }, [map, selectedRoutes, detailedProperty]);

  // This component doesn't render anything directly
  // It manages polylines via the Google Maps API
  return null;
};

export default RoutePolylines;
