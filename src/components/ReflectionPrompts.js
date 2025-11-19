import React, { useState } from 'react';
import { useReflection } from '../contexts/ReflectionContext';
import { useStreak, ACTIVITY_TYPES } from '../contexts/StreakContext';
import './ReflectionPrompts.css';

function ReflectionPrompts({ passageRef, onClose }) {
  const { getPromptsForPassage, saveResponse, saveForLater } = useReflection();
  const { logActivity } = useStreak();
  const [prompts] = useState(() => getPromptsForPassage(passageRef));
  const [responses, setResponses] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleResponseChange = (promptId, value) => {
    setResponses(prev => ({
      ...prev,
      [promptId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save all responses
    let savedCount = 0;
    Object.entries(responses).forEach(([promptId, responseText]) => {
      if (responseText && responseText.trim()) {
        saveResponse(promptId, responseText.trim(), passageRef);
        savedCount++;
      }
    });

    if (savedCount > 0) {
      // Log activity for completing reflections
      logActivity(ACTIVITY_TYPES.REFLECTION_COMPLETED);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleSaveForLater = () => {
    saveForLater(passageRef, prompts);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const formatPassageRef = (ref) => {
    if (!ref) return 'This passage';
    return ref.replace(/\./g, ' ');
  };

  const hasAnyResponse = Object.values(responses).some(r => r && r.trim());

  if (showSuccess) {
    return (
      <div className="reflection-modal-overlay">
        <div className="reflection-modal success">
          <div className="success-icon">✅</div>
          <h2>Reflections Saved!</h2>
          <p>Your thoughts have been added to your journal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reflection-modal-overlay" onClick={handleSkip}>
      <div className="reflection-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleSkip} aria-label="Close">
          ×
        </button>

        <div className="modal-header">
          <h2>Reflect on {formatPassageRef(passageRef)}</h2>
          <p className="modal-subtitle">
            Take a moment to think about what you just read
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reflection-form">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="prompt-group">
              <label className="prompt-label">
                <span className="prompt-number">{index + 1}.</span>
                {prompt.text}
              </label>
              <textarea
                className="prompt-textarea"
                rows="4"
                placeholder="Share your thoughts..."
                value={responses[prompt.id] || ''}
                onChange={(e) => handleResponseChange(prompt.id, e.target.value)}
              />
            </div>
          ))}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleSkip}
              className="action-btn secondary"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSaveForLater}
              className="action-btn secondary"
            >
              Save for Later
            </button>
            <button
              type="submit"
              className="action-btn primary"
              disabled={!hasAnyResponse}
            >
              Submit Reflections
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReflectionPrompts;
