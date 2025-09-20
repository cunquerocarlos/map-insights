import { useCallback, useState } from 'react';

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Amenity types and their weights for scoring
const AMENITIES_WEIGHTS = {
  supermarket: 3,
  school: 5,
  hospital: 5,
  park: 2,
  restaurant: 1,
  bus_stop: 2
};

// Amenity types and their colors for map markers
const AMENITY_COLORS = {
  supermarket: '#ff6b6b',    // Red
  school: '#4ecdc4',         // Teal
  hospital: '#45b7d1',       // Blue
  park: '#96ceb4',           // Green
  restaurant: '#feca57',     // Yellow
  bus_stop: '#ff9ff3'        // Pink
};

const AMENITY_ICONS = {
  supermarket: '🛒',
  school: '🏫',
  hospital: '🏥',
  park: '🌳',
  restaurant: '🍽️',
  bus_stop: '🚌'
};

/**
 * Hook for managing amenities-related operations
 * Provides methods to fetch nearby amenities, calculate scores, and get street density
 */
export function useAmenities() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cachedAmenities, setCachedAmenities] = useState(null);
  const [cachedCoordinates, setCachedCoordinates] = useState(null);

  /**
   * Check if cached amenities are valid for given coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} radius - Search radius in meters
   * @returns {boolean} Whether cached data is valid
   */
  const isCacheValid = useCallback((lat, lon, radius) => {
    if (!cachedAmenities || !cachedCoordinates) return false;
    
    const { lat: cachedLat, lon: cachedLon, radius: cachedRadius } = cachedCoordinates;
    const latDiff = Math.abs(lat - cachedLat);
    const lonDiff = Math.abs(lon - cachedLon);
    
    // Cache is valid if coordinates are within 50 meters and radius is the same or smaller
    return latDiff < 0.0005 && lonDiff < 0.0005 && radius <= cachedRadius;
  }, [cachedAmenities, cachedCoordinates]);

  /**
   * Fetch nearby amenities using Overpass API with caching
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} radius - Search radius in meters (default: 1000)
   * @param {boolean} includeNames - Whether to include amenity names (default: false)
   * @returns {Promise<Array>} Array of amenity objects
   */
  const getNearbyAmenities = useCallback(async (lat, lon, radius = 1000, includeNames = false) => {
    // Check if we have valid cached data
    if (isCacheValid(lat, lon, radius)) {
      console.log('Using cached amenities data');
      return cachedAmenities;
    }

    setLoading(true);
    setError(null);
    
    try {
      const keys = Object.keys(AMENITIES_WEIGHTS).join("|");
      const query = `
        [out:json];
        (
          node(around:${radius},${lat},${lon})[amenity~"${keys}"];
          way(around:${radius},${lat},${lon})[amenity~"${keys}"];
        );
        out center;
      `;
      
      const response = await fetch(OVERPASS_API, {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const amenities = data.elements.map(e => ({
        amenity: e.tags.amenity,
        ...(includeNames && { name: e.tags.name || `${e.tags.amenity} (${e.tags.amenity})` }),
        lat: e.lat || e.center?.lat,
        lon: e.lon || e.center?.lon
      }));

      // Cache the results
      setCachedAmenities(amenities);
      setCachedCoordinates({ lat, lon, radius });
      
      return amenities;
    } catch (err) {
      console.error("Error fetching amenities:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, cachedAmenities]);

  /**
   * Calculate walking score based on nearby amenities
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} radius - Search radius in meters (default: 1000)
   * @returns {Promise<number>} Walking score (0-100)
   */
  const calculateWalkingScore = useCallback(async (lat, lon, radius = 1000) => {
    const amenities = await getNearbyAmenities(lat, lon, radius);
    
    let score = 0;
    amenities.forEach(a => {
      score += AMENITIES_WEIGHTS[a.amenity] || 0;
    });
    
    const finalScore = Math.min(Math.round((score / 20) * 100), 100);
    console.log(amenities, score, finalScore);
    return finalScore;
  }, [getNearbyAmenities]);

  /**
   * Get street density in a given area
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} radius - Search radius in meters (default: 1000)
   * @returns {Promise<number>} Number of streets found
   */
  const getStreetDensity = useCallback(async (lat, lon, radius = 1000) => {
    setLoading(true);
    setError(null);
    
    try {
      const query = `
        [out:json];
        way(around:${radius},${lat},${lon})[highway~"residential|primary|secondary|tertiary|service"];
        out count;
      `;
      
      const response = await fetch(OVERPASS_API, {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.elements.length;
    } catch (err) {
      console.error("Overpass street density error:", err);
      setError(err.message);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate urban/suburban index based on amenities and street density
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Object with score and label
   */
  const calculateUrbanSuburbanIndex = useCallback(async (lat, lon) => {
    const amenities = await getNearbyAmenities(lat, lon, 1000);
    const amenityCount = amenities.length;
    const streetCount = await getStreetDensity(lat, lon, 1000);

    const maxAmenity = 50; 
    const maxStreet = 50;  

    let score =
      Math.min(amenityCount / maxAmenity, 1) * 60 +  // 60% weight amenities
      Math.min(streetCount / maxStreet, 1) * 40;     // 40% weight streets

    score = Math.round(score);

    // Label
    let label = "";
    if (score <= 40) label = "Suburban / Rural";
    else if (score <= 70) label = "Mixed / Low Density Urban";
    else label = "Urban / High Density";

    return { score, label };
  }, [getNearbyAmenities, getStreetDensity]);

  /**
   * Calculate all scores at once to minimize API calls
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Object with all calculated scores
   */
  const calculateAllScores = useCallback(async (lat, lon) => {
    setLoading(true);
    setError(null);

    try {
      // Get amenities once for both walking scores
      const amenities = await getNearbyAmenities(lat, lon, 1000);
      
      // Calculate walking score (1km radius)
      let walkingScore = 0;
      amenities.forEach(a => {
        walkingScore += AMENITIES_WEIGHTS[a.amenity] || 0;
      });
      walkingScore = Math.min(Math.round((walkingScore / 20) * 100), 100);

      // Get amenities for driving score (3km radius) - this will be a separate API call
      const drivingAmenities = await getNearbyAmenities(lat, lon, 3000);
      let drivingScore = 0;
      drivingAmenities.forEach(a => {
        drivingScore += AMENITIES_WEIGHTS[a.amenity] || 0;
      });
      drivingScore = Math.min(Math.round((drivingScore / 20) * 100), 100);

      // Calculate urban/suburban index using the 1km amenities
      const amenityCount = amenities.length;
      const streetCount = await getStreetDensity(lat, lon, 1000);

      const maxAmenity = 50; 
      const maxStreet = 50;  

      let urbanScore =
        Math.min(amenityCount / maxAmenity, 1) * 60 +  // 60% weight amenities
        Math.min(streetCount / maxStreet, 1) * 40;     // 40% weight streets

      urbanScore = Math.round(urbanScore);

      // Label
      let label = "";
      if (urbanScore <= 40) label = "Suburban / Rural";
      else if (urbanScore <= 70) label = "Mixed / Low Density Urban";
      else label = "Urban / High Density";

      return {
        walkingScore,
        drivingScore,
        urbanSuburbanIndex: { score: urbanScore, label }
      };
    } catch (err) {
      console.error("Error calculating all scores:", err);
      setError(err.message);
      return {
        walkingScore: 0,
        drivingScore: 0,
        urbanSuburbanIndex: { score: 0, label: "Unknown" }
      };
    } finally {
      setLoading(false);
    }
  }, [getNearbyAmenities, getStreetDensity]);

  return {
    // State
    loading,
    error,
    
    // Methods
    getNearbyAmenities,
    calculateWalkingScore,
    getStreetDensity,
    calculateUrbanSuburbanIndex,
    calculateAllScores,
    
    // Constants
    AMENITIES_WEIGHTS,
    AMENITY_COLORS,
    AMENITY_ICONS
  };
}
