import { useEffect, useRef, useState } from 'react';
import { useScore } from '../contexts/ScoreContext';
import { useSearchHistory } from '../contexts/SearchHistoryContext';
import { useAmenities } from '../hooks/useAmenities';

const LOCATIONIQ_API = "https://api.locationiq.com/v1/autocomplete";

async function autocompleteAddress(query) {
  const url = `${LOCATIONIQ_API}?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&limit=10&format=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const suggestions = await response.json();
    return suggestions.map(item => ({
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon
    }));
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}


export default function AddressAutocomplete({ selectedAddress }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const { updateScoreData, setLoading, clearScoreData } = useScore();
  const { addToHistory } = useSearchHistory();
  const { calculateAllScores } = useAmenities();

  // Update query when selectedAddress changes (from history selection)
  useEffect(() => {
    if (selectedAddress) {
      setQuery(selectedAddress);
    }
  }, [selectedAddress]);

  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    

    timeoutRef.current = setTimeout(async () => {
      const results = await autocompleteAddress(value);
      setSuggestions(results);
      setShowSuggestions(true);
    }, 1000);
  };

  const handleSuggestionClick = async (item) => {
    setQuery(item.display_name);
    setSuggestions([]);
    setShowSuggestions(false);

    // Clear previous score data and set loading state
    clearScoreData();
    setLoading(true);

    try {
      // Calculate all scores at once to minimize API calls
      const scores = await calculateAllScores(item.lat, item.lon);

      // Update score data with all calculated values
      const scoreData = {
        walkingScore: scores.walkingScore,
        drivingScore: scores.drivingScore,
        urbanSuburbanIndex: scores.urbanSuburbanIndex,
        address: item.display_name,
        coordinates: {
          lat: item.lat,
          lon: item.lon
        }
      };
      
      updateScoreData(scoreData);
      
      // Add to search history
      addToHistory(scoreData);
    } catch (error) {
      console.error('Error calculating scores:', error);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 400 }}>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        placeholder="Type an address..."
        style={{ width: '100%', padding: 8 }}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            border: '1px solid #ccc',
            background: '#fff',
            position: 'absolute',
            width: '100%',
            zIndex: 1000,
            marginTop: 2
          }}
        >
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              style={{ padding: 8, cursor: 'pointer' }}
              onClick={() => handleSuggestionClick(item)}
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}