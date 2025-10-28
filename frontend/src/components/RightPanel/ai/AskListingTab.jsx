import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";

const AskListingTab = ({ property }) => {
  const { setPoiMarkers } = useAppContext();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const exampleQuestions = [
    "Are there any coffee shops nearby?",
    "What grocery stores are close?",
    "Where can I find gyms?",
    "Any good restaurants in the area?",
    "Is there a pharmacy nearby?",
  ];

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!question.trim() || isAsking) {
      return;
    }

    const userQuestion = question.trim();
    setQuestion(""); // Clear input immediately

    // Add user message to chat
    const userMessage = {
      role: "user",
      content: userQuestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAsking(true);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001/api";

      const response = await fetch(`${API_URL}/properties/${property.id}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.statusText}`);
      }

      const data = await response.json();

      // Add assistant message to chat
      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        nearbyPOIs: data.nearbyPOIs || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update map with POI markers
      if (data.nearbyPOIs && data.nearbyPOIs.length > 0) {
        setPoiMarkers(data.nearbyPOIs);
      }
    } catch (error) {
      console.error("[AskListingTab] Error:", error);

      // Add error message
      const errorMessage = {
        role: "assistant",
        content:
          "I'm having trouble answering your question right now. Please try again or rephrase your question.",
        isError: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleExampleClick = async (exampleQuestion) => {
    setQuestion(exampleQuestion);

    // Automatically submit the question
    const userMessage = {
      role: "user",
      content: exampleQuestion,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAsking(true);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001/api";

      const response = await fetch(`${API_URL}/properties/${property.id}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: exampleQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.statusText}`);
      }

      const data = await response.json();

      // Add assistant message to chat
      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        nearbyPOIs: data.nearbyPOIs || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update map with POI markers
      if (data.nearbyPOIs && data.nearbyPOIs.length > 0) {
        setPoiMarkers(data.nearbyPOIs);
      }
    } catch (error) {
      console.error("[AskListingTab] Error:", error);

      // Add error message
      const errorMessage = {
        role: "assistant",
        content:
          "I'm having trouble answering your question right now. Please try again or rephrase your question.",
        isError: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
      setQuestion(""); // Clear input after submission
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
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

            {/* Example Questions */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Try asking:</p>
              {exampleQuestions.map((example, index) => (
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

                {/* Show nearby POIs if available */}
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

        {/* Loading indicator */}
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

      {/* Input Form */}
      <form onSubmit={handleAsk} className="border-t border-gray-200 pt-4">
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
