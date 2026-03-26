import { useAppContext } from "../../../context/AppContext";
import AskListingTab from "../ai/AskListingTab";
import DetailsTab from "./DetailsTab";
import CommuteTab from "./CommuteTab";
import NearbyTab from "./NearbyTab";

const DetailedListingView = ({ property, onBack }) => {
  const {
    workplace,
    detailedViewTab,
    setDetailedViewTab,
    favorites,
    toggleFavorite,
  } = useAppContext();

  const isFavorite = favorites.includes(property.id);

  return (
    <div className="h-full flex flex-col">
      <div className="relative h-64 flex-shrink-0">
        <img
          src={property.imageUrl || "https://via.placeholder.com/400x300"}
          alt={property.address}
          className="w-full h-full object-cover"
        />
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id, property);
          }}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          {isFavorite ? (
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
        <button
          onClick={() => setDetailedViewTab("ask")}
          className={`absolute bottom-4 left-4 px-3 py-2 rounded-full shadow-lg transition-all flex items-center gap-2 ${
            detailedViewTab === "ask"
              ? "bg-primary-600 text-white"
              : "bg-white text-gray-700 hover:bg-primary-50"
          }`}
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
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <span className="text-sm font-medium">Ask AI</span>
        </button>
      </div>

      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setDetailedViewTab("details")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            detailedViewTab === "details"
              ? "border-b-2 border-primary-600 text-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Details
        </button>
        {workplace && (
          <button
            onClick={() => setDetailedViewTab("commute")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              detailedViewTab === "commute"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Commute
          </button>
        )}
        <button
          onClick={() => setDetailedViewTab("nearby")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            detailedViewTab === "nearby"
              ? "border-b-2 border-primary-600 text-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Nearby
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {detailedViewTab === "details" && <DetailsTab property={property} />}
        {detailedViewTab === "commute" && <CommuteTab property={property} />}
        {detailedViewTab === "nearby" && <NearbyTab property={property} />}
        {detailedViewTab === "ask" && <AskListingTab property={property} />}
      </div>
    </div>
  );
};

export default DetailedListingView;
