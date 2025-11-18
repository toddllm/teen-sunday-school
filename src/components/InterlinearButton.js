import React, { useState, useEffect } from 'react';
import { hasInterlinearData } from '../services/interlinearAPI';
import InterlinearView from './InterlinearView';
import './InterlinearButton.css';

/**
 * InterlinearButton - Button to show/hide interlinear view for a verse
 * Checks if interlinear data is available before showing the button
 *
 * @param {string} verseRef - Verse reference in API format (e.g., "JHN.3.16")
 * @param {boolean} inline - Whether to show inline or stacked layout
 * @param {string} size - Button size: 'small', 'medium', 'large'
 * @param {boolean} showLabel - Whether to show "Interlinear" label next to icon
 */
const InterlinearButton = ({
  verseRef,
  inline = false,
  size = 'medium',
  showLabel = true
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [showInterlinear, setShowInterlinear] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!verseRef) {
        setChecking(false);
        return;
      }

      try {
        const available = await hasInterlinearData(verseRef);
        setIsAvailable(available);
      } catch (error) {
        console.error('Error checking interlinear availability:', error);
        setIsAvailable(false);
      } finally {
        setChecking(false);
      }
    };

    checkAvailability();
  }, [verseRef]);

  const handleToggle = () => {
    setShowInterlinear(!showInterlinear);
  };

  // Don't render anything if data is not available or still checking
  if (checking || !isAvailable) {
    return null;
  }

  return (
    <div className="interlinear-button-container">
      <button
        className={`interlinear-button ${size} ${showInterlinear ? 'active' : ''}`}
        onClick={handleToggle}
        title="View interlinear (original language words with translation)"
      >
        <span className="icon">📖</span>
        {showLabel && <span className="label">Interlinear</span>}
      </button>

      {showInterlinear && (
        <div className="interlinear-modal-overlay" onClick={handleToggle}>
          <div className="interlinear-modal-content" onClick={(e) => e.stopPropagation()}>
            <InterlinearView
              verseRef={verseRef}
              inline={inline}
              onClose={handleToggle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InterlinearButton;
