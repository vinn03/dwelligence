import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../../context/AppContext";
import { createPinMarker } from "../utils/PinMarker";

const WorkplaceMarker = () => {
  const { workplace, detailedViewTab, detailedProperty } = useAppContext();
  const map = useMap();
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    if (
      !map ||
      !window.google ||
      !workplace ||
      !detailedProperty ||
      detailedViewTab !== "commute"
    ) {
      return;
    }

    const newMarker = createPinMarker(
      map,
      { lat: workplace.lat, lng: workplace.lng },
      "💼",
      "#2563eb"
    );

    setMarker(newMarker);

    return () => {
      if (newMarker) {
        newMarker.setMap(null);
      }
    };
  }, [map, workplace, detailedViewTab, detailedProperty]);

  return null;
};

export default WorkplaceMarker;
