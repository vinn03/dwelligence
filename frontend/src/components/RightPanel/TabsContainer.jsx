import { useAppContext } from '../../context/AppContext';

const TabsContainer = ({ activeTab, setActiveTab }) => {
  const { aiResults } = useAppContext();

  // Show AI Results tab only if there are AI search results
  const showAITab = aiResults && aiResults.length > 0;

  const tabs = [
    { id: 'top', label: 'Top Matches' },
    { id: 'favorites', label: 'Favorites' }
  ];

  if (showAITab) {
    tabs.push({ id: 'ai-results', label: 'AI Results', icon: 'sparkles' });
  }

  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon === 'sparkles' && (
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
            )}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsContainer;
