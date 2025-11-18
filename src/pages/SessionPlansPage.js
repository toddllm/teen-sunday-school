import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuestionBank } from '../contexts/QuestionBankContext';
import { useLessons } from '../contexts/LessonContext';
import './SessionPlansPage.css';

function SessionPlansPage() {
  const { sessionPlans, deleteSessionPlan, duplicateSessionPlan } = useQuestionBank();
  const { getLessonById } = useLessons();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlans = sessionPlans.filter(plan => {
    return plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this session plan?')) {
      deleteSessionPlan(id);
    }
  };

  const handleDuplicate = (id) => {
    const newId = duplicateSessionPlan(id);
    if (newId) {
      navigate(`/session-plans/edit/${newId}`);
    }
  };

  const getLessonTitle = (lessonId) => {
    const lesson = getLessonById(lessonId);
    return lesson ? lesson.title : 'Unknown Lesson';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="session-plans-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Session Plans</h1>
            <p className="page-subtitle">Organize questions for your group meetings</p>
          </div>
          <div className="header-actions">
            <Link to="/question-bank" className="btn btn-secondary">
              Question Bank
            </Link>
            <Link to="/session-plans/create" className="btn btn-primary">
              + Create Session Plan
            </Link>
          </div>
        </div>

        <div className="filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search session plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredPlans.length === 0 ? (
          <div className="empty-state">
            <p>No session plans found.</p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-outline"
              >
                Clear Search
              </button>
            ) : (
              <Link to="/session-plans/create" className="btn btn-primary">
                Create Your First Session Plan
              </Link>
            )}
          </div>
        ) : (
          <div className="plans-grid">
            {filteredPlans.map(plan => (
              <div key={plan.id} className="plan-card">
                <div className="plan-card-header">
                  <h3>{plan.title}</h3>
                  {plan.date && (
                    <span className="plan-date">{formatDate(plan.date)}</span>
                  )}
                </div>
                {plan.description && (
                  <p className="plan-description">{plan.description}</p>
                )}
                {plan.lessonId && (
                  <p className="plan-lesson">
                    <strong>Lesson:</strong> {getLessonTitle(plan.lessonId)}
                  </p>
                )}
                <div className="plan-meta">
                  <span className="plan-stat">
                    {plan.questions?.length || 0} question{plan.questions?.length !== 1 ? 's' : ''}
                  </span>
                  {plan.duration && (
                    <span className="plan-stat">
                      {plan.duration} min
                    </span>
                  )}
                </div>
                <div className="plan-card-actions">
                  <Link to={`/session-plans/view/${plan.id}`} className="btn btn-primary btn-small">
                    View
                  </Link>
                  <Link to={`/session-plans/edit/${plan.id}`} className="btn btn-outline btn-small">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDuplicate(plan.id)}
                    className="btn btn-outline btn-small"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="btn btn-danger btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionPlansPage;
