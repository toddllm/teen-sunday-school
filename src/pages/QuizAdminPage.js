import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import { useLessons } from '../contexts/LessonContext';
import './QuizAdminPage.css';

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'TRUE_FALSE', label: 'True/False' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'FILL_IN_BLANK', label: 'Fill in the Blank' },
];

const QuizAdminPage = () => {
  const { lessonId, quizId } = useParams();
  const navigate = useNavigate();
  const { lessons } = useLessons();
  const { createQuiz, updateQuiz, getQuizById, loading } = useQuiz();

  const lesson = lessons.find(l => l.id === lessonId);
  const isEditing = !!quizId;

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: null,
    showCorrectAnswers: true,
    allowRetakes: true,
  });

  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && quizId) {
      loadQuiz();
    }
  }, [quizId, isEditing]);

  const loadQuiz = async () => {
    const quiz = await getQuizById(quizId);
    if (quiz) {
      setQuizData({
        title: quiz.title,
        description: quiz.description || '',
        passingScore: quiz.passingScore || 70,
        timeLimit: quiz.timeLimit || null,
        showCorrectAnswers: quiz.showCorrectAnswers,
        allowRetakes: quiz.allowRetakes,
      });
      setQuestions(quiz.questions || []);
    }
  };

  const handleQuizDataChange = (field, value) => {
    setQuizData({ ...quizData, [field]: value });
  };

  const addQuestion = () => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      questionText: '',
      type: 'MULTIPLE_CHOICE',
      options: ['', '', '', ''],
      correctAnswer: '0',
      explanation: '',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options,
    };
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const moveQuestion = (index, direction) => {
    const updatedQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < questions.length) {
      [updatedQuestions[index], updatedQuestions[newIndex]] =
        [updatedQuestions[newIndex], updatedQuestions[index]];
      setQuestions(updatedQuestions);
    }
  };

  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      setError('Quiz title is required');
      return false;
    }

    if (questions.length === 0) {
      setError('At least one question is required');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: Question text is required`);
        return false;
      }

      if (q.type === 'MULTIPLE_CHOICE') {
        const validOptions = q.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          setError(`Question ${i + 1}: At least 2 options are required`);
          return false;
        }
      }

      if (!q.correctAnswer && q.correctAnswer !== '0') {
        setError(`Question ${i + 1}: Correct answer is required`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    setError('');
    setMessage('');

    if (!validateQuiz()) {
      return;
    }

    const payload = {
      ...quizData,
      questions: questions.map((q, index) => {
        const cleanedQuestion = {
          questionText: q.questionText,
          type: q.type,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          points: q.points || 1,
        };

        // Only include options for MCQ and True/False
        if (q.type === 'MULTIPLE_CHOICE') {
          cleanedQuestion.options = q.options.filter(opt => opt.trim());
        } else if (q.type === 'TRUE_FALSE') {
          cleanedQuestion.options = ['True', 'False'];
        } else {
          cleanedQuestion.options = null;
        }

        return cleanedQuestion;
      }),
    };

    let result;
    if (isEditing) {
      result = await updateQuiz(lessonId, quizId, payload);
    } else {
      result = await createQuiz(lessonId, payload);
    }

    if (result.success) {
      setMessage(isEditing ? 'Quiz updated successfully!' : 'Quiz created successfully!');
      setTimeout(() => {
        navigate(`/admin`);
      }, 1500);
    } else {
      setError(result.error || 'Failed to save quiz');
    }
  };

  if (!lesson) {
    return (
      <div className="quiz-admin-page">
        <div className="error-message">
          <h2>Lesson not found</h2>
          <button onClick={() => navigate('/admin')} className="back-btn">
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-admin-page">
      <div className="quiz-admin-header">
        <button onClick={() => navigate('/admin')} className="back-btn">
          ← Back to Admin
        </button>
        <h1>{isEditing ? 'Edit Quiz' : 'Create Quiz'}</h1>
        <p className="lesson-title">For lesson: {lesson.title}</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="quiz-admin-content">
        {/* Quiz Settings */}
        <div className="quiz-settings section">
          <h2>Quiz Settings</h2>

          <div className="form-group">
            <label htmlFor="title">Quiz Title *</label>
            <input
              id="title"
              type="text"
              value={quizData.title}
              onChange={(e) => handleQuizDataChange('title', e.target.value)}
              placeholder="e.g., Understanding Faith"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={quizData.description}
              onChange={(e) => handleQuizDataChange('description', e.target.value)}
              placeholder="Optional description or instructions"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="passingScore">Passing Score (%)</label>
              <input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={quizData.passingScore || ''}
                onChange={(e) => handleQuizDataChange('passingScore', parseInt(e.target.value) || null)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="timeLimit">Time Limit (minutes)</label>
              <input
                id="timeLimit"
                type="number"
                min="0"
                value={quizData.timeLimit || ''}
                onChange={(e) => handleQuizDataChange('timeLimit', parseInt(e.target.value) || null)}
                placeholder="No limit"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={quizData.showCorrectAnswers}
                onChange={(e) => handleQuizDataChange('showCorrectAnswers', e.target.checked)}
              />
              Show correct answers after completion
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={quizData.allowRetakes}
                onChange={(e) => handleQuizDataChange('allowRetakes', e.target.checked)}
              />
              Allow retakes
            </label>
          </div>
        </div>

        {/* Questions */}
        <div className="quiz-questions section">
          <div className="section-header">
            <h2>Questions ({questions.length})</h2>
            <button onClick={addQuestion} className="add-question-btn">
              + Add Question
            </button>
          </div>

          {questions.length === 0 && (
            <div className="empty-state">
              <p>No questions yet. Click "Add Question" to get started.</p>
            </div>
          )}

          {questions.map((question, qIndex) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <span className="question-number">Question {qIndex + 1}</span>
                <div className="question-actions">
                  <button
                    onClick={() => moveQuestion(qIndex, 'up')}
                    disabled={qIndex === 0}
                    className="move-btn"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveQuestion(qIndex, 'down')}
                    disabled={qIndex === questions.length - 1}
                    className="move-btn"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="remove-btn"
                    title="Remove question"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Question Type</label>
                <select
                  value={question.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    updateQuestion(qIndex, 'type', newType);

                    // Set default options based on type
                    if (newType === 'TRUE_FALSE') {
                      updateQuestion(qIndex, 'options', ['True', 'False']);
                      updateQuestion(qIndex, 'correctAnswer', '0');
                    } else if (newType === 'MULTIPLE_CHOICE' && (!question.options || question.options.length < 2)) {
                      updateQuestion(qIndex, 'options', ['', '', '', '']);
                    }
                  }}
                >
                  {QUESTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  placeholder="Enter your question"
                  rows="2"
                />
              </div>

              {/* Multiple Choice Options */}
              {question.type === 'MULTIPLE_CHOICE' && (
                <div className="form-group">
                  <label>Options</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-row">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === String(oIndex)}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', String(oIndex))}
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="remove-option-btn"
                          title="Remove option"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addOption(qIndex)} className="add-option-btn">
                    + Add Option
                  </button>
                </div>
              )}

              {/* True/False */}
              {question.type === 'TRUE_FALSE' && (
                <div className="form-group">
                  <label>Correct Answer</label>
                  <div className="true-false-options">
                    <label>
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === '0'}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', '0')}
                      />
                      True
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === '1'}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', '1')}
                      />
                      False
                    </label>
                  </div>
                </div>
              )}

              {/* Short Answer / Fill in Blank */}
              {(question.type === 'SHORT_ANSWER' || question.type === 'FILL_IN_BLANK') && (
                <div className="form-group">
                  <label>Correct Answer *</label>
                  <input
                    type="text"
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                    placeholder="Enter the correct answer"
                  />
                  <small>Note: Answers will be compared case-insensitively</small>
                </div>
              )}

              <div className="form-group">
                <label>Explanation (optional)</label>
                <textarea
                  value={question.explanation || ''}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Explain why this is the correct answer"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Points</label>
                <input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                  style={{ width: '80px' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="quiz-admin-footer">
          <button onClick={() => navigate('/admin')} className="cancel-btn">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Quiz' : 'Create Quiz')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizAdminPage;
