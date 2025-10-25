import { useAppContext } from '../../context/AppContext';
import TabsContainer from './TabsContainer';
import Listing from '../Listing/Listing';

const RightPanel = () => {
  const {
    activeTab,
    setActiveTab,
    visibleProperties,
    favorites,
    loading,
    calculatingCommutes,
    workplace
  } = useAppContext();

  // Get favorite properties
  const favoriteProperties = visibleProperties.filter((p) =>
    favorites.includes(p.id)
  );

  // Sort properties by commute-aware ranking (for Top tab)
  const getSortedProperties = () => {
    if (!workplace) {
      // No workplace set, sort by price only
      return [...visibleProperties].sort((a, b) => a.price - b.price);
    }

    // Commute-aware ranking: (duration_seconds * 0.5) + (price * 0.5)
    // Lower score = better
    return [...visibleProperties].sort((a, b) => {
      const getDurationSeconds = (property) => {
        return property.commute?.duration || 999999; // Properties without commute go to bottom
      };

      const scoreA = (getDurationSeconds(a) * 0.5) + (a.price * 0.5);
      const scoreB = (getDurationSeconds(b) * 0.5) + (b.price * 0.5);

      return scoreA - scoreB;
    });
  };

  // Render properties based on active tab
  const renderProperties = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
      );
    }

    let propertiesToShow = [];
    let emptyMessage = '';

    if (activeTab === 'top') {
      const sortedProperties = getSortedProperties();
      propertiesToShow = sortedProperties.slice(0, 20); // Top 20
      emptyMessage = 'No properties found in this area.';
    } else if (activeTab === 'favorites') {
      propertiesToShow = favoriteProperties;
      emptyMessage = 'No favorites yet. Click the heart icon on any listing to save it.';
    }

    if (propertiesToShow.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {propertiesToShow.map((property) => (
          <div key={property.id} className="cursor-pointer">
            <Listing property={property} compact={false} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* Tabs */}
      <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Show workplace prompt if not set */}
        {!workplace && activeTab === 'top' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Set your workplace to see properties ranked by commute time
            </p>
          </div>
        )}

        {/* Show calculating commutes indicator */}
        {calculatingCommutes && workplace && activeTab === 'top' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
              <p className="text-sm text-amber-800">Calculating commutes...</p>
            </div>
          </div>
        )}

        {renderProperties()}
      </div>
    </div>
  );
};

export default RightPanel;
