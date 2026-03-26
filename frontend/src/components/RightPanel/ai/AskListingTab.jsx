import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import useAskProperty from "../../../hooks/useAskProperty";

const EXAMPLE_QUESTIONS = [
  "Are there any coffee shops nearby?",
  "What grocery stores are close?",
  "Where can I find gyms?",
  "Any good restaurants in the area?",
  "Is there a pharmacy nearby?",
];

const AskListingTab = ({ property }) => {
  const { setPoiMarkers } = useAppContext();
  const [question, setQuestion] = useState("");

  const handlePOIsLoaded = (pois) => {
    setPoiMarkers(pois);
  };

  const { messages, isAsking, askQuestion } = useAskProperty(
    property.id,
    handlePOIsLoaded
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;
    
    const userQuestion = question.trim();
    setQuestion("");
    await askQuestion(userQuestion);
  };

  const handleExampleClick = async (exampleQuestion) => {
    setQuestion(exampleQuestion);
    await askQuestion(exampleQuestion);
    setQuestion("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-4">
              Ask me anything about this property's neighborhood!
            </p>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Try asking:</p>
              {EXAMPLE_QUESTIONS.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="block w-full text-left px-3 py-2 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary-600 text-white"
                    : message.isError
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {message.nearbyPOIs && message.nearbyPOIs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Top nearby places:
                    </p>
                    <div className="space-y-2">
                      {message.nearbyPOIs.map((poi, poiIndex) => (
                        <div key={poiIndex} className="text-xs flex gap-2">
                          <span className="font-semibold text-gray-600 flex-shrink-0">
                            {poiIndex + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {poi.name}
                            </p>
                            {poi.rating && (
                              <p className="text-gray-600">⭐ {poi.rating}/5</p>
                            )}
                            {poi.vicinity && (
                              <p className="text-gray-500">{poi.vicinity}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {isAsking && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about nearby amenities..."
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isAsking}
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded transition-colors ${
              isAsking || !question.trim()
                ? "text-gray-300 cursor-not-allowed"
                : "text-primary-600 hover:bg-primary-50"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskListingTab;
