import { useState, useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useAppContext } from '../../context/AppContext';

const SearchBar = ({ onPlaceSelected }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const placesLibrary = useMapsLibrary('places');
  const { setMapBounds } = useAppContext();

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    // Initialize autocomplete
    const autocomplete = new placesLibrary.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      types: ['geocode'], // Use 'geocode' for addresses, cities, neighborhoods
      componentRestrictions: { country: 'us' }, // Restrict to USA (San Francisco)
    });

    autocompleteRef.current = autocomplete;

    // Listen for place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.error('No geometry for selected place');
        return;
      }

      // Get the location
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      // Update the input value
      setQuery(place.formatted_address || place.name || '');

      // Pan map to the selected location
      if (place.geometry.viewport) {
        // If place has a viewport, use it
        const bounds = {
          north: place.geometry.viewport.getNorthEast().lat(),
          south: place.geometry.viewport.getSouthWest().lat(),
          east: place.geometry.viewport.getNorthEast().lng(),
          west: place.geometry.viewport.getSouthWest().lng(),
        };
        setMapBounds(bounds);
      } else {
        // Otherwise, create bounds around the point
        const latLng = place.geometry.location;
        const offset = 0.01; // Roughly 1km
        const bounds = {
          north: latLng.lat() + offset,
          south: latLng.lat() - offset,
          east: latLng.lng() + offset,
          west: latLng.lng() - offset,
        };
        setMapBounds(bounds);
      }

      // Call the callback if provided
      if (onPlaceSelected) {
        onPlaceSelected(place, location);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [placesLibrary, onPlaceSelected, setMapBounds]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Trigger autocomplete selection if user pressed enter
    if (query && autocompleteRef.current) {
      window.google.maps.event.trigger(autocompleteRef.current, 'place_changed');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for an address or neighborhood"
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;
