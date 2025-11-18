import React from 'react';
import { useMap } from '../contexts/MapContext';
import './LocationDetailView.css';

const LocationDetailView = ({ location, onClose }) => {
  const { trackPassageClick } = useMap();

  if (!location) return null;

  const handlePassageClick = (passage) => {
    trackPassageClick(location.id, passage.reference);
    // You can add navigation to Bible reader here
    // For now, we'll just track the click
  };

  return (
    <div className="location-detail-view">
      <div className="detail-header">
        <button onClick={onClose} className="close-button" aria-label="Close">
          ✕
        </button>
        <h2 className="location-name">{location.name}</h2>
        {location.alternateNames && (
          <p className="alternate-names">
            Also known as: {location.alternateNames}
          </p>
        )}
        {location.region && (
          <span className="region-badge">{location.region}</span>
        )}
      </div>

      <div className="detail-content">
        <section className="detail-section">
          <h3>Summary</h3>
          <p className="summary-text">{location.summary}</p>
        </section>

        {location.description && (
          <section className="detail-section">
            <h3>Description</h3>
            <p className="description-text">{location.description}</p>
          </section>
        )}

        {location.modernName && (
          <section className="detail-section">
            <h3>Modern Day</h3>
            <p className="modern-name">
              Today, this location is known as <strong>{location.modernName}</strong>
            </p>
          </section>
        )}

        {location.keyEvents && Array.isArray(location.keyEvents) && location.keyEvents.length > 0 && (
          <section className="detail-section">
            <h3>Key Events</h3>
            <div className="key-events-list">
              {location.keyEvents.map((event, index) => (
                <div key={index} className="key-event">
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {location.relatedPassages && Array.isArray(location.relatedPassages) && location.relatedPassages.length > 0 && (
          <section className="detail-section">
            <h3>Related Bible Passages</h3>
            <div className="passages-list">
              {location.relatedPassages.map((passage, index) => (
                <div key={index} className="passage-item">
                  <button
                    onClick={() => handlePassageClick(passage)}
                    className="passage-reference"
                  >
                    {passage.reference}
                  </button>
                  {passage.description && (
                    <p className="passage-description">{passage.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {location.imageUrl && (
          <section className="detail-section">
            <h3>Image</h3>
            <img
              src={location.imageUrl}
              alt={location.name}
              className="location-image"
            />
          </section>
        )}

        <section className="detail-section coordinates">
          <h3>Coordinates</h3>
          <p className="coordinates-text">
            Latitude: {location.latitude.toFixed(6)}<br />
            Longitude: {location.longitude.toFixed(6)}
          </p>
        </section>
      </div>
    </div>
  );
};

export default LocationDetailView;
