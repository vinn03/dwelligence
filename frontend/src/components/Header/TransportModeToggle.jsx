import { useAppContext } from '../../context/AppContext';
import { useState, useRef, useEffect } from 'react';

const modes = [
  { id: 'driving', label: 'Drive', icon: '🚗' },
  { id: 'bicycling', label: 'Bike', icon: '🚴' },
  { id: 'transit', label: 'Transit', icon: '🚈' },
  { id: 'walking', label: 'Walk', icon: '🚶' }
];

const TransportModeToggle = () => {
  const { transportMode, setTransportMode } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get current mode details
  const currentMode = modes.find(mode => mode.id === transportMode) || modes[2];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (modeId) => {
    setTransportMode(modeId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-2"
      >
        <span>{currentMode.icon}</span>
        <span>{currentMode.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px]">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleSelect(mode.id)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                transportMode === mode.id
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
              {transportMode === mode.id && (
                <span className="ml-auto text-primary-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransportModeToggle;
