import React, { useState } from 'react';
import { usePoll } from '../../../contexts/PollContext';
import './Polls.css';

function PollCreator({ lessonId, onPollCreated }) {
  const { createPoll, loading } = usePoll();

  const [showForm, setShowForm] = useState(false);
  const [pollType, setPollType] = useState('MULTIPLE_CHOICE');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showResultsLive, setShowResultsLive] = useState(true);
  const [error, setError] = useState(null);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate question
    if (!question.trim()) {
      setError('Question is required');
      return;
    }

    // Validate options for multiple choice
    if (pollType === 'MULTIPLE_CHOICE') {
      const validOptions = options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        setError('Please provide at least 2 options for multiple choice polls');
        return;
      }
    }

    // Prepare poll data
    const pollData = {
      question: question.trim(),
      type: pollType,
      showResultsLive,
      options: pollType === 'MULTIPLE_CHOICE'
        ? options.filter(opt => opt.trim() !== '')
        : null,
    };

    // Create poll
    const result = await createPoll(lessonId, pollData);

    if (result.success) {
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setPollType('MULTIPLE_CHOICE');
      setShowForm(false);

      if (onPollCreated) {
        onPollCreated(result.poll);
      }
    } else {
      setError(result.error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setQuestion('');
    setOptions(['', '']);
    setPollType('MULTIPLE_CHOICE');
    setError(null);
  };

  if (!showForm) {
    return (
      <div className="poll-creator-trigger">
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + New Poll
        </button>
      </div>
    );
  }

  return (
    <div className="poll-creator">
      <h3>Create New Poll</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="poll-form">
        {/* Poll Type */}
        <div className="form-group">
          <label>Poll Type</label>
          <select
            value={pollType}
            onChange={(e) => setPollType(e.target.value)}
            className="form-control"
          >
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="OPEN_ENDED">Open Ended (Text)</option>
            <option value="RATING">Rating (1-5)</option>
          </select>
        </div>

        {/* Question */}
        <div className="form-group">
          <label>Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question..."
            className="form-control"
            rows="3"
            required
          />
        </div>

        {/* Options (for multiple choice) */}
        {pollType === 'MULTIPLE_CHOICE' && (
          <div className="form-group">
            <label>Options</label>
            <div className="poll-options">
              {options.map((option, index) => (
                <div key={index} className="poll-option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="form-control"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="btn btn-icon btn-danger"
                      title="Remove option"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="btn btn-secondary btn-sm"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showResultsLive}
              onChange={(e) => setShowResultsLive(e.target.checked)}
            />
            <span>Show results live as responses come in</span>
          </label>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PollCreator;
