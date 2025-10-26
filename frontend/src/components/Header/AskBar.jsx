import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const AskBar = () => {
  const [query, setQuery] = useState('');
  const { workplace, setAiResults, setAiInterpretation, setActiveTab, setLoading } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleAskSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_URL}/search/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim(),
          workplace: workplace,
          maxResults: 20
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Check if clarification is needed
      if (data.needsClarity) {
        setError(data.clarificationQuestion);
        setIsProcessing(false);
        setLoading(false);
        return;
      }

      // Set AI results in context
      setAiResults(data.results || []);
      setAiInterpretation({
        query: data.query,
        summary: data.interpretation,
        totalResults: data.totalResults
      });

      // Switch to AI Results tab
      setActiveTab('ai-results');

      console.log('[AskBar] AI search completed:', data);
    } catch (err) {
      console.error('[AskBar] Error:', err);
      setError(err.message || 'Failed to process your query. Please try again.');
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1">
      <form onSubmit={handleAskSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything... '2BR near parks under $2500'"
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing || !query.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
            isProcessing || !query.trim()
              ? 'text-gray-300 cursor-not-allowed'
              : 'hover:bg-gray-100 text-primary-600'
          }`}
        >
          {isProcessing ? (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          )}
        </button>
      </form>

      {/* Error/Clarification Message */}
      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg z-50">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg z-50">
          <p className="text-sm text-blue-800">
            Analyzing your query with AI...
          </p>
        </div>
      )}
    </div>
  );
};

export default AskBar;
