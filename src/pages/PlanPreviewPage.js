import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlans } from '../contexts/PlanContext';
import './PlanPreviewPage.css';

function PlanPreviewPage() {
  const { id } = useParams();
  const { getPlanById } = usePlans();
  const [selectedDay, setSelectedDay] = useState(1);

  const plan = getPlanById(id);

  if (!plan) {
    return (
      <div className="plan-preview-page">
        <div className="container">
          <div className="error-state">
            <h2>Plan Not Found</h2>
            <p>The reading plan you're looking for doesn't exist.</p>
            <Link to="/admin/plans" className="btn btn-primary">
              Back to Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentDay = plan.days?.find(d => d.dayNumber === selectedDay);

  return (
    <div className="plan-preview-page">
      <div className="container">
        <div className="preview-header-section">
          <div className="header-controls">
            <Link to="/admin/plans" className="btn btn-outline">
              ← Back to Plans
            </Link>
            <div className="header-actions">
              <Link to={`/admin/plan/edit/${id}`} className="btn btn-secondary">
                Edit Plan
              </Link>
              <span className={`status-badge status-${plan.status}`}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="plan-hero">
            <h1>{plan.title}</h1>
            {plan.description && <p className="plan-description">{plan.description}</p>}
            <div className="plan-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span>{plan.duration} days</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📖</span>
                <span>{plan.days?.length || 0} reading days</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👥</span>
                <span>{plan.stats?.totalEnrollments || 0} enrolled</span>
              </div>
            </div>
            {plan.tags && plan.tags.length > 0 && (
              <div className="plan-tags">
                {plan.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="preview-content">
          <div className="preview-sidebar">
            <h3>Daily Reading Schedule</h3>
            <div className="day-list">
              {plan.days?.map((day) => (
                <button
                  key={day.dayNumber}
                  className={`day-item ${selectedDay === day.dayNumber ? 'active' : ''}`}
                  onClick={() => setSelectedDay(day.dayNumber)}
                >
                  <div className="day-number">Day {day.dayNumber}</div>
                  <div className="day-preview">
                    {day.passages.length > 0 ? (
                      <span className="passage-count">
                        {day.passages.length} passage{day.passages.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="no-passages">No passages</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="preview-main">
            {currentDay ? (
              <div className="day-content">
                <div className="day-header">
                  <h2>Day {currentDay.dayNumber}</h2>
                  <div className="day-navigation">
                    <button
                      onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                      disabled={selectedDay === 1}
                      className="btn btn-small btn-outline"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setSelectedDay(Math.min(plan.days.length, selectedDay + 1))}
                      disabled={selectedDay === plan.days.length}
                      className="btn btn-small btn-outline"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                <div className="passages-section">
                  <h3>Today's Reading</h3>
                  {currentDay.passages.length > 0 ? (
                    <div className="passages-list">
                      {currentDay.passages.map((passage, idx) => (
                        <div key={idx} className="passage-item">
                          <span className="passage-icon">📖</span>
                          <span className="passage-text">{passage}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-content">
                      No passages assigned for this day yet.
                    </div>
                  )}
                </div>

                {currentDay.notes && (
                  <div className="notes-section">
                    <h3>Study Notes</h3>
                    <div className="notes-content">
                      {currentDay.notes}
                    </div>
                  </div>
                )}

                {currentDay.reflectionPrompts && currentDay.reflectionPrompts.length > 0 && (
                  <div className="reflection-section">
                    <h3>Reflection Questions</h3>
                    <ul className="reflection-list">
                      {currentDay.reflectionPrompts.map((prompt, idx) => (
                        <li key={idx}>{prompt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>Select a day to view its content.</p>
              </div>
            )}
          </div>
        </div>

        <div className="preview-footer">
          <div className="footer-note">
            <strong>Preview Mode:</strong> This is how users will experience this reading plan.
          </div>
          <div className="footer-actions">
            <Link to={`/admin/plan/edit/${id}`} className="btn btn-primary">
              Edit Plan
            </Link>
            <Link to="/admin/plans" className="btn btn-secondary">
              Back to Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanPreviewPage;
