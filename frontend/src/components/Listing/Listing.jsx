import { useAppContext } from "../../context/AppContext";

const Listing = ({
  property,
  compact = false,
  showClose = false,
  onClose = null,
  onClick = null,
}) => {
  const { favorites, toggleFavorite, transportMode } = useAppContext();

  const isFavorite = favorites.includes(property.id);

  // Get commute data if available
  const commute = property.commute;

  const handleClick = () => {
    if (onClick) {
      onClick(property);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg overflow-hidden ${
        compact ? "shadow-md hover:shadow-lg" : "shadow-lg hover:shadow-xl transition-shadow"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Property Image */}
      <div className="relative">
        <img
          src={property.imageUrl || "https://via.placeholder.com/400x300"}
          alt={property.address}
          className={`w-full object-cover ${compact ? "h-32" : "h-48"}`}
        />

        {/* Close Button (for tooltip) */}
        {showClose && onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id, property);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <svg
            className={`w-4 h-4 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
            }`}
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Property Details */}
      <div className={`${compact ? "p-3" : "p-4"}`}>
        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`font-bold text-primary-600 ${
              compact ? "text-lg" : "text-2xl"
            }`}
          >
            ${property.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">
            {property.listing_type === "rent" ? "/month" : ""}
          </span>
        </div>

        {/* Beds & Baths */}
        <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
          <span>{property.bedrooms} bed</span>
          <span>•</span>
          <span>{property.bathrooms} bath</span>
          {property.square_feet && (
            <>
              <span>•</span>
              <span>{property.square_feet.toLocaleString()} sqft</span>
            </>
          )}
        </div>

        {/* Address */}
        <p
          className={`text-gray-700 ${compact ? "text-sm" : "text-base"} mb-2`}
        >
          {property.address}
        </p>

        {/* Commute Time (if workplace is set) */}
        {commute && commute.duration && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-lg">
            <span className="text-lg">
              {transportMode === "driving" && "🚗"}
              {transportMode === "bicycling" && "🚴"}
              {transportMode === "transit" && "🚈"}
              {transportMode === "walking" && "🚶"}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {commute.durationText} to work
              </p>
              <p className="text-xs text-gray-500">{commute.distanceText}</p>
            </div>
          </div>
        )}

        {/* Description (if not compact) */}
        {!compact && property.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {property.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default Listing;
