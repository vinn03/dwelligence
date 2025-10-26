import { useAppContext } from '../../context/AppContext';

const ListingTypeToggle = () => {
  const { filters, updateFilters } = useAppContext();

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
      <button
        onClick={() => updateFilters({ listingType: 'rent' })}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          filters.listingType === 'rent' || !filters.listingType
            ? 'bg-white text-primary-600 shadow-sm font-semibold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        For Rent
      </button>
      <button
        onClick={() => updateFilters({ listingType: 'sale' })}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          filters.listingType === 'sale'
            ? 'bg-white text-primary-600 shadow-sm font-semibold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        For Sale
      </button>
    </div>
  );
};

export default ListingTypeToggle;
