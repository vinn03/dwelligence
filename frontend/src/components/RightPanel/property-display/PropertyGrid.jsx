import Listing from "../../Listing/Listing";

const PropertyGrid = ({ properties, onPropertyClick }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {properties.map((property) => (
        <button
          key={property.id}
          className="cursor-pointer text-left"
          onClick={() => onPropertyClick(property)}
          aria-label={`View details for ${property.address}`}
        >
          <Listing property={property} compact={true} />
        </button>
      ))}
    </div>
  );
};

export default PropertyGrid;
