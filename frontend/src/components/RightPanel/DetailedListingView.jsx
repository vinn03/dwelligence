import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { commuteAPI } from '../../services/api';

const DetailedListingView = ({ property, onBack }) => {
  const { workplace, transportMode, detailedViewTab, setDetailedViewTab, selectedRoutes, setSelectedRoutes } = useAppContext();
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Fetch routes when Commute tab is active
  useEffect(() => {
    if (detailedViewTab === 'commute' && workplace && property) {
      fetchRoutes();
    } else {
      // Clear routes when switching away from commute tab
      setRoutes([]);
      setSelectedRoutes([]);
    }
  }, [detailedViewTab, workplace, property, transportMode]);

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const response = await commuteAPI.getRoutes(
        { lat: property.lat, lng: property.lng },
        { lat: workplace.lat, lng: workplace.lng },
        transportMode
      );
      setRoutes(response.data);
      setSelectedRoutes(response.data); // Update context for map rendering
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const renderDetailsTab = () => (
    <div className="space-y-4">
      {/* Price */}
      <div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-primary-600">
            ${property.price.toLocaleString()}
          </span>
          <span className="text-gray-600 mb-1">
            {property.sale_type === 'rent' ? '/month' : ''}
          </span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Bedrooms</p>
          <p className="text-lg font-semibold">{property.bedrooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Bathrooms</p>
          <p className="text-lg font-semibold">{property.bathrooms}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Square Feet</p>
          <p className="text-lg font-semibold">{property.sq_ft?.toLocaleString() || 'N/A'}</p>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Property Type</p>
          <p className="font-medium capitalize">{property.property_type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Listing Type</p>
          <p className="font-medium capitalize">{property.sale_type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Address</p>
          <p className="font-medium">{property.address}</p>
        </div>
      </div>
    </div>
  );

  const renderCommuteTab = () => {
    if (!workplace) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 text-sm">Set your workplace to see commute routes</p>
        </div>
      );
    }

    if (loadingRoutes) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Finding routes...</p>
          </div>
        </div>
      );
    }

    if (routes.length === 0) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 text-sm">No routes found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {routes.map((route, index) => (
          <div
            key={route.routeIndex}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-primary-600">
                {route.durationText}
              </span>
              <span className="text-sm text-gray-600">{route.distanceText}</span>
            </div>
            <p className="text-sm text-gray-700">via {route.summary}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderNearbyTab = () => (
    <div className="flex items-center justify-center h-40">
      <p className="text-gray-500 text-sm">Nearby places feature coming soon (Iteration 2)</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Enlarged Thumbnail with Back Button */}
      <div className="relative h-64 flex-shrink-0">
        <img
          src={property.image_url || 'https://via.placeholder.com/400x300'}
          alt={property.address}
          className="w-full h-full object-cover"
        />
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setDetailedViewTab('details')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            detailedViewTab === 'details'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setDetailedViewTab('commute')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            detailedViewTab === 'commute'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Commute
        </button>
        <button
          onClick={() => setDetailedViewTab('nearby')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            detailedViewTab === 'nearby'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Nearby
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {detailedViewTab === 'details' && renderDetailsTab()}
        {detailedViewTab === 'commute' && renderCommuteTab()}
        {detailedViewTab === 'nearby' && renderNearbyTab()}
      </div>
    </div>
  );
};

export default DetailedListingView;
