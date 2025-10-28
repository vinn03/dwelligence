import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../../context/AppContext";

const POIMarkers = () => {
  const { poiMarkers, detailedViewTab, detailedProperty } = useAppContext();
  const map = useMap();
  const [markers, setMarkers] = useState([]);
  const [placesService, setPlacesService] = useState(null);

  // Initialize Places Service
  useEffect(() => {
    if (map && window.google && !placesService) {
      const service = new window.google.maps.places.PlacesService(map);
      setPlacesService(service);
    }
  }, [map, placesService]);

  useEffect(() => {
    // Clear existing markers
    markers.forEach((marker) => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });

    // Only render when on ask tab with valid POI data
    if (
      !map ||
      !window.google ||
      !placesService ||
      !poiMarkers ||
      poiMarkers.length === 0 ||
      !detailedProperty ||
      detailedViewTab !== "ask"
    ) {
      setMarkers([]);
      return;
    }

    // Create markers for each POI using native Google Maps markers
    const newMarkers = poiMarkers.map((poi, index) => {
      // Create a numbered label marker
      const marker = new window.google.maps.Marker({
        position: { lat: poi.lat, lng: poi.lng },
        map: map,
        label: {
          text: String(index + 1),
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 3,
        },
        title: poi.name,
      });

      // Use Google Places API to get full place details and show native info window
      marker.addListener("click", () => {
        if (poi.placeId) {
          const request = {
            placeId: poi.placeId,
            fields: [
              "name",
              "formatted_address",
              "rating",
              "user_ratings_total",
              "opening_hours",
              "photos",
              "formatted_phone_number",
              "website",
            ],
          };

          placesService.getDetails(request, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              // Create rich info window content with Google Places data
              const photoUrl =
                place.photos && place.photos.length > 0
                  ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 })
                  : null;

              const content = `
                <div style="max-width: 300px;">
                  ${
                    photoUrl
                      ? `<img src="${photoUrl}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 0; margin: -16px -16px 12px -16px;" />`
                      : ""
                  }
                  <div style="padding: ${photoUrl ? "0" : "8px"};">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <span style="
                        background-color: #3b82f6;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: 600;
                        flex-shrink: 0;
                      ">${index + 1}</span>
                      <h3 style="margin: 0; font-weight: 600; font-size: 16px; color: #111827;">
                        ${place.name}
                      </h3>
                    </div>
                    ${
                      place.rating
                        ? `
                      <div style="margin: 8px 0; display: flex; align-items: center; gap: 4px;">
                        <span style="color: #f59e0b; font-size: 16px;">★</span>
                        <span style="font-weight: 600; color: #111827;">${
                          place.rating
                        }</span>
                        ${
                          place.user_ratings_total
                            ? `
                          <span style="color: #6b7280; font-size: 12px;">(${place.user_ratings_total.toLocaleString()} reviews)</span>
                        `
                            : ""
                        }
                      </div>
                    `
                        : ""
                    }
                    ${
                      place.opening_hours
                        ? `
                      <p style="margin: 4px 0; font-size: 12px; color: ${
                        place.opening_hours.open_now ? "#059669" : "#dc2626"
                      }; font-weight: 600;">
                        ${
                          place.opening_hours.open_now
                            ? "🟢 Open now"
                            : "🔴 Closed"
                        }
                      </p>
                    `
                        : ""
                    }
                    ${
                      place.formatted_address
                        ? `
                      <p style="margin: 8px 0 4px 0; font-size: 12px; color: #6b7280;">
                        📍 ${place.formatted_address}
                      </p>
                    `
                        : ""
                    }
                    ${
                      place.formatted_phone_number
                        ? `
                      <p style="margin: 4px 0; font-size: 12px; color: #6b7280;">
                        📞 ${place.formatted_phone_number}
                      </p>
                    `
                        : ""
                    }
                    ${
                      place.website
                        ? `
                      <p style="margin: 8px 0 0 0;">
                        <a href="${place.website}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #3b82f6; text-decoration: none;">
                          Visit website →
                        </a>
                      </p>
                    `
                        : ""
                    }
                  </div>
                </div>
              `;

              const infoWindow = new window.google.maps.InfoWindow({
                content: content,
              });
              infoWindow.open(map, marker);
            }
          });
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show all POIs and the property
    if (poiMarkers.length > 0 && detailedProperty) {
      const bounds = new window.google.maps.LatLngBounds();

      // Add property location to bounds
      bounds.extend(
        new window.google.maps.LatLng(
          detailedProperty.lat,
          detailedProperty.lng
        )
      );

      // Add all POI locations to bounds
      poiMarkers.forEach((poi) => {
        bounds.extend(new window.google.maps.LatLng(poi.lat, poi.lng));
      });

      // Fit the map to show all POIs with padding
      map.fitBounds(bounds, { padding: 80 });

      // Zoom out one level to show more context
      const currentZoom = map.getZoom();
      if (currentZoom) {
        map.setZoom(currentZoom - 1);
      }
    }

    // Cleanup
    return () => {
      newMarkers.forEach((marker) => {
        if (marker.setMap) {
          marker.setMap(null);
        }
      });
    };
  }, [map, placesService, poiMarkers, detailedViewTab, detailedProperty]);

  // This component doesn't render anything directly
  return null;
};

export default POIMarkers;
