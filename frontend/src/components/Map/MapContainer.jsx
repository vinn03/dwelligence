import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useAppContext } from '../../context/AppContext';
import PropertyMarker from './PropertyMarker';

const MapContainer = () => {
  const { visibleProperties, workplace } = useAppContext();

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
      </Map>
    </APIProvider>
  );
};

export default MapContainer;
