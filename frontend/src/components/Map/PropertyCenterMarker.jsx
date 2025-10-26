import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../context/AppContext";
import Tooltip from "./Tooltip";

const PropertyCenterMarker = () => {
  const { detailedProperty, detailedViewTab } = useAppContext();
  const map = useMap();
  const [marker, setMarker] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Clear existing marker
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    // Only render when on nearby tab with a detailed property
    if (
      !map ||
      !window.google ||
      !detailedProperty ||
      detailedViewTab !== 'nearby'
    ) {
      setShowTooltip(false);
      return;
    }

    // Create a distinctive marker for the property
    const propertyMarker = new window.google.maps.Marker({
      position: { lat: detailedProperty.lat, lng: detailedProperty.lng },
      map: map,
      title: detailedProperty.address,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 16,
        fillColor: '#dc2626', // red-600
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 500, // Higher than amenities
      label: {
        text: '🏠',
        fontSize: '20px',
        className: 'property-marker-label'
      }
    });

    propertyMarker.addListener('click', () => {
      setShowTooltip(true);
    });

    setMarker(propertyMarker);

    // Cleanup
    return () => {
      if (propertyMarker) {
        propertyMarker.setMap(null);
      }
      setShowTooltip(false);
    };
  }, [map, detailedProperty, detailedViewTab]);

  return (
    <>
      {showTooltip && detailedProperty && (
        <Tooltip
          property={detailedProperty}
          onClose={() => setShowTooltip(false)}
        />
      )}
    </>
  );
};

export default PropertyCenterMarker;
