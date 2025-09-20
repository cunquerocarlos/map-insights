import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useScore } from '../contexts/ScoreContext';
import { useAmenities } from '../hooks/useAmenities';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


const createIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Create main address icon
const createMainIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: #e74c3c;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      animation: pulse 2s infinite;
    ">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Component to update map view when coordinates change
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}


export default function MapDisplay() {
  const { scoreData } = useScore();
  const [amenities, setAmenities] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const { getNearbyAmenities, AMENITY_COLORS, AMENITY_ICONS } = useAmenities();

  useEffect(() => {
    if (scoreData?.coordinates) {
      setMapLoading(true);
      getNearbyAmenities(scoreData.coordinates.lat, scoreData.coordinates.lon, 1000, true)
        .then(setAmenities)
        .catch(console.error)
        .finally(() => setMapLoading(false));
    }
  }, [scoreData, getNearbyAmenities]);

  if (!scoreData?.coordinates) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3>📍 Interactive Map View</h3>
        <p>Select an address to view it on the interactive map with nearby amenities</p>
      </div>
    );
  }

  const { lat, lon } = scoreData.coordinates;
  const mapCenter = [parseFloat(lat), parseFloat(lon)];

  return (
    <div style={{
      margin: '20px 0',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
          {scoreData.address}
        </h3>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Click and drag to move around, scroll to zoom. Showing nearby amenities within 1km radius
        </p>
      </div>

      {mapLoading ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🗺️</div>
          Loading interactive map and amenities...
        </div>
      ) : (
        <>
          <div style={{ height: '500px', width: '100%' }}>
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <MapUpdater center={mapCenter} zoom={15} />
              
              {/* Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Main Address Marker */}
              <Marker position={mapCenter} icon={createMainIcon()}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                      📍 Selected Address
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      {scoreData.address}
                    </p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Amenity Markers */}
              {amenities.map((amenity, index) => (
                <Marker
                  key={index}
                  position={[parseFloat(amenity.lat), parseFloat(amenity.lon)]}
                  icon={createIcon(
                    AMENITY_COLORS[amenity.amenity] || '#666',
                    AMENITY_ICONS[amenity.amenity] || '📍'
                  )}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                        {AMENITY_ICONS[amenity.amenity]}
                      </div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                        {amenity.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>
                        {amenity.amenity.replace('_', ' ')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Amenities Legend */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #eee'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
              Nearby Amenities ({amenities.length} found)
            </h4>
            
            {amenities.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {Object.entries(AMENITY_COLORS).map(([amenityType, color]) => {
                  const count = amenities.filter(a => a.amenity === amenityType).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={amenityType} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #eee'
                    }}>
                      <span style={{ fontSize: '16px', marginRight: '8px' }}>
                        {AMENITY_ICONS[amenityType]}
                      </span>
                      <span style={{ 
                        flex: 1, 
                        textTransform: 'capitalize',
                        fontSize: '14px'
                      }}>
                        {amenityType.replace('_', ' ')}
                      </span>
                      <span style={{
                        backgroundColor: color,
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No amenities found in the nearby area.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
