import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { useAppContext } from '../../context/AppContext';
import PropertyMarker from './PropertyMarker';
import RoutePolylines from './RoutePolylines';
import { useEffect, useCallback, useRef } from 'react';
import { propertiesAPI } from '../../services/api';
import { useCommuteCalculation } from '../../hooks/useCommuteCalculation';

const MapContent = () => {
  const { visibleProperties, setVisibleProperties, workplace, mapBounds, setMapBounds, setLoading } = useAppContext();
  const map = useMap();
  const debounceTimer = useRef(null);

  // Automatically calculate commutes when properties, workplace, or transport mode changes
  useCommuteCalculation();

  // Fetch properties within viewport bounds
  const fetchPropertiesInBounds = useCallback(async (bounds) => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getInBounds(bounds);
      setVisibleProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }, [setVisibleProperties, setLoading]);

  // Handle map bounds changes (with debouncing)
  useEffect(() => {
    if (!map) return;

    const handleBoundsChanged = () => {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce: wait 500ms after user stops panning
      debounceTimer.current = setTimeout(() => {
        const bounds = map.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();

          const boundsObj = {
            north: ne.lat(),
            south: sw.lat(),
            east: ne.lng(),
            west: sw.lng()
          };

          fetchPropertiesInBounds(boundsObj);
        }
      }, 500);
    };

    // Listen for bounds changes
    const listener = map.addListener('bounds_changed', handleBoundsChanged);

    // Initial fetch when map is ready
    handleBoundsChanged();

    // Cleanup
    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [map, fetchPropertiesInBounds]);

  // Handle map bounds changes from search
  useEffect(() => {
    if (map && mapBounds) {
      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(mapBounds.south, mapBounds.west),
        new window.google.maps.LatLng(mapBounds.north, mapBounds.east)
      );
      map.fitBounds(bounds);
    }
  }, [map, mapBounds]);

  return (
    <>
      {/* Render property markers */}
      {visibleProperties.map((property) => (
        <PropertyMarker key={property.id} property={property} />
      ))}

      {/* Render route polylines when viewing commute tab */}
      <RoutePolylines />

      {/* TODO: Render workplace marker if set */}
      {workplace && (
        <div>
          {/* Workplace marker will go here */}
        </div>
      )}
    </>
  );
};

const MapContainer = () => {
  const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={['places', 'geometry']} // Add geometry library for polyline decoding
    >
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="dwelligence-map" // You can create a custom map ID in Google Cloud Console
        className="w-full h-full"
      >
        <MapContent />
      </Map>
    </APIProvider>
  );
};

export default MapContainer;
