import { useAppContext } from '../../context/AppContext';
import { APIProvider } from '@vis.gl/react-google-maps';
import SearchBar from './SearchBar';
import WorkplaceInput from './WorkplaceInput';
import TransportModeToggle from './TransportModeToggle';
import Filters from './Filters';

const Header = () => {
  const { workplace } = useAppContext();

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="h-16 px-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary-600">Dwelligence</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Workplace Display/Input */}
          <WorkplaceInput />

          {/* Transport Mode Toggle */}
          <TransportModeToggle />

          {/* Filters Button */}
          <Filters />
        </div>

        {/* Show prompt if workplace not set */}
        {!workplace && (
          <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2">
            <p className="text-sm text-yellow-800">
              Set your workplace to see commute times and better ranked results
            </p>
          </div>
        )}
      </header>
    </APIProvider>
  );
};

export default Header;
