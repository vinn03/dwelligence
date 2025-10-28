const AIInterpretationBanner = ({ aiInterpretation }) => {
  if (!aiInterpretation) return null;

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-2">
        <svg
          className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
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
        <div>
          <p className="text-sm font-semibold text-primary-900">
            {aiInterpretation.summary}
          </p>
          <p className="text-xs text-primary-700 mt-1">
            Found {aiInterpretation.totalResults} properties matching your query
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInterpretationBanner;