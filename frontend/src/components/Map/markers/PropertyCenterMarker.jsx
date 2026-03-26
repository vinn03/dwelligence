import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../../context/AppContext";
import { createPinMarker } from "../utils/PinMarker";
import Tooltip from "../overlays/Tooltip";

const PropertyCenterMarker = () => {
  const { detailedProperty, detailedViewTab } = useAppContext();
  const map = useMap();
  const [marker, setMarker] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    if (
      !map ||
      !window.google ||
      !detailedProperty ||
      (detailedViewTab !== "details" &&
        detailedViewTab !== "commute" &&
        detailedViewTab !== "nearby" &&
        detailedViewTab !== "ask")
    ) {
      setShowTooltip(false);
      return;
    }

    const newMarker = createPinMarker(
      map,
      { lat: detailedProperty.lat, lng: detailedProperty.lng },
      "🏠",
      "#dc2626",
      () => setShowTooltip(true)
    );

    setMarker(newMarker);

    return () => {
      if (newMarker) {
        newMarker.setMap(null);
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
