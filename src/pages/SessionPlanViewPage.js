import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuestionBank } from '../contexts/QuestionBankContext';
import { useLessons } from '../contexts/LessonContext';
import './SessionPlanViewPage.css';

function SessionPlanViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSessionPlanById, questions } = useQuestionBank();
  const { getLessonById } = useLessons();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPresentMode, setIsPresentMode] = useState(false);

  const plan = getSessionPlanById(id);

  if (!plan) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Session Plan Not Found</h2>
          <Link to="/session-plans" className="btn btn-primary">
            Back to Session Plans
          </Link>
        </div>
      </div>
    );
  }

  const getQuestionById = (questionId) => {
    return questions.find(q => q.id === questionId);
  };

  const getLessonTitle = () => {
    if (plan.lessonId) {
      const lesson = getLessonById(plan.lessonId);
      return lesson ? lesson.title : 'Unknown Lesson';
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalTime = plan.questions.reduce((sum, q) => sum + (q.timeAllocation || 0), 0);

  const currentPlanQuestion = plan.questions[currentQuestionIndex];
  const currentQuestion = currentPlanQuestion ? getQuestionById(currentPlanQuestion.questionId) : null;

  const nextQuestion = () => {
    if (currentQuestionIndex < plan.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isPresentMode && currentQuestion) {
    return (
      <div className="present-mode">
        <div className="present-controls">
          <button onClick={() => setIsPresentMode(false)} className="btn btn-outline">
            Exit Presentation
          </button>
          <span className="question-counter">
            Question {currentQuestionIndex + 1} of {plan.questions.length}
          </span>
        </div>

        <div className="present-content">
          <div className="present-question">
            <div className="question-meta-large">
              <span className="badge badge-info">{currentQuestion.category}</span>
              <span className="time-large">{currentPlanQuestion.timeAllocation} minutes</span>
            </div>
            <h1 className="question-text-large">{currentQuestion.text}</h1>
            {currentQuestion.verseReference && (
              <p className="verse-reference-large">{currentQuestion.verseReference}</p>
            )}
            {currentQuestion.notes && (
              <div className="notes-large">
                <h3>Leader Notes:</h3>
                <p>{currentQuestion.notes}</p>
              </div>
            )}
          </div>

          <div className="present-navigation">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn btn-secondary"
            >
              ← Previous
            </button>
            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === plan.questions.length - 1}
              className="btn btn-primary"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-plan-view-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>{plan.title}</h1>
            {plan.date && (
              <p className="plan-date-large">{formatDate(plan.date)}</p>
            )}
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/session-plans')} className="btn btn-outline">
              Back
            </button>
            <Link to={`/session-plans/edit/${id}`} className="btn btn-secondary">
              Edit Plan
            </Link>
            <button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setIsPresentMode(true);
              }}
              className="btn btn-primary"
            >
              Start Presentation
            </button>
          </div>
        </div>

        <div className="plan-overview">
          <div className="overview-grid">
            {getLessonTitle() && (
              <div className="overview-item">
                <label>Linked Lesson</label>
                <div>{getLessonTitle()}</div>
              </div>
            )}
            <div className="overview-item">
              <label>Questions</label>
              <div>{plan.questions.length}</div>
            </div>
            <div className="overview-item">
              <label>Total Time</label>
              <div>{totalTime} minutes</div>
            </div>
          </div>
          {plan.description && (
            <div className="plan-description-full">
              <label>Description</label>
              <p>{plan.description}</p>
            </div>
          )}
        </div>

        <div className="plan-questions">
          <h2>Questions</h2>
          {plan.questions.length === 0 ? (
            <div className="empty-state">
              <p>No questions in this plan yet.</p>
              <Link to={`/session-plans/edit/${id}`} className="btn btn-primary">
                Add Questions
              </Link>
            </div>
          ) : (
            <div className="questions-timeline">
              {plan.questions.map((planQuestion, index) => {
                const question = getQuestionById(planQuestion.questionId);
                if (!question) return null;

                return (
                  <div key={planQuestion.questionId} className="timeline-item">
                    <div className="timeline-marker">{index + 1}</div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <div className="timeline-meta">
                          <span className="badge badge-info">{question.category}</span>
                          <span className={`badge ${question.difficulty === 'easy' ? 'badge-success' : question.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                            {question.difficulty}
                          </span>
                          <span className="time-indicator">{planQuestion.timeAllocation} min</span>
                        </div>
                      </div>
                      <p className="timeline-question">{question.text}</p>
                      {question.verseReference && (
                        <p className="timeline-verse">
                          <strong>Reference:</strong> {question.verseReference}
                        </p>
                      )}
                      {question.notes && (
                        <div className="timeline-notes">
                          <strong>Leader Notes:</strong> {question.notes}
                        </div>
                      )}
                      {question.tags && question.tags.length > 0 && (
                        <div className="timeline-tags">
                          {question.tags.map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionPlanViewPage;
