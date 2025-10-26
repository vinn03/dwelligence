import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../context/AppContext";

const WorkplaceMarker = () => {
  const { workplace, detailedViewTab, detailedProperty } = useAppContext();
  const map = useMap();
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    // Clear existing marker
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    // Only render when on commute tab with workplace set and viewing a detailed property
    if (
      !map ||
      !window.google ||
      !workplace ||
      !detailedProperty ||
      detailedViewTab !== 'commute'
    ) {
      return;
    }

    // Create a custom pin-shaped marker for the workplace
    const markerDiv = document.createElement('div');
    markerDiv.style.cssText = `
      width: 50px;
      height: 60px;
      cursor: default;
      z-index: 1000;
      position: absolute;
      pointer-events: none;
    `;

    // Create pin shape with SVG
    markerDiv.innerHTML = `
      <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin drop shape -->
        <path d="M25 0 C11.2 0 0 11.2 0 25 C0 38.8 25 60 25 60 C25 60 50 38.8 50 25 C50 11.2 38.8 0 25 0 Z"
              fill="#2563eb" stroke="#ffffff" stroke-width="3"/>
        <!-- Inner white circle for emoji -->
        <circle cx="25" cy="23" r="14" fill="#ffffff"/>
        <!-- Briefcase emoji positioned in center -->
        <text x="25" y="30" font-size="18" text-anchor="middle">💼</text>
      </svg>
    `;

    // Create marker using OverlayView for custom HTML
    class WorkplaceMarkerOverlay extends window.google.maps.OverlayView {
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
          // Center the pin horizontally and position point at the location
          this.div.style.left = (position.x - 25) + 'px';
          this.div.style.top = (position.y - 60) + 'px';
        }
      }

      onRemove() {
        if (this.div) {
          this.div.parentNode.removeChild(this.div);
          this.div = null;
        }
      }
    }

    const workplaceMarker = new WorkplaceMarkerOverlay(
      { lat: workplace.lat, lng: workplace.lng },
      markerDiv
    );
    workplaceMarker.setMap(map);

    setMarker(workplaceMarker);

    // Cleanup
    return () => {
      if (workplaceMarker) {
        workplaceMarker.setMap(null);
      }
    };
  }, [map, workplace, detailedViewTab, detailedProperty]);

  return null;
};

export default WorkplaceMarker;
