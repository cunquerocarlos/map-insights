import { createContext, useContext, useState } from 'react';

const ScoreContext = createContext();

export const useScore = () => {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};

export const ScoreProvider = ({ children }) => {
  const [scoreData, setScoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateScoreData = (data) => {
    setScoreData(data);
  };

  const setLoading = (loading) => {
    setIsLoading(loading);
  };

  const clearScoreData = () => {
    setScoreData(null);
  };

  const value = {
    scoreData,
    isLoading,
    updateScoreData,
    setLoading,
    clearScoreData
  };

  return (
    <ScoreContext.Provider value={value}>
      {children}
    </ScoreContext.Provider>
  );
};
