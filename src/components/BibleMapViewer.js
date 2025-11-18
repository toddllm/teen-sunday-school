import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMap as useMapContext } from '../contexts/MapContext';
import LocationDetailView from './LocationDetailView';
import './BibleMapViewer.css';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom map controller to update center and zoom
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

const BibleMapViewer = ({ lessonId = null, compactMode = false }) => {
  const {
    locations,
    selectedLocation,
    loading,
    error,
    mapCenter,
    mapZoom,
    filters,
    selectLocation,
    clearSelection,
    updateFilters,
    trackLocationHover,
    getLocationsByLesson,
    getRegions,
  } = useMapContext();

  const [lessonLocations, setLessonLocations] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load lesson-specific locations if lessonId is provided
  useEffect(() => {
    if (lessonId) {
      loadLessonLocations();
    }
  }, [lessonId]);

  const loadLessonLocations = async () => {
    if (lessonId) {
      const lessonLocs = await getLocationsByLesson(lessonId);
      setLessonLocations(lessonLocs);
    }
  };

  const displayLocations = lessonId && lessonLocations.length > 0
    ? lessonLocations
    : locations;

  const regions = getRegions();

  const handleMarkerClick = (location) => {
    selectLocation(location.id);
  };

  const handleMarkerMouseOver = (location) => {
    trackLocationHover(location.id);
  };

  const handleSearch = () => {
    updateFilters({ search: searchInput });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRegionFilter = (region) => {
    updateFilters({ region: region || null });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    updateFilters({ search: '', region: null });
  };

  if (loading && displayLocations.length === 0) {
    return (
      <div className="bible-map-viewer">
        <div className="map-loading">Loading biblical locations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bible-map-viewer">
        <div className="map-error">{error}</div>
      </div>
    );
  }

  return (
    <div className={`bible-map-viewer ${compactMode ? 'compact' : ''}`}>
      {!compactMode && (
        <div className="map-header">
          <h2>Bible Maps & Locations</h2>
          <p className="map-subtitle">
            Explore biblical locations with historical context and related passages
          </p>
        </div>
      )}

      {!compactMode && (
        <div className="map-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search locations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>

          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {(filters.search || filters.region) && (
            <button onClick={handleClearFilters} className="clear-filters">
              Clear Filters
            </button>
          )}
        </div>
      )}

      {showFilters && !compactMode && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Region:</label>
            <select
              value={filters.region || ''}
              onChange={(e) => handleRegionFilter(e.target.value)}
              className="region-select"
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="map-container-wrapper">
        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController center={mapCenter} zoom={mapZoom} />

            {displayLocations.map((location) => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                eventHandlers={{
                  click: () => handleMarkerClick(location),
                  mouseover: () => handleMarkerMouseOver(location),
                }}
              >
                <Popup>
                  <div className="location-popup">
                    <h3>{location.name}</h3>
                    {location.alternateNames && (
                      <p className="alternate-names">
                        Also known as: {location.alternateNames}
                      </p>
                    )}
                    <p className="location-summary">{location.summary}</p>
                    <button
                      onClick={() => handleMarkerClick(location)}
                      className="view-details-button"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selectedLocation && (
          <div className="location-detail-panel">
            <LocationDetailView
              location={selectedLocation}
              onClose={clearSelection}
            />
          </div>
        )}
      </div>

      {!compactMode && (
        <div className="map-footer">
          <p className="location-count">
            Showing {displayLocations.length} location{displayLocations.length !== 1 ? 's' : ''}
            {lessonId && ' for this lesson'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BibleMapViewer;
