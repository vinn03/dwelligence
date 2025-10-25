import { useState } from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useAppContext } from '../../context/AppContext';
import Tooltip from './Tooltip';

const PropertyMarker = ({ property }) => {
  const { setSelectedProperty, selectedProperty } = useAppContext();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    setSelectedProperty(property);
    setShowTooltip(true);
  };

  const isSelected = selectedProperty?.id === property.id;

  return (
    <>
      <AdvancedMarker
        position={{ lat: property.lat, lng: property.lng }}
        onClick={handleClick}
      >
        <div
          className={`px-3 py-1.5 rounded-full font-semibold text-sm shadow-lg cursor-pointer transition-all ${
            isSelected
              ? 'bg-primary-600 text-white scale-110'
              : 'bg-white text-gray-900 hover:bg-primary-50'
          }`}
        >
          ${property.price.toLocaleString()}
        </div>
      </AdvancedMarker>

      {/* Show tooltip when marker is clicked */}
      {isSelected && showTooltip && (
        <Tooltip property={property} onClose={() => setShowTooltip(false)} />
      )}
    </>
  );
};

export default PropertyMarker;
