import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import bibleMapAPI from '../services/bibleMapAPI';

const MapContext = createContext();

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};

export const MapProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({
    region: null,
    search: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map view settings
  const [mapCenter, setMapCenter] = useState([31.7683, 35.2137]); // Jerusalem
  const [mapZoom, setMapZoom] = useState(7);

  // Load locations when filters change
  useEffect(() => {
    loadLocations();
  }, [filters]);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams = {};
      if (filters.region) filterParams.region = filters.region;
      if (filters.search) filterParams.search = filters.search;
      if (filters.isActive !== undefined) filterParams.isActive = filters.isActive;

      const data = await bibleMapAPI.getAllLocations(filterParams);
      setLocations(data.locations || []);

      // Track map view
      await bibleMapAPI.trackMapAction('MAP_VIEW');
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load bible locations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const selectLocation = useCallback(async (locationId) => {
    if (!locationId) {
      setSelectedLocation(null);
      return;
    }

    try {
      const location = await bibleMapAPI.getLocationById(locationId);
      setSelectedLocation(location);

      // Center map on selected location
      if (location.latitude && location.longitude) {
        setMapCenter([location.latitude, location.longitude]);
        setMapZoom(10);
      }
    } catch (err) {
      console.error('Error loading location:', err);
      setError('Failed to load location details');
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    setMapZoom(7);
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      region: null,
      search: '',
      isActive: true
    });
  }, []);

  const trackLocationHover = useCallback(async (locationId) => {
    await bibleMapAPI.trackMapAction('LOCATION_HOVER', locationId);
  }, []);

  const trackPassageClick = useCallback(async (locationId, passageReference) => {
    await bibleMapAPI.trackMapAction('PASSAGE_CLICK', locationId, {
      passageReference
    });
  }, []);

  const getLocationsByLesson = useCallback(async (lessonId) => {
    try {
      const data = await bibleMapAPI.getLocationsByLessonId(lessonId);
      return data.locations || [];
    } catch (err) {
      console.error('Error loading lesson locations:', err);
      return [];
    }
  }, []);

  const getLocationsByRegion = useCallback(async (region) => {
    try {
      const data = await bibleMapAPI.getLocationsByRegion(region);
      return data.locations || [];
    } catch (err) {
      console.error('Error loading region locations:', err);
      return [];
    }
  }, []);

  // Helper function to get unique regions from locations
  const getRegions = useCallback(() => {
    const regions = new Set();
    locations.forEach(loc => {
      if (loc.region) regions.add(loc.region);
    });
    return Array.from(regions).sort();
  }, [locations]);

  const value = {
    // State
    locations,
    selectedLocation,
    filters,
    loading,
    error,
    mapCenter,
    mapZoom,

    // Actions
    loadLocations,
    selectLocation,
    clearSelection,
    updateFilters,
    resetFilters,
    setMapCenter,
    setMapZoom,

    // Tracking
    trackLocationHover,
    trackPassageClick,

    // Helpers
    getLocationsByLesson,
    getLocationsByRegion,
    getRegions,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export default MapContext;
