import { useAppContext } from '../../context/AppContext';

const modes = [
  { id: 'driving', label: 'Drive', icon: '🚗' },
  { id: 'bicycling', label: 'Bike', icon: '🚴' },
  { id: 'transit', label: 'Transit', icon: '🚉' },
  { id: 'walking', label: 'Walk', icon: '🚶' }
];

const TransportModeToggle = () => {
  const { transportMode, setTransportMode } = useAppContext();

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setTransportMode(mode.id)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            transportMode === mode.id
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="mr-1">{mode.icon}</span>
          {mode.label}
        </button>
      ))}
    </div>
  );
};

export default TransportModeToggle;
