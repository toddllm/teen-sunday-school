import React from 'react';
import './BigStoryTimeline.css';

const BigStoryTimeline = ({ sections, selectedSection, onSectionSelect }) => {
  // Group sections by timeline era
  const sectionsByEra = sections.reduce((acc, section) => {
    const era = section.timelineEra;
    if (!acc[era]) {
      acc[era] = [];
    }
    acc[era].push(section);
    return acc;
  }, {});

  const eras = ['Beginning', 'Old Testament', 'Gospels', 'Church Age', 'Future'];

  return (
    <div className="big-story-timeline">
      {eras.map((era) => {
        const eraSections = sectionsByEra[era] || [];
        if (eraSections.length === 0) return null;

        return (
          <div key={era} className="timeline-era">
            <div className="era-label">{era}</div>
            <div className="era-sections">
              {eraSections.map((section) => {
                const isSelected =
                  selectedSection && selectedSection.id === section.id;

                return (
                  <button
                    key={section.id}
                    className={`timeline-section ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() => onSectionSelect(section)}
                    style={{
                      borderLeftColor: section.visualData?.color || '#666',
                    }}
                  >
                    <div className="section-icon">
                      {section.visualData?.icon || '📖'}
                    </div>
                    <div className="section-info">
                      <div className="section-order">{section.order}</div>
                      <div className="section-title">{section.sectionTitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BigStoryTimeline;
