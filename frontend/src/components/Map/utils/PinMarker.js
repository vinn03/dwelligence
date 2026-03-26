export const createPinMarkerElement = ({ emoji, color = "#2563eb", onClick }) => {
  const markerDiv = document.createElement("div");
  markerDiv.style.cssText = `
    width: 50px;
    height: 60px;
    cursor: ${onClick ? "pointer" : "default"};
    transition: transform 0.2s;
    z-index: 1000;
    position: absolute;
    ${!onClick ? "pointer-events: none;" : ""}
  `;

  markerDiv.innerHTML = `
    <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 0 C11.2 0 0 11.2 0 25 C0 38.8 25 60 25 60 C25 60 50 38.8 50 25 C50 11.2 38.8 0 25 0 Z"
            fill="${color}" stroke="#ffffff" stroke-width="3"/>
      <circle cx="25" cy="23" r="14" fill="#ffffff"/>
      <text x="25" y="30" font-size="18" text-anchor="middle">${emoji}</text>
    </svg>
  `;

  if (onClick) {
    markerDiv.onmouseenter = () => (markerDiv.style.transform = "scale(1.1)");
    markerDiv.onmouseleave = () => (markerDiv.style.transform = "scale(1)");
  }

  return markerDiv;
};

export class PinMarkerOverlay extends window.google.maps.OverlayView {
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
      this.div.style.left = position.x - 25 + "px";
      this.div.style.top = position.y - 60 + "px";
    }
  }

  onRemove() {
    if (this.div) {
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }
  }
};

export const createPinMarker = (map, position, emoji, color, onClick) => {
  if (!map || !window.google) return null;

  const markerDiv = createPinMarkerElement({ emoji, color, onClick });

  if (onClick) {
    markerDiv.addEventListener("click", onClick);
  }

  const pinMarker = new PinMarkerOverlay(position, markerDiv);
  pinMarker.setMap(map);

  return pinMarker;
};
