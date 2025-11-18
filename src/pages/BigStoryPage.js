import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBigStory } from '../contexts/BigStoryContext';
import BigStoryTimeline from '../components/BigStoryTimeline';
import BigStorySectionViewer from '../components/BigStorySectionViewer';
import { recordSectionView } from '../services/bigStoryService';
import './BigStoryPage.css';

const BigStoryPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sections, loading, getSectionBySlug } = useBigStory();

  const [selectedSection, setSelectedSection] = useState(null);
  const [viewStartTime, setViewStartTime] = useState(null);
  const [error, setError] = useState(null);

  // Load specific section from URL parameter
  useEffect(() => {
    const sectionSlug = searchParams.get('section');
    if (sectionSlug && sections.length > 0) {
      const section = getSectionBySlug(sectionSlug);
      if (section) {
        setSelectedSection(section);
        setViewStartTime(Date.now());
      } else {
        setError('Section not found');
      }
    } else if (sections.length > 0 && !selectedSection) {
      // Default to first section (Creation)
      setSelectedSection(sections[0]);
      setViewStartTime(Date.now());
      setSearchParams({ section: sections[0].sectionSlug });
    }
  }, [searchParams, sections, getSectionBySlug, selectedSection, setSearchParams]);

  const handleSectionSelect = (section) => {
    // Record metrics for previous section
    if (selectedSection && viewStartTime) {
      const timeSpentMs = Date.now() - viewStartTime;
      recordSectionView(selectedSection.id, {
        featureContext: searchParams.get('source') || 'direct',
        timeSpentMs,
      }).catch((err) => console.error('Error recording view:', err));
    }

    // Set new section
    setSelectedSection(section);
    setViewStartTime(Date.now());
    setSearchParams({ section: section.sectionSlug });
    setError(null);
  };

  const handlePassageClick = (passageRef) => {
    // Navigate to Bible tool with the passage reference
    navigate(`/bible?ref=${encodeURIComponent(passageRef)}`);
  };

  const handleNextSection = () => {
    if (!selectedSection) return;

    const currentIndex = sections.findIndex(
      (s) => s.sectionSlug === selectedSection.sectionSlug
    );
    if (currentIndex < sections.length - 1) {
      handleSectionSelect(sections[currentIndex + 1]);
    }
  };

  const handlePreviousSection = () => {
    if (!selectedSection) return;

    const currentIndex = sections.findIndex(
      (s) => s.sectionSlug === selectedSection.sectionSlug
    );
    if (currentIndex > 0) {
      handleSectionSelect(sections[currentIndex - 1]);
    }
  };

  // Record metrics when component unmounts
  useEffect(() => {
    return () => {
      if (selectedSection && viewStartTime) {
        const timeSpentMs = Date.now() - viewStartTime;
        recordSectionView(selectedSection.id, {
          featureContext: searchParams.get('source') || 'direct',
          timeSpentMs,
        }).catch((err) => console.error('Error recording view:', err));
      }
    };
  }, [selectedSection, viewStartTime, searchParams]);

  if (loading) {
    return (
      <div className="big-story-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading the Big Story...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="big-story-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => setError(null)} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="big-story-page">
      <div className="page-header">
        <h1>The Big Story</h1>
        <p className="page-subtitle">
          Creation → New Creation: Understanding How All of Scripture Fits Together
        </p>
      </div>

      <div className="page-content">
        {/* Timeline Sidebar */}
        <aside className="timeline-sidebar">
          <div className="sidebar-header">
            <h2>The Story Unfolds</h2>
          </div>

          <BigStoryTimeline
            sections={sections}
            selectedSection={selectedSection}
            onSectionSelect={handleSectionSelect}
          />
        </aside>

        {/* Main Content */}
        <main className="story-main">
          {selectedSection ? (
            <BigStorySectionViewer
              section={selectedSection}
              onPassageClick={handlePassageClick}
              onNextSection={handleNextSection}
              onPreviousSection={handlePreviousSection}
              hasNext={
                sections.findIndex(
                  (s) => s.sectionSlug === selectedSection.sectionSlug
                ) <
                sections.length - 1
              }
              hasPrevious={
                sections.findIndex(
                  (s) => s.sectionSlug === selectedSection.sectionSlug
                ) > 0
              }
            />
          ) : (
            <div className="no-selection">
              <p>Select a section from the timeline to begin</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BigStoryPage;
