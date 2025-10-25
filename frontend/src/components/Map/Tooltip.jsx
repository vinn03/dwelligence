import { InfoWindow } from '@vis.gl/react-google-maps';
import Listing from '../Listing/Listing';

const Tooltip = ({ property, onClose }) => {
  return (
    <InfoWindow
      position={{ lat: property.lat, lng: property.lng }}
      onClose={onClose}
      maxWidth={350}
      headerDisabled={true}
    >
      <Listing property={property} compact={true} showClose={true} onClose={onClose} />
    </InfoWindow>
  );
};

export default Tooltip;
