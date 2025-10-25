import { InfoWindow } from '@vis.gl/react-google-maps';
import Listing from '../Listing/Listing';

const Tooltip = ({ property, onClose }) => {
  return (
    <InfoWindow
      position={{ lat: property.lat, lng: property.lng }}
      onClose={onClose}
      maxWidth={350}
    >
      <div className="p-2">
        <Listing property={property} compact={true} />
      </div>
    </InfoWindow>
  );
};

export default Tooltip;
