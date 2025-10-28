import { useState, useEffect } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../../context/AppContext";
import Tooltip from "../overlays/Tooltip";

const PropertyMarker = ({ property }) => {
  const { setSelectedProperty, selectedProperty, useRasterMap } =
    useAppContext();
  const [showTooltip, setShowTooltip] = useState(false);
  const [classicMarker, setClassicMarker] = useState(null);
  const map = useMap();

  const handleClick = () => {
    setSelectedProperty(property);
    setShowTooltip(true);
  };

  const handleClose = () => {
    setShowTooltip(false);
    setSelectedProperty(null);
  };

  const isSelected = selectedProperty?.id === property.id;

  // Use classic markers for raster mode
  useEffect(() => {
    if (!useRasterMap || !map) {
      // Clean up classic marker if switching to vector mode
      if (classicMarker) {
        classicMarker.setMap(null);
        setClassicMarker(null);
      }
      return;
    }

    // Create classic marker for raster mode
    const formatPrice = (price) => {
      if (price < 1000) {
        // Under 1k: show full price (e.g., $500)
        return `$${price.toLocaleString()}`;
      } else if (price < 10000) {
        // 1k to 10k: show with 1 decimal (e.g., $2.4k, $9.8k)
        return `$${(price / 1000).toFixed(1)}k`;
      } else if (price < 1000000) {
        // 10k to 1M: show in thousands rounded (e.g., $12k, $500k)
        return `$${Math.round(price / 1000)}k`;
      } else {
        // Over 1M: show in millions with 1 decimal (e.g., $1.1M, $2M)
        const millions = price / 1000000;
        return millions % 1 === 0
          ? `$${millions}M`
          : `$${millions.toFixed(1)}M`;
      }
    };

    const priceLabel = formatPrice(property.price);

    const marker = new window.google.maps.Marker({
      position: { lat: property.lat, lng: property.lng },
      map: map,
      label: {
        text: priceLabel,
        color: isSelected ? "#FFFFFF" : "#1F2937",
        fontSize: "12px",
        fontWeight: "bold",
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: isSelected ? 20 : 18,
        fillColor: isSelected ? "#2563EB" : "#FFFFFF",
        fillOpacity: 1,
        strokeColor: isSelected ? "#1E40AF" : "#E5E7EB",
        strokeWeight: 2,
        labelOrigin: new window.google.maps.Point(0, 0),
      },
    });

    marker.addListener("click", handleClick);
    setClassicMarker(marker);

    return () => {
      marker.setMap(null);
    };
  }, [useRasterMap, map, property, isSelected]);

  // Update classic marker appearance when selection changes
  useEffect(() => {
    if (classicMarker) {
      const formatPrice = (price) => {
        if (price < 1000) {
          return `$${price.toLocaleString()}`;
        } else if (price < 10000) {
          return `$${(price / 1000).toFixed(1)}k`;
        } else if (price < 1000000) {
          return `$${Math.round(price / 1000)}k`;
        } else {
          const millions = price / 1000000;
          return millions % 1 === 0
            ? `$${millions}M`
            : `$${millions.toFixed(1)}M`;
        }
      };

      const priceLabel = formatPrice(property.price);

      classicMarker.setIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: isSelected ? 20 : 18,
        fillColor: isSelected ? "#2563EB" : "#FFFFFF",
        fillOpacity: 1,
        strokeColor: isSelected ? "#1E40AF" : "#E5E7EB",
        strokeWeight: 2,
        labelOrigin: new window.google.maps.Point(0, 0),
      });
      classicMarker.setLabel({
        text: priceLabel,
        color: isSelected ? "#FFFFFF" : "#1F2937",
        fontSize: "12px",
        fontWeight: "bold",
      });
    }
  }, [isSelected, classicMarker, property.price]);

  return (
    <>
      {/* Use AdvancedMarker for vector mode only */}
      {!useRasterMap && (
        <AdvancedMarker
          position={{ lat: property.lat, lng: property.lng }}
          onClick={handleClick}
        >
          <div
            className={`px-3 py-1.5 rounded-full font-semibold text-sm shadow-lg cursor-pointer transition-all ${
              isSelected
                ? "bg-primary-600 text-white scale-110"
                : "bg-white text-gray-900 hover:bg-primary-50"
            }`}
          >
            ${property.price.toLocaleString()}
          </div>
        </AdvancedMarker>
      )}

      {/* Show tooltip when marker is clicked */}
      {isSelected && showTooltip && (
        <Tooltip property={property} onClose={handleClose} />
      )}
    </>
  );
};

export default PropertyMarker;
