import Listing from "../../Listing/Listing";

const PropertyGrid = ({ properties, onPropertyClick }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="cursor-pointer"
          onClick={() => onPropertyClick(property)}
        >
          <Listing property={property} compact={true} />
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;
