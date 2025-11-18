import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuestionBank } from '../contexts/QuestionBankContext';
import './QuestionBankPage.css';

function QuestionBankPage() {
  const { questions, deleteQuestion, duplicateQuestion } = useQuestionBank();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.verseReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(id);
    }
  };

  const handleDuplicate = (id) => {
    const newId = duplicateQuestion(id);
    if (newId) {
      navigate(`/question-bank/edit/${newId}`);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      icebreaker: 'Icebreaker',
      discussion: 'Discussion',
      reflection: 'Reflection',
      application: 'Application',
      closing: 'Closing'
    };
    return labels[category] || category;
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      easy: 'badge-success',
      medium: 'badge-warning',
      hard: 'badge-danger'
    };
    return badges[difficulty] || 'badge-secondary';
  };

  return (
    <div className="question-bank-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Question Bank</h1>
            <p className="page-subtitle">Reusable discussion questions for group meetings</p>
          </div>
          <div className="header-actions">
            <Link to="/session-plans" className="btn btn-secondary">
              Session Plans
            </Link>
            <Link to="/question-bank/create" className="btn btn-primary">
              + Create Question
            </Link>
          </div>
        </div>

        <div className="filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search questions, tags, or verses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="icebreaker">Icebreaker</option>
            <option value="discussion">Discussion</option>
            <option value="reflection">Reflection</option>
            <option value="application">Application</option>
            <option value="closing">Closing</option>
          </select>
          <select
            className="filter-select"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="empty-state">
            <p>No questions found matching your criteria.</p>
            {searchTerm || filterCategory !== 'all' || filterDifficulty !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterDifficulty('all');
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            ) : (
              <Link to="/question-bank/create" className="btn btn-primary">
                Create Your First Question
              </Link>
            )}
          </div>
        ) : (
          <div className="questions-list">
            <div className="results-header">
              <span className="results-count">{filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}</span>
            </div>
            {filteredQuestions.map(question => (
              <div key={question.id} className="question-card">
                <div className="question-card-header">
                  <div className="question-meta">
                    <span className={`badge ${getDifficultyBadge(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="badge badge-info">
                      {getCategoryLabel(question.category)}
                    </span>
                    {question.suggestedTime && (
                      <span className="time-indicator">
                        {question.suggestedTime} min
                      </span>
                    )}
                  </div>
                </div>
                <p className="question-text">{question.text}</p>
                {question.verseReference && (
                  <p className="verse-reference">
                    <strong>Reference:</strong> {question.verseReference}
                  </p>
                )}
                {question.notes && (
                  <p className="question-notes">
                    <strong>Notes:</strong> {question.notes}
                  </p>
                )}
                {question.tags && question.tags.length > 0 && (
                  <div className="question-tags">
                    {question.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="question-card-actions">
                  <Link to={`/question-bank/edit/${question.id}`} className="btn btn-primary btn-small">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDuplicate(question.id)}
                    className="btn btn-outline btn-small"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
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

export default QuestionBankPage;
