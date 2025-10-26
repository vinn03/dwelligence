import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

const WorkplaceInput = () => {
  const { workplace, setWorkplace } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState("");
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const placesLibrary = useMapsLibrary("places");

  // Populate address when modal opens and workplace exists
  useEffect(() => {
    if (isOpen && workplace) {
      setAddress(workplace.formattedAddress || "");
    } else if (!isOpen) {
      setAddress("");
    }
  }, [isOpen, workplace]);

  // Initialize autocomplete when modal opens and places library is loaded
  useEffect(() => {
    if (!placesLibrary || !inputRef.current || !isOpen) return;

    const autocomplete = new placesLibrary.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "name", "place_id"],
      types: ["geocode"],
      componentRestrictions: { country: "us" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.error("No geometry for selected place");
        return;
      }

      const workplaceData = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        formattedAddress: place.formatted_address || place.name,
        placeId: place.place_id,
      };

      setWorkplace(workplaceData);
      setAddress(workplaceData.formattedAddress);
      setIsOpen(false);
    });

    autocompleteRef.current = autocomplete;
  }, [placesLibrary, isOpen, setWorkplace]);

  const handleSetWorkplace = (e) => {
    e.preventDefault();
    // If user manually entered address without selecting from autocomplete
    if (address && !autocompleteRef.current?.getPlace()?.geometry) {
      console.log("Please select an address from the dropdown");
      return;
    }
    setIsOpen(false);
  };

  const dropdownRef = useRef(null);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm font-medium">
          {workplace
            ? workplace.formattedAddress || "Workplace Set"
            : "Set Workplace"}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-[400px]">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Set Your Workplace</h3>
            <form onSubmit={handleSetWorkplace}>
              <input
                ref={inputRef}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter workplace address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-between">
                {workplace && (
                  <button
                    type="button"
                    onClick={() => {
                      setWorkplace(null);
                      setIsOpen(false);
                      setAddress("");
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300"
                  >
                    Remove
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Set Workplace
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkplaceInput;
