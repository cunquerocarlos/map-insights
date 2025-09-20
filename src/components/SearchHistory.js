import { useScore } from '../contexts/ScoreContext';
import { useSearchHistory } from '../contexts/SearchHistoryContext';

const SearchHistory = ({ onSelectFromHistory }) => {
  const { 
    searchHistory, 
    isHistoryVisible, 
    removeFromHistory, 
    clearHistory, 
    toggleHistoryVisibility,
  } = useSearchHistory();
  
  const { updateScoreData } = useScore();

  const handleSelectFromHistory = (historyItem) => {
    // Update the score data with the selected history item
    updateScoreData({
      walkingScore: historyItem.scores.walkingScore,
      drivingScore: historyItem.scores.drivingScore,
      urbanSuburbanIndex: historyItem.scores.urbanSuburbanIndex,
      address: historyItem.address,
      coordinates: historyItem.coordinates
    });
    
    // If callback is provided, call it to update the input field
    if (onSelectFromHistory) {
      onSelectFromHistory(historyItem.address);
    }
    
    // Close the history panel
    toggleHistoryVisibility();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    if (score >= 40) return '#e67e22';
    return '#e74c3c';
  };

  if (!isHistoryVisible) {
    return (
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={toggleHistoryVisibility}
          style={{
            padding: '8px 16px',
            backgroundColor: searchHistory.length > 0 ? '#27ae60' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s',
            boxShadow: searchHistory.length > 0 ? '0 2px 4px rgba(39, 174, 96, 0.3)' : 'none'
          }}
        >
          📋 Search History ({searchHistory.length})
          {searchHistory.length > 0 && <span style={{ fontSize: '12px' }}>•</span>}
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      marginBottom: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#34495e',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>
          📋 Recent Searches ({searchHistory.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {searchHistory.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                padding: '4px 8px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear All
            </button>
          )}
          <button
            onClick={toggleHistoryVisibility}
            style={{
              padding: '4px 8px',
              backgroundColor: '#7f8c8d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* History List */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {searchHistory.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#7f8c8d',
            fontStyle: 'italic'
          }}>
            No recent searches yet. Start by searching for an address above!
          </div>
        ) : (
          searchHistory.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              onClick={() => handleSelectFromHistory(item)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '500',
                    color: '#2c3e50',
                    marginBottom: '4px',
                    fontSize: '14px'
                  }}>
                    {item.address}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#7f8c8d' }}>🚶</span>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '500',
                        color: getScoreColor(item.scores.walkingScore)
                      }}>
                        {item.scores.walkingScore}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#7f8c8d' }}>🚗</span>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '500',
                        color: getScoreColor(item.scores.drivingScore)
                      }}>
                        {item.scores.drivingScore}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#7f8c8d' }}>🏙️</span>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '500',
                        color: getScoreColor(item.scores.urbanSuburbanIndex.score)
                      }}>
                        {item.scores.urbanSuburbanIndex.score}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '11px', color: '#95a5a6' }}>
                    {formatDate(item.timestamp)}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'transparent',
                    color: '#e74c3c',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fdf2f2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchHistory;
