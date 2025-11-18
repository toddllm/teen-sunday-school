import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTopics } from '../contexts/TopicContext';
import { usePlans } from '../contexts/PlanContext';
import { getPassage } from '../services/bibleAPI';
import './TopicDetailPage.css';

function TopicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTopic, trackPlanStart } = useTopics();
  const { plans } = usePlans();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verseTexts, setVerseTexts] = useState({});
  const [loadingVerses, setLoadingVerses] = useState({});

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const topicData = await getTopic(id);
        setTopic(topicData);
      } catch (error) {
        console.error('Error fetching topic:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id, getTopic]);

  const handleLoadVerse = async (verseRef, verseId) => {
    if (verseTexts[verseId] || loadingVerses[verseId]) return;

    setLoadingVerses(prev => ({ ...prev, [verseId]: true }));

    try {
      const verseData = await getPassage(verseRef);
      setVerseTexts(prev => ({
        ...prev,
        [verseId]: verseData.text || 'Unable to load verse text'
      }));
    } catch (error) {
      console.error('Error loading verse:', error);
      setVerseTexts(prev => ({
        ...prev,
        [verseId]: 'Error loading verse text'
      }));
    } finally {
      setLoadingVerses(prev => ({ ...prev, [verseId]: false }));
    }
  };

  const handleStartReadingPlan = (relatedPlanId) => {
    // Track that user started a reading plan from this topic
    trackPlanStart(id);
    navigate(`/plans/${relatedPlanId}`);
  };

  // Find related reading plans based on topic tags and category
  const getRelatedPlans = () => {
    if (!topic || !plans) return [];

    return plans
      .filter(plan => {
        if (plan.status !== 'published') return false;

        // Check if plan tags overlap with topic tags
        const topicTags = topic.tags || [];
        const planTags = plan.tags || [];

        return topicTags.some(tag =>
          planTags.some(planTag =>
            planTag.toLowerCase().includes(tag.toLowerCase())
          )
        ) || (plan.category && plan.category === topic.category);
      })
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="topic-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading topic...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="topic-detail-page">
        <div className="container">
          <div className="empty-state">
            <h2>Topic Not Found</h2>
            <p>The topic you're looking for doesn't exist or has been removed.</p>
            <Link to="/topics" className="btn btn-primary">
              Browse Topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const relatedPlans = getRelatedPlans();

  return (
    <div className="topic-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/topics">← Back to Topics</Link>
        </div>

        <div className="topic-header">
          <div>
            <h1>{topic.name}</h1>
            {topic.category && (
              <span className="topic-category">{topic.category}</span>
            )}
          </div>
          {topic.tags && topic.tags.length > 0 && (
            <div className="topic-tags">
              {topic.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {topic.description && (
          <div className="topic-description">
            <p>{topic.description}</p>
          </div>
        )}

        <div className="topic-content">
          <div className="main-content">
            <section className="verses-section">
              <h2>Key Verses</h2>
              {topic.verses && topic.verses.length > 0 ? (
                <div className="verses-list">
                  {topic.verses.map((verse) => (
                    <div key={verse.id} className="verse-item">
                      <div className="verse-header">
                        <h3>{verse.verseRef}</h3>
                        <button
                          onClick={() => handleLoadVerse(verse.verseRef, verse.id)}
                          className="btn btn-sm btn-secondary"
                          disabled={loadingVerses[verse.id]}
                        >
                          {loadingVerses[verse.id]
                            ? 'Loading...'
                            : verseTexts[verse.id]
                            ? 'Refresh'
                            : 'Load Text'}
                        </button>
                      </div>

                      {verseTexts[verse.id] && (
                        <div className="verse-text">
                          <p>{verseTexts[verse.id]}</p>
                        </div>
                      )}

                      {verse.note && (
                        <div className="verse-note">
                          <strong>Note:</strong> {verse.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No verses added to this topic yet.</p>
              )}
            </section>
          </div>

          <div className="sidebar">
            {relatedPlans.length > 0 && (
              <section className="related-plans">
                <h3>Related Reading Plans</h3>
                <div className="plans-list">
                  {relatedPlans.map((plan) => (
                    <div key={plan.id} className="plan-card">
                      <h4>{plan.title}</h4>
                      {plan.description && (
                        <p className="plan-description">
                          {plan.description.length > 100
                            ? `${plan.description.substring(0, 100)}...`
                            : plan.description}
                        </p>
                      )}
                      <div className="plan-meta">
                        <span>{plan.duration} days</span>
                      </div>
                      <button
                        onClick={() => handleStartReadingPlan(plan.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Start Plan
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="suggested-questions">
              <h3>Discussion Questions</h3>
              <ul>
                <li>How does this topic relate to your daily life?</li>
                <li>What challenges do you face in this area?</li>
                <li>How can these verses guide you?</li>
                <li>What practical steps can you take this week?</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicDetailPage;
