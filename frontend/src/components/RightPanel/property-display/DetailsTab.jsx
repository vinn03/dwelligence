const DetailsTab = ({ property }) => {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-primary-600">
            ${property.price.toLocaleString()}
          </span>
          <span className="text-gray-600 mb-1">
            {property.sale_type === "rent" ? "/month" : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Bedrooms</p>
          <p className="text-lg font-semibold">{property.bedrooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Bathrooms</p>
          <p className="text-lg font-semibold">{property.bathrooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Square Feet</p>
          <p className="text-lg font-semibold">
            {property.sqFt?.toLocaleString() || "N/A"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Property Type</p>
          <p className="font-medium capitalize">{property.propertyType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Listing Type</p>
          <p className="font-medium capitalize">{property.saleType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Address</p>
          <p className="font-medium">{property.address}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;
