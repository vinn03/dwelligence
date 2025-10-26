import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const AMENITY_TYPES = [
  { id: 'park', label: 'Parks', emoji: '🌳' },
  { id: 'grocery', label: 'Groceries', emoji: '🛒' },
  { id: 'cafe', label: 'Cafes', emoji: '☕' },
  { id: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
  { id: 'transit_station', label: 'Transit', emoji: '🚉' },
  { id: 'gym', label: 'Gyms', emoji: '💪' },
  { id: 'pharmacy', label: 'Pharmacies', emoji: '💊' },
  { id: 'community_center', label: 'Community', emoji: '🏢' },
];

const AmenitiesToggle = () => {
  const { selectedAmenities, setSelectedAmenities } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(amenityId)) {
        return prev.filter((id) => id !== amenityId);
      } else {
        return [...prev, amenityId];
      }
    });
  };

  const clearAll = () => {
    setSelectedAmenities([]);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          selectedAmenities.length > 0
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Amenities
        {selectedAmenities.length > 0 && (
          <span className="ml-1.5 px-1.5 py-0.5 bg-white text-primary-600 rounded-full text-xs font-bold">
            {selectedAmenities.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to close */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Nearby Amenities
                </h3>
                {selectedAmenities.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {AMENITY_TYPES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);

                  return (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{amenity.emoji}</span>
                      <span className="flex-1 text-left">{amenity.label}</span>
                      {isSelected && (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Properties will show nearby amenities based on your selected transport mode.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AmenitiesToggle;
