import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuestions } from '../contexts/QuestionContext';
import { useAuth } from '../contexts/AuthContext';
import './QuestionsAdminPage.css';

function QuestionsAdminPage() {
  const { questions, stats, loading, fetchQuestions, markAsAnswered, updateStatus, deleteQuestion } = useQuestions();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerForm, setAnswerForm] = useState({
    answerMethod: 'IN_CLASS',
    answerText: '',
  });

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const filters = {};
    if (groupFilter !== 'all') filters.groupId = groupFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (categoryFilter !== 'all') filters.category = categoryFilter;

    await fetchQuestions(filters);
  };

  // Reload when filters change
  useEffect(() => {
    loadQuestions();
  }, [statusFilter, categoryFilter, groupFilter]);

  const handleDelete = async (id, questionPreview) => {
    if (window.confirm(`Are you sure you want to delete this question?\n\n"${questionPreview}"`)) {
      const result = await deleteQuestion(id);
      if (result.success) {
        alert('Question deleted successfully!');
      } else {
        alert(`Failed to delete: ${result.error}`);
      }
    }
  };

  const handleMarkAsAnswered = async (question) => {
    setSelectedQuestion(question);
    setAnswerForm({
      answerMethod: 'IN_CLASS',
      answerText: '',
    });
    setAnswerModalOpen(true);
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();

    const result = await markAsAnswered(selectedQuestion.id, answerForm);

    if (result.success) {
      setAnswerModalOpen(false);
      setSelectedQuestion(null);
      alert('Question marked as answered!');
    } else {
      alert(`Failed to update: ${result.error}`);
    }
  };

  const handleArchive = async (id, questionPreview) => {
    if (window.confirm(`Archive this question?\n\n"${questionPreview}"`)) {
      const result = await updateStatus(id, 'ARCHIVED');
      if (result.success) {
        alert('Question archived successfully!');
      } else {
        alert(`Failed to archive: ${result.error}`);
      }
    }
  };

  const handleReopen = async (id) => {
    const result = await updateStatus(id, 'UNANSWERED');
    if (result.success) {
      alert('Question reopened!');
    } else {
      alert(`Failed to reopen: ${result.error}`);
    }
  };

  const filteredQuestions = questions;

  const getStatusBadge = (status) => {
    const badges = {
      UNANSWERED: { class: 'status-unanswered', label: 'Unanswered' },
      ANSWERED: { class: 'status-answered', label: 'Answered' },
      ARCHIVED: { class: 'status-archived', label: 'Archived' }
    };
    return badges[status] || badges.UNANSWERED;
  };

  const getCategoryBadge = (category) => {
    const badges = {
      BIBLE: { class: 'category-bible', label: '📖 Bible', icon: '📖' },
      LIFE: { class: 'category-life', label: '❤️ Life', icon: '❤️' },
      DOUBT: { class: 'category-doubt', label: '🤔 Doubt', icon: '🤔' }
    };
    return badges[category] || badges.BIBLE;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuestionPreview = (body, maxLength = 100) => {
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + '...';
  };

  // Get unique groups from questions
  const availableGroups = [...new Set(questions.map(q => q.group?.id))].filter(Boolean);

  return (
    <div className="questions-admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Anonymous Question Box</h1>
            <Link to="/admin" className="breadcrumb-link">← Back to Admin Dashboard</Link>
          </div>
        </div>

        {stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Questions</div>
            </div>
            <div className="stat-card stat-unanswered">
              <div className="stat-number">{stats.unanswered}</div>
              <div className="stat-label">Unanswered</div>
            </div>
            <div className="stat-card stat-answered">
              <div className="stat-number">{stats.answered}</div>
              <div className="stat-label">Answered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.responseRate}%</div>
              <div className="stat-label">Response Rate</div>
            </div>
          </div>
        )}

        {stats && stats.byCategory && (
          <div className="category-stats">
            <h3>Questions by Category</h3>
            <div className="category-breakdown">
              <div className="category-stat">
                <span className="category-icon">📖</span>
                <span className="category-name">Bible</span>
                <span className="category-count">{stats.byCategory.BIBLE || 0}</span>
              </div>
              <div className="category-stat">
                <span className="category-icon">❤️</span>
                <span className="category-name">Life</span>
                <span className="category-count">{stats.byCategory.LIFE || 0}</span>
              </div>
              <div className="category-stat">
                <span className="category-icon">🤔</span>
                <span className="category-name">Doubt</span>
                <span className="category-count">{stats.byCategory.DOUBT || 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className="admin-content">
          <div className="content-header">
            <h2>Manage Questions</h2>
            <div className="filter-controls">
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">All</option>
                  <option value="UNANSWERED">Unanswered</option>
                  <option value="ANSWERED">Answered</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="category-filter"
                >
                  <option value="all">All Categories</option>
                  <option value="BIBLE">📖 Bible</option>
                  <option value="LIFE">❤️ Life</option>
                  <option value="DOUBT">🤔 Doubt</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Loading questions...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="empty-state">
              <p>
                {statusFilter === 'all' && categoryFilter === 'all'
                  ? 'No questions yet. Students can submit anonymous questions through the question form.'
                  : 'No questions found with the selected filters.'}
              </p>
            </div>
          ) : (
            <div className="questions-list">
              {filteredQuestions.map(question => {
                const statusBadge = getStatusBadge(question.status);
                const categoryBadge = getCategoryBadge(question.category);

                return (
                  <div key={question.id} className={`question-card ${question.status.toLowerCase()}`}>
                    <div className="question-header">
                      <div className="question-badges">
                        <span className={`category-badge ${categoryBadge.class}`}>
                          {categoryBadge.label}
                        </span>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="question-meta">
                        {question.group && (
                          <span className="group-name">📁 {question.group.name}</span>
                        )}
                        <span className="question-date">{formatDate(question.createdAt)}</span>
                      </div>
                    </div>

                    <div className="question-body">
                      <p>{question.body}</p>
                    </div>

                    {question.status === 'ANSWERED' && (
                      <div className="answer-section">
                        <div className="answer-header">
                          <strong>Answer:</strong>
                          {question.answerMethod === 'IN_CLASS' && (
                            <span className="answer-method">Answered in class</span>
                          )}
                          {question.answerMethod === 'WRITTEN' && (
                            <span className="answer-method">Written answer</span>
                          )}
                        </div>
                        {question.answerText && (
                          <p className="answer-text">{question.answerText}</p>
                        )}
                        {question.answeredAt && (
                          <p className="answer-date">
                            Answered on {formatDate(question.answeredAt)}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="question-actions">
                      {question.status === 'UNANSWERED' && (
                        <>
                          <button
                            onClick={() => handleMarkAsAnswered(question)}
                            className="btn btn-small btn-success"
                            title="Mark as Answered"
                          >
                            ✓ Answer
                          </button>
                          <button
                            onClick={() => handleArchive(question.id, getQuestionPreview(question.body))}
                            className="btn btn-small btn-warning"
                            title="Archive"
                          >
                            📦 Archive
                          </button>
                        </>
                      )}
                      {question.status === 'ANSWERED' && (
                        <button
                          onClick={() => handleArchive(question.id, getQuestionPreview(question.body))}
                          className="btn btn-small btn-warning"
                          title="Archive"
                        >
                          📦 Archive
                        </button>
                      )}
                      {question.status === 'ARCHIVED' && (
                        <button
                          onClick={() => handleReopen(question.id)}
                          className="btn btn-small btn-primary"
                          title="Reopen"
                        >
                          🔓 Reopen
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(question.id, getQuestionPreview(question.body))}
                        className="btn btn-small btn-danger"
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Answer Modal */}
      {answerModalOpen && selectedQuestion && (
        <div className="modal-overlay" onClick={() => setAnswerModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mark Question as Answered</h2>
              <button
                className="modal-close"
                onClick={() => setAnswerModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="question-preview">
                <strong>Question:</strong>
                <p>{selectedQuestion.body}</p>
              </div>

              <form onSubmit={handleAnswerSubmit}>
                <div className="form-group">
                  <label htmlFor="answerMethod">How was this answered?</label>
                  <select
                    id="answerMethod"
                    value={answerForm.answerMethod}
                    onChange={(e) => setAnswerForm({ ...answerForm, answerMethod: e.target.value })}
                    required
                  >
                    <option value="IN_CLASS">Answered in class</option>
                    <option value="WRITTEN">Written answer</option>
                  </select>
                </div>

                {answerForm.answerMethod === 'WRITTEN' && (
                  <div className="form-group">
                    <label htmlFor="answerText">Your Answer *</label>
                    <textarea
                      id="answerText"
                      value={answerForm.answerText}
                      onChange={(e) => setAnswerForm({ ...answerForm, answerText: e.target.value })}
                      rows="6"
                      placeholder="Type your answer here..."
                      required
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setAnswerModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Mark as Answered
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionsAdminPage;
