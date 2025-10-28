import { InfoWindow } from "@vis.gl/react-google-maps";
import { useAppContext } from "../../../context/AppContext";
import Listing from "../../Listing/Listing";

const Tooltip = ({ property, onClose }) => {
  const { setDetailedProperty } = useAppContext();

  const handleOpenDetailed = (property) => {
    setDetailedProperty(property);
    onClose(); // Close the tooltip
  };

  return (
    <InfoWindow
      position={{ lat: property.lat, lng: property.lng }}
      onClose={onClose}
      maxWidth={350}
      headerDisabled={true}
    >
      <Listing
        property={property}
        compact={true}
        showClose={true}
        onClose={onClose}
        onClick={handleOpenDetailed}
      />
    </InfoWindow>
  );
};

export default Tooltip;
