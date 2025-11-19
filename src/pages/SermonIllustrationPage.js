import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SermonIllustrationPage.css';

const SermonIllustrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [scriptureRef, setScriptureRef] = useState('');
  const [theme, setTheme] = useState('');
  const [ageGroup, setAgeGroup] = useState('13-17');
  const [additionalContext, setAdditionalContext] = useState('');
  const [illustrationType, setIllustrationType] = useState('all');

  // Results state
  const [illustrations, setIllustrations] = useState(null);
  const [expandedIllustration, setExpandedIllustration] = useState(null);

  // Filter warning state
  const [filterWarning, setFilterWarning] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setFilterWarning(null);
      setIllustrations(null);

      const response = await fetch('/api/sermon-illustrations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          scriptureRef,
          theme,
          ageGroup,
          additionalContext,
          illustrationType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate illustrations');
      }

      // Check if content was filtered
      if (data.filtered) {
        setFilterWarning({
          action: data.action,
          category: data.category,
          message: data.message,
        });
        return;
      }

      // Success - show illustrations
      setIllustrations(data.data);
      setSuccess('Illustrations generated successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  };

  const getIllustrationTypeIcon = (type) => {
    const icons = {
      story: '📖',
      modern_example: '💡',
      object_lesson: '🎯',
      analogy: '🔄',
    };
    return icons[type] || '📝';
  };

  const getIllustrationTypeLabel = (type) => {
    const labels = {
      story: 'Story',
      modern_example: 'Modern Example',
      object_lesson: 'Object Lesson',
      analogy: 'Analogy',
    };
    return labels[type] || type;
  };

  return (
    <div className="sermon-illustration-page">
      <div className="container">
        <div className="page-header">
          <button onClick={() => navigate('/admin')} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>AI Sermon Illustration Suggestor</h1>
          <p className="page-description">
            Generate engaging, age-appropriate illustrations for your teaching and sermons
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}
        {filterWarning && (
          <div className="alert alert-warning">
            <strong>Content Filter:</strong> {filterWarning.message}
            <div className="filter-details">
              Category: {filterWarning.category} | Action: {filterWarning.action}
            </div>
          </div>
        )}

        <div className="content-layout">
          {/* Input Form */}
          <div className="input-section">
            <div className="card">
              <h2>Generate Illustrations</h2>
              <form onSubmit={handleGenerate}>
                <div className="form-group">
                  <label htmlFor="scriptureRef">
                    Scripture Reference *
                  </label>
                  <input
                    type="text"
                    id="scriptureRef"
                    value={scriptureRef}
                    onChange={(e) => setScriptureRef(e.target.value)}
                    placeholder="e.g., John 3:16 or Matthew 5:1-12"
                    required
                  />
                  <small>Enter the Bible passage for your lesson or sermon</small>
                </div>

                <div className="form-group">
                  <label htmlFor="theme">
                    Main Theme/Topic *
                  </label>
                  <input
                    type="text"
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., Faith, Love, Forgiveness, Prayer"
                    required
                  />
                  <small>What's the main message you want to illustrate?</small>
                </div>

                <div className="form-group">
                  <label htmlFor="ageGroup">
                    Age Group
                  </label>
                  <select
                    id="ageGroup"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                  >
                    <option value="10-12">10-12 years (Pre-teen)</option>
                    <option value="13-17">13-17 years (Teenagers)</option>
                    <option value="18-25">18-25 years (Young Adults)</option>
                    <option value="mixed">Mixed Ages</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="illustrationType">
                    Illustration Type
                  </label>
                  <select
                    id="illustrationType"
                    value={illustrationType}
                    onChange={(e) => setIllustrationType(e.target.value)}
                  >
                    <option value="all">All Types (Recommended)</option>
                    <option value="story">Stories</option>
                    <option value="modern_example">Modern Examples</option>
                    <option value="object_lesson">Object Lessons</option>
                    <option value="analogy">Analogies</option>
                  </select>
                  <small>Mix different types to engage various learning styles</small>
                </div>

                <div className="form-group">
                  <label htmlFor="additionalContext">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    id="additionalContext"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="Any specific requirements, cultural context, or focus areas..."
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      ✨ Generate Illustrations
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Tips Card */}
            <div className="card tips-card">
              <h3>💡 Tips for Better Illustrations</h3>
              <ul>
                <li>Be specific with your theme - "God's unconditional love" works better than just "love"</li>
                <li>Consider your audience's context and interests</li>
                <li>Mix different illustration types for maximum engagement</li>
                <li>Object lessons work great for hands-on learners</li>
                <li>Modern examples help teens relate biblical truths to daily life</li>
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="results-section">
            {illustrations && illustrations.illustrations && (
              <div className="illustrations-container">
                <div className="results-header">
                  <h2>Generated Illustrations</h2>
                  <div className="results-meta">
                    <span className="meta-item">
                      📖 {illustrations.scripture.reference}
                    </span>
                    <span className="meta-item">
                      🎯 {illustrations.scripture.theme}
                    </span>
                    <span className="meta-item">
                      📊 {illustrations.illustrations.length} illustrations
                    </span>
                  </div>
                </div>

                <div className="illustrations-grid">
                  {illustrations.illustrations.map((illustration, index) => (
                    <div
                      key={illustration.id}
                      className={`illustration-card ${
                        expandedIllustration === illustration.id ? 'expanded' : ''
                      }`}
                    >
                      <div className="illustration-header">
                        <div className="illustration-type">
                          <span className="type-icon">
                            {getIllustrationTypeIcon(illustration.type)}
                          </span>
                          <span className="type-label">
                            {getIllustrationTypeLabel(illustration.type)}
                          </span>
                        </div>
                        <div className="illustration-meta">
                          <span className="duration">
                            ⏱️ {illustration.estimatedDuration}
                          </span>
                        </div>
                      </div>

                      <h3 className="illustration-title">{illustration.title}</h3>

                      <div className="illustration-content">
                        <p className="illustration-text">
                          {illustration.content}
                        </p>

                        {illustration.materials && illustration.materials.length > 0 && (
                          <div className="materials-needed">
                            <strong>Materials needed:</strong>
                            <ul>
                              {illustration.materials.map((material, idx) => (
                                <li key={idx}>{material}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="application-points">
                          <strong>Application Points:</strong>
                          <ul>
                            {illustration.applicationPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="scripture-connection">
                          <strong>Scripture Connection:</strong>
                          <p>{illustration.scriptureConnection}</p>
                        </div>
                      </div>

                      <div className="illustration-actions">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => copyToClipboard(
                            `${illustration.title}\n\n${illustration.content}\n\nApplication Points:\n${illustration.applicationPoints.map(p => `• ${p}`).join('\n')}`
                          )}
                        >
                          📋 Copy
                        </button>
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => setExpandedIllustration(
                            expandedIllustration === illustration.id ? null : illustration.id
                          )}
                        >
                          {expandedIllustration === illustration.id ? '▲ Collapse' : '▼ Expand'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!illustrations && !loading && (
              <div className="empty-state">
                <div className="empty-icon">✨</div>
                <h3>Ready to Generate Illustrations</h3>
                <p>
                  Fill in the form on the left to generate engaging,
                  age-appropriate sermon illustrations powered by AI.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonIllustrationPage;
