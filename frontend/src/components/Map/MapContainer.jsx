import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../context/AppContext";
import PropertyMarker from "./markers/PropertyMarker";
import RoutePolylines from "./overlays/RoutePolylines";
import AmenityMarkers from "./markers/AmenityMarkers";
import PropertyCenterMarker from "./markers/PropertyCenterMarker";
import WorkplaceMarker from "./markers/WorkplaceMarker";
import POIMarkers from "./markers/POIMarkers";
import { useEffect, useCallback, useRef } from "react";
import { propertiesAPI } from "../../services/api";

const MapContent = () => {
  const {
    visibleProperties,
    setVisibleProperties,
    workplace,
    mapBounds,
    setLoading,
    detailedProperty,
    detailedViewTab,
    filters,
    transportMode,
    useRasterMap,
    setUseRasterMap,
  } = useAppContext();
  const map = useMap();
  const debounceTimer = useRef(null);
  const tileLoadTimeout = useRef(null);
  const tilesLoaded = useRef(false);

  // Fetch properties within viewport bounds
  const fetchPropertiesInBounds = useCallback(
    async (bounds) => {
      try {
        setLoading(true);
        const response = await propertiesAPI.getInBounds(
          bounds,
          filters,
          transportMode
        );
        setVisibleProperties(response.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    },
    [setVisibleProperties, setLoading, filters, transportMode]
  );

  // Handle map bounds changes (with debouncing)
  useEffect(() => {
    if (!map) return;

    const handleBoundsChanged = () => {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce: wait 500ms after user stops panning
      debounceTimer.current = setTimeout(() => {
        const bounds = map.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();

          const boundsObj = {
            north: ne.lat(),
            south: sw.lat(),
            east: ne.lng(),
            west: sw.lng(),
          };

          fetchPropertiesInBounds(boundsObj);
        }
      }, 500);
    };

    // Listen for bounds changes
    const listener = map.addListener("bounds_changed", handleBoundsChanged);

    // Initial fetch when map is ready
    handleBoundsChanged();

    // Cleanup
    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [map, fetchPropertiesInBounds]);

  // Auto-fallback to raster if vector tiles don't load
  useEffect(() => {
    if (!map || useRasterMap) return;

    // Set a timeout to switch to raster if tiles don't load in 3 seconds
    tileLoadTimeout.current = setTimeout(() => {
      if (!tilesLoaded.current) {
        console.log("Vector tiles failed to load, switching to raster mode");
        setUseRasterMap(true);
      }
    }, 3000);

    // Listen for tiles loaded event
    const listener = window.google.maps.event.addListener(
      map,
      "tilesloaded",
      () => {
        tilesLoaded.current = true;
        if (tileLoadTimeout.current) {
          clearTimeout(tileLoadTimeout.current);
        }
      }
    );

    return () => {
      if (tileLoadTimeout.current) {
        clearTimeout(tileLoadTimeout.current);
      }
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [map, useRasterMap, setUseRasterMap]);

  // Handle map bounds changes from search
  useEffect(() => {
    if (map && mapBounds) {
      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(mapBounds.south, mapBounds.west),
        new window.google.maps.LatLng(mapBounds.north, mapBounds.east)
      );
      map.fitBounds(bounds);
    }
  }, [map, mapBounds]);

  // Center map on detailed property when opened
  useEffect(() => {
    if (map && detailedProperty) {
      map.panTo({ lat: detailedProperty.lat, lng: detailedProperty.lng });
      map.setZoom(15); // Zoom in closer to see the property
    }
  }, [map, detailedProperty]);

  return (
    <>
      {/* Render property markers (hidden when viewing detailed property) */}
      {!detailedProperty &&
        visibleProperties.map((property) => (
          <PropertyMarker key={property.id} property={property} />
        ))}

      {/* Render route polylines when viewing commute tab */}
      <RoutePolylines />

      {/* Render amenity markers when viewing nearby tab */}
      <AmenityMarkers />

      {/* Render POI markers when viewing ask tab */}
      <POIMarkers />

      {/* Render property home marker when viewing detailed property (details, commute, nearby) */}
      <PropertyCenterMarker />

      {/* Render workplace marker when viewing commute tab */}
      <WorkplaceMarker />
    </>
  );
};

const MapContainer = () => {
  const { useRasterMap } = useAppContext();
  const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["places", "geometry"]} // Add geometry library for polyline decoding
    >
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        clickableIcons={false}
        renderingType={useRasterMap ? "RASTER" : "VECTOR"}
        mapId={useRasterMap ? undefined : "e7aefce9a26a6f40196ae1b3"}
        className="w-full h-full"
      >
        <MapContent />
      </Map>
    </APIProvider>
  );
};

export default MapContainer;
