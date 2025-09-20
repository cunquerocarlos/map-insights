import { createContext, useContext, useEffect, useState } from 'react';

const SearchHistoryContext = createContext();

export const useSearchHistory = () => {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
};

export const SearchHistoryProvider = ({ children }) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('mapInsightsSearchHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSearchHistory(parsedHistory);
      } catch (error) {
        console.error('Error parsing search history from localStorage:', error);
        setSearchHistory([]);
      }
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mapInsightsSearchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addToHistory = (searchData) => {
    const historyItem = {
      id: Date.now(), // Simple ID generation
      timestamp: new Date().toISOString(),
      address: searchData.address,
      coordinates: searchData.coordinates,
      scores: {
        walkingScore: searchData.walkingScore,
        drivingScore: searchData.drivingScore,
        urbanSuburbanIndex: searchData.urbanSuburbanIndex
      }
    };

    setSearchHistory(prevHistory => {
      // Remove any existing entry with the same address to avoid duplicates
      const filteredHistory = prevHistory.filter(item => item.address !== historyItem.address);
      
      // Add new item to the beginning and limit to 10 items
      return [historyItem, ...filteredHistory].slice(0, 10);
    });
  };

  const removeFromHistory = (id) => {
    setSearchHistory(prevHistory => 
      prevHistory.filter(item => item.id !== id)
    );
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const toggleHistoryVisibility = () => {
    setIsHistoryVisible(prev => !prev);
  };

  const selectFromHistory = (historyItem) => {
    // This will be used to populate the search input and trigger score calculation
    return {
      address: historyItem.address,
      coordinates: historyItem.coordinates,
      scores: historyItem.scores
    };
  };

  const value = {
    searchHistory,
    isHistoryVisible,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleHistoryVisibility,
    selectFromHistory
  };

  return (
    <SearchHistoryContext.Provider value={value}>
      {children}
    </SearchHistoryContext.Provider>
  );
};
