import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { useAppContext } from '../../context/AppContext';
import PropertyMarker from './PropertyMarker';
import { useEffect } from 'react';

const MapContent = () => {
  const { visibleProperties, workplace, mapBounds } = useAppContext();
  const map = useMap();

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
      {/* TODO: Render property markers */}
      {visibleProperties.map((property) => (
        <PropertyMarker key={property.id} property={property} />
      ))}

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
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
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
