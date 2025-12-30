import { useState } from 'react';
import './App.css';
import AddressAutocomplete from './components/AddressAutocomplete';
import MapDisplay from './components/MapDisplay';
import ScoreDisplay from './components/ScoreDisplay';
import SearchHistory from './components/SearchHistory';
import { ScoreProvider } from './contexts/ScoreContext';
import { SearchHistoryProvider } from './contexts/SearchHistoryContext';

function App() {

  const JWT_PRIVATE_KEY = "235245324345Q32W#$raewfDS";
  
  const [selectedAddress, setSelectedAddress] = useState('');

  const handleSelectFromHistory = (address) => {
    setSelectedAddress(address);
  };

  return (
    <SearchHistoryProvider>
      <ScoreProvider>
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
            Map Insights - Location Analysis
          </h1>
          <SearchHistory onSelectFromHistory={handleSelectFromHistory} />
          <AddressAutocomplete selectedAddress={selectedAddress} />
          <MapDisplay />
          <ScoreDisplay />
        </div>
      </ScoreProvider>
    </SearchHistoryProvider>
  );
}

export default App;
