import { useState, useRef, useEffect, useCallback } from "react";
import { useAppContext } from "../../../context/AppContext";

const Filters = () => {
  const { filters, updateFilters } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Price range slider constants (in thousands)
  const PRICE_MIN = 0;
  const PRICE_MAX = 10000; // $10,000/month

  // Local state for slider values (to show while dragging)
  const [localMinPrice, setLocalMinPrice] = useState(
    filters.minPrice || PRICE_MIN,
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    filters.maxPrice || PRICE_MAX,
  );

  // Separate state for input text values
  const [minPriceInput, setMinPriceInput] = useState(String(filters.minPrice || PRICE_MIN));
  const [maxPriceInput, setMaxPriceInput] = useState(String(filters.maxPrice || PRICE_MAX));

  // Update local state when filters change externally
  useEffect(() => {
    setLocalMinPrice(filters.minPrice || PRICE_MIN);
    setLocalMaxPrice(filters.maxPrice || PRICE_MAX);
    setMinPriceInput(String(filters.minPrice || PRICE_MIN));
    setMaxPriceInput(String(filters.maxPrice || PRICE_MAX));
  }, [filters.minPrice, filters.maxPrice]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMinPriceChange = useCallback(
    (value) => {
      const numValue = parseInt(value);
      if (numValue <= localMaxPrice) {
        setLocalMinPrice(numValue);
      }
    },
    [localMaxPrice],
  );

  const handleMaxPriceChange = useCallback(
    (value) => {
      const numValue = parseInt(value);
      if (numValue >= localMinPrice) {
        setLocalMaxPrice(numValue);
      }
    },
    [localMinPrice],
  );

  const confirmMinPrice = useCallback(() => {
    const val = minPriceInput.replace(/[^0-9]/g, '');
    const numVal = parseInt(val) || PRICE_MIN;
    const clampedVal = Math.min(Math.min(numVal, localMaxPrice), PRICE_MAX);
    setLocalMinPrice(clampedVal);
    setMinPriceInput(String(clampedVal));
    updateFilters({
      minPrice: clampedVal === PRICE_MIN ? null : clampedVal,
    });
  }, [minPriceInput, localMaxPrice, updateFilters]);

  const confirmMaxPrice = useCallback(() => {
    let val = maxPriceInput.toLowerCase().replace(/[^0-9k]/g, '');
    if (val.includes('k')) {
      val = val.replace('k', '000');
    }
    const numVal = parseInt(val) || PRICE_MAX;
    const finalVal = Math.max(numVal, localMinPrice);
    const sliderVal = Math.min(finalVal, PRICE_MAX);
    setLocalMaxPrice(sliderVal);
    setMaxPriceInput(String(finalVal));
    updateFilters({
      maxPrice: finalVal >= PRICE_MAX ? null : finalVal,
    });
  }, [maxPriceInput, localMinPrice, updateFilters]);

  const handlePriceChangeComplete = useCallback(() => {
    // Only update global filters when user releases the slider
    updateFilters({
      minPrice: localMinPrice === PRICE_MIN ? null : localMinPrice,
      maxPrice: localMaxPrice === PRICE_MAX ? null : localMaxPrice,
    });
  }, [localMinPrice, localMaxPrice, updateFilters]);

  const handleReset = () => {
    setLocalMinPrice(PRICE_MIN);
    setLocalMaxPrice(PRICE_MAX);
    setMinPriceInput(String(PRICE_MIN));
    setMaxPriceInput(String(PRICE_MAX));
    updateFilters({
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      bathrooms: null,
      propertyType: null,
      listingType: null,
    });
  };

  const formatPrice = (price) => {
    if (price >= PRICE_MAX) {
      return '$10k+';
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span>Filters</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Filters Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[320px] max-h-[80vh] overflow-y-auto">
          <div className="p-4">
            <div className="space-y-3">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="px-2">
                  {/* Price input fields */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="text"
                        value={minPriceInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setMinPriceInput(val);
                        }}
                        onBlur={confirmMinPrice}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                        }}
                        className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="text"
                        value={maxPriceInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setMaxPriceInput(val);
                        }}
                        onBlur={confirmMaxPrice}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                        }}
                        className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Dual range slider container */}
                  <div className="relative h-8">
                    {/* Track background */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full" />

                    {/* Active track (between thumbs) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-primary-500 rounded-full pointer-events-none"
                      style={{
                        left: `${(localMinPrice / PRICE_MAX) * 100}%`,
                        right: `${100 - (localMaxPrice / PRICE_MAX) * 100}%`,
                      }}
                    />

                    {/* Min price slider */}
                    <input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step={100}
                      value={localMinPrice}
                      onChange={(e) => handleMinPriceChange(e.target.value)}
                      onMouseUp={handlePriceChangeComplete}
                      onTouchEnd={handlePriceChangeComplete}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                    />

                    {/* Max price slider */}
                    <input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step={100}
                      value={localMaxPrice}
                      onChange={(e) => handleMaxPriceChange(e.target.value)}
                      onMouseUp={handlePriceChangeComplete}
                      onTouchEnd={handlePriceChangeComplete}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                    />
                  </div>

                  {/* Range labels */}
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{formatPrice(PRICE_MIN)}</span>
                    <span>{formatPrice(PRICE_MAX)}</span>
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms || ""}
                  onChange={(e) =>
                    updateFilters({ bedrooms: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <select
                  value={filters.bathrooms || ""}
                  onChange={(e) =>
                    updateFilters({ bathrooms: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) =>
                    updateFilters({ propertyType: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
