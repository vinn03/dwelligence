import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../context/AppContext";

const AmenityMarkers = () => {
  const { amenityVisualization, detailedViewTab } = useAppContext();
  const map = useMap();
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);

  // Amenity type to emoji and color mapping
  const amenityConfig = {
    park: { emoji: '🌳', color: '#10b981' },
    grocery: { emoji: '🛒', color: '#f59e0b' },
    cafe: { emoji: '☕', color: '#8b5cf6' },
    restaurant: { emoji: '🍽️', color: '#ef4444' },
    transit_station: { emoji: '🚉', color: '#3b82f6' },
    gym: { emoji: '💪', color: '#ec4899' },
    pharmacy: { emoji: '💊', color: '#14b8a6' },
    community_center: { emoji: '🏢', color: '#6b7280' },
  };

  useEffect(() => {
    // Clear existing markers and info window
    markers.forEach(marker => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    if (infoWindow) {
      infoWindow.close();
      setInfoWindow(null);
    }

    // Only render when on nearby tab with valid data
    if (
      !map ||
      !window.google ||
      !amenityVisualization ||
      !amenityVisualization.amenities ||
      detailedViewTab !== 'nearby'
    ) {
      setMarkers([]);
      return;
    }

    // Create info window (reused for all markers)
    const newInfoWindow = new window.google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    // Create markers for each amenity
    const newMarkers = amenityVisualization.amenities.map((amenity) => {
      const config = amenityConfig[amenity.type] || { emoji: '📍', color: '#6b7280' };

      // Create custom HTML marker with emoji
      const markerDiv = document.createElement('div');
      markerDiv.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: ${config.color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s;
      `;
      markerDiv.innerHTML = config.emoji;
      markerDiv.onmouseenter = () => markerDiv.style.transform = 'scale(1.15)';
      markerDiv.onmouseleave = () => markerDiv.style.transform = 'scale(1)';

      // Create marker using OverlayView for custom HTML
      class CustomMarker extends window.google.maps.OverlayView {
        constructor(position, content) {
          super();
          this.position = position;
          this.content = content;
        }

        onAdd() {
          this.div = this.content;
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(this.div);
        }

        draw() {
          const overlayProjection = this.getProjection();
          const position = overlayProjection.fromLatLngToDivPixel(
            new window.google.maps.LatLng(this.position.lat, this.position.lng)
          );
          if (position) {
            this.div.style.left = (position.x - 20) + 'px';
            this.div.style.top = (position.y - 20) + 'px';
            this.div.style.position = 'absolute';
          }
        }

        onRemove() {
          if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
          }
        }
      }

      const marker = new CustomMarker(
        { lat: amenity.lat, lng: amenity.lng },
        markerDiv
      );
      marker.setMap(map);

      // Add click listener to the div element
      markerDiv.addEventListener('click', () => {
        const distanceText = amenity.distance
          ? amenity.distance < 1000
            ? `${amenity.distance}m away`
            : `${(amenity.distance / 1000).toFixed(1)}km away`
          : '';

        const content = `
          <div style="padding: 8px; min-width: 150px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 20px;">${config.emoji}</span>
              <h3 style="margin: 0; font-weight: 600; font-size: 14px; color: #111827;">
                ${amenity.name || 'Unnamed'}
              </h3>
            </div>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280; text-transform: capitalize;">
              ${amenity.type.replace('_', ' ')}
            </p>
            ${distanceText ? `
              <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #059669;">
                ${distanceText}
              </p>
            ` : ''}
            ${amenity.address ? `
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">
                ${amenity.address}
              </p>
            ` : ''}
          </div>
        `;
        newInfoWindow.setContent(content);
        newInfoWindow.setPosition(new window.google.maps.LatLng(amenity.lat, amenity.lng));
        newInfoWindow.open(map);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Cleanup
    return () => {
      newMarkers.forEach(marker => {
        if (marker.setMap) {
          marker.setMap(null);
        }
      });
      if (newInfoWindow) {
        newInfoWindow.close();
      }
    };
  }, [map, amenityVisualization, detailedViewTab]);

  // This component doesn't render anything directly
  return null;
};

export default AmenityMarkers;
