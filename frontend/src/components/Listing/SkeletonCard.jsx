const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-300"></div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Price skeleton */}
        <div className="h-6 bg-gray-300 rounded w-32"></div>

        {/* Address skeleton */}
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>

        {/* Details skeleton */}
        <div className="flex gap-4 pt-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Commute skeleton */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
