import { useEffect, useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  link?: string;
}

export default function SavedNews() {
  const [savedNews, setSavedNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Load saved news from localStorage
    const saved = localStorage.getItem("savedNews");
    if (saved) {
      setSavedNews(JSON.parse(saved));
    }
  }, []);

  const removeSaved = (id: string) => {
    const updated = savedNews.filter((item) => item.id !== id);
    setSavedNews(updated);
    localStorage.setItem("savedNews", JSON.stringify(updated));
  };

  const clearAll = () => {
    setSavedNews([]);
    localStorage.removeItem("savedNews");
  };

  if (savedNews.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          📌 No saved articles yet
        </p>
        <p className="text-gray-500 text-sm">
          Click the star icon on any article to save it for later
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved Articles ({savedNews.length})
        </h2>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Clear All
        </button>
      </div>

      <ul className="space-y-6">
        {savedNews.map((item) => (
          <li
            key={item.id}
            className="border-l-4 border-yellow-500 bg-white dark:bg-gray-800 p-6 rounded-r-lg shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  📅 {new Date(item.date).toLocaleDateString("en-IN")}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                  {item.content}
                </p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Read more →
                  </a>
                )}
              </div>
              <button
                onClick={() => removeSaved(item.id)}
                className="ml-4 text-red-600 hover:text-red-800 text-xl"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
