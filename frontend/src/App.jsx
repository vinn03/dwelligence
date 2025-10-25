import Header from './components/Header/Header';
import MapContainer from './components/Map/MapContainer';
import RightPanel from './components/RightPanel/RightPanel';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main content: Map + Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Container */}
          <div className="flex-1 relative">
            <MapContainer />
          </div>

          {/* Right Panel */}
          <RightPanel />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
