import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuestionBank } from '../contexts/QuestionBankContext';
import { useLessons } from '../contexts/LessonContext';
import './SessionPlanCreatorPage.css';

const SessionPlanCreatorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { questions, getSessionPlanById, addSessionPlan, updateSessionPlan } = useQuestionBank();
  const { lessons } = useLessons();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lessonId: '',
    date: '',
    duration: 60,
    questions: []
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      const plan = getSessionPlanById(id);
      if (plan) {
        setFormData(plan);
      }
    }
  }, [id, getSessionPlanById]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (id) {
      updateSessionPlan(id, formData);
    } else {
      addSessionPlan(formData);
    }

    navigate('/session-plans');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addQuestionToPlan = (questionId) => {
    if (!formData.questions.some(q => q.questionId === questionId)) {
      const question = questions.find(q => q.id === questionId);
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, {
          questionId,
          order: prev.questions.length,
          timeAllocation: question?.suggestedTime || 5
        }]
      }));
    }
  };

  const removeQuestionFromPlan = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions
        .filter(q => q.questionId !== questionId)
        .map((q, index) => ({ ...q, order: index }))
    }));
  };

  const moveQuestion = (index, direction) => {
    const newQuestions = [...formData.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newQuestions.length) {
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      newQuestions.forEach((q, i) => q.order = i);
      setFormData(prev => ({ ...prev, questions: newQuestions }));
    }
  };

  const updateQuestionTime = (questionId, time) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.questionId === questionId ? { ...q, timeAllocation: parseInt(time) || 0 } : q
      )
    }));
  };

  const getQuestionById = (questionId) => {
    return questions.find(q => q.id === questionId);
  };

  const availableQuestions = questions.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalTime = formData.questions.reduce((sum, q) => sum + (q.timeAllocation || 0), 0);

  return (
    <div className="session-plan-creator-page">
      <div className="container">
        <div className="creator-header">
          <h1>{id ? 'Edit Session Plan' : 'Create New Session Plan'}</h1>
          <button onClick={() => navigate('/session-plans')} className="btn btn-outline">
            Back to Session Plans
          </button>
        </div>

        <form onSubmit={handleSubmit} className="plan-form">
          <div className="form-section">
            <h2>Plan Details</h2>

            <div className="form-group">
              <label htmlFor="title">Plan Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Week 1: Introduction to Faith"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lessonId">Link to Lesson</label>
                <select
                  id="lessonId"
                  name="lessonId"
                  value={formData.lessonId}
                  onChange={handleChange}
                >
                  <option value="">-- Select a Lesson --</option>
                  {lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Add notes about this session..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Questions</h2>
            <p className="section-subtitle">
              Add and organize discussion questions for this session
            </p>

            <div className="plan-builder">
              <div className="selected-questions">
                <div className="section-header">
                  <h3>Selected Questions ({formData.questions.length})</h3>
                  <span className="total-time">Total: {totalTime} min</span>
                </div>

                {formData.questions.length === 0 ? (
                  <div className="empty-state-small">
                    <p>No questions added yet. Select from available questions →</p>
                  </div>
                ) : (
                  <div className="selected-questions-list">
                    {formData.questions.map((planQuestion, index) => {
                      const question = getQuestionById(planQuestion.questionId);
                      if (!question) return null;

                      return (
                        <div key={planQuestion.questionId} className="selected-question-item">
                          <div className="question-order">
                            <button
                              type="button"
                              onClick={() => moveQuestion(index, 'up')}
                              disabled={index === 0}
                              className="btn-icon"
                              aria-label="Move up"
                            >
                              ↑
                            </button>
                            <span>{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => moveQuestion(index, 'down')}
                              disabled={index === formData.questions.length - 1}
                              className="btn-icon"
                              aria-label="Move down"
                            >
                              ↓
                            </button>
                          </div>
                          <div className="question-content">
                            <p className="question-text">{question.text}</p>
                            <span className="badge badge-info">{question.category}</span>
                          </div>
                          <div className="question-time">
                            <input
                              type="number"
                              value={planQuestion.timeAllocation}
                              onChange={(e) => updateQuestionTime(planQuestion.questionId, e.target.value)}
                              min="1"
                              max="60"
                              className="time-input"
                            />
                            <span>min</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuestionFromPlan(planQuestion.questionId)}
                            className="btn btn-danger btn-small"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="available-questions">
                <h3>Available Questions</h3>

                <div className="question-filters">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="icebreaker">Icebreaker</option>
                    <option value="discussion">Discussion</option>
                    <option value="reflection">Reflection</option>
                    <option value="application">Application</option>
                    <option value="closing">Closing</option>
                  </select>
                </div>

                <div className="available-questions-list">
                  {availableQuestions.map(question => {
                    const isAdded = formData.questions.some(q => q.questionId === question.id);

                    return (
                      <div key={question.id} className="available-question-item">
                        <div className="question-info">
                          <p className="question-text">{question.text}</p>
                          <div className="question-meta">
                            <span className="badge badge-info">{question.category}</span>
                            <span className="time-indicator">{question.suggestedTime} min</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addQuestionToPlan(question.id)}
                          disabled={isAdded}
                          className={`btn btn-small ${isAdded ? 'btn-outline' : 'btn-primary'}`}
                        >
                          {isAdded ? 'Added' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/session-plans')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {id ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionPlanCreatorPage;
