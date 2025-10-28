import { APIProvider } from "@vis.gl/react-google-maps";
import SearchBar from "./search/SearchBar";
import WorkplaceInput from "./workplace/WorkplaceInput";
import TransportModeToggle from "./workplace/TransportModeToggle";
import ListingTypeToggle from "./search/ListingTypeToggle";
import Filters from "./search/Filters";
import Logo from "./ui/Logo";
import MapRenderToggle from "./ui/MapRenderToggle";
import WorkplacePrompt from "./workplace/WorkplacePrompt";

const Header = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="h-16 px-4 flex items-center justify-between gap-4">
          {/* Left group: Branding and Search */}
          <div className="flex items-center gap-4">
            <Logo />
            <ListingTypeToggle />
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
          </div>

          {/* Right group: Workplace and Controls */}
          <div className="flex items-center gap-4">
            <WorkplaceInput />
            <TransportModeToggle />
            <Filters />
            <MapRenderToggle />
          </div>
        </div>
        <WorkplacePrompt />
      </header>
    </APIProvider>
  );
};

export default Header;
