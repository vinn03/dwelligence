import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../context/AppContext";

const PropertyCenterMarker = () => {
  const { detailedProperty, detailedViewTab } = useAppContext();
  const map = useMap();
  const [marker, setMarker] = useState(null);

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

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px; color: #111827;">
            ${detailedProperty.address}
          </h3>
          <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #dc2626;">
            $${detailedProperty.price.toLocaleString()}${detailedProperty.sale_type === 'rent' ? '/mo' : ''}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
            ${detailedProperty.bedrooms} bd • ${detailedProperty.bathrooms} ba
          </p>
        </div>
      `
    });

    propertyMarker.addListener('click', () => {
      infoWindow.open(map, propertyMarker);
    });

    setMarker(propertyMarker);

    // Cleanup
    return () => {
      if (propertyMarker) {
        propertyMarker.setMap(null);
      }
    };
  }, [map, detailedProperty, detailedViewTab]);

  // This component doesn't render anything directly
  return null;
};

export default PropertyCenterMarker;
