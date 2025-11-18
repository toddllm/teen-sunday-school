import React, { useState, useEffect, useCallback } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import './NicknameInput.css';

/**
 * NicknameInput Component
 *
 * Input field for nickname with real-time validation and character counter.
 *
 * @param {Object} props
 * @param {string} props.value - Current nickname value
 * @param {Function} props.onChange - Callback when nickname changes
 * @param {boolean} props.showValidation - Whether to show validation feedback
 */
function NicknameInput({ value, onChange, showValidation = true }) {
  const { validateNickname } = useProfile();
  const [localValue, setLocalValue] = useState(value || '');
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [isValidating, setIsValidating] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState(null);

  const MIN_LENGTH = 3;
  const MAX_LENGTH = 20;

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Debounced validation
  const performValidation = useCallback(async (nickname) => {
    if (!nickname || nickname.trim().length === 0) {
      setValidation({ isValid: true, errors: [] });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateNickname(nickname);
      setValidation(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [validateNickname]);

  // Handle input change with debounced validation
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);

    // Clear existing timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // Set new timeout for validation
    if (newValue.trim().length > 0) {
      const timeout = setTimeout(() => {
        performValidation(newValue);
      }, 500); // 500ms debounce
      setValidationTimeout(timeout);
    } else {
      setValidation({ isValid: true, errors: [] });
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  const characterCount = localValue.length;
  const isOverLimit = characterCount > MAX_LENGTH;
  const isUnderLimit = characterCount > 0 && characterCount < MIN_LENGTH;

  return (
    <div className="nickname-input">
      <div className="nickname-input__wrapper">
        <input
          type="text"
          className={`nickname-input__field ${
            showValidation && !validation.isValid ? 'nickname-input__field--invalid' : ''
          } ${
            showValidation && validation.isValid && characterCount >= MIN_LENGTH
              ? 'nickname-input__field--valid'
              : ''
          }`}
          value={localValue}
          onChange={handleChange}
          placeholder="Enter your nickname"
          maxLength={MAX_LENGTH + 5} // Allow some extra for better UX
        />
        {isValidating && (
          <span className="nickname-input__spinner">⏳</span>
        )}
      </div>

      <div className="nickname-input__footer">
        <div className="nickname-input__counter">
          <span
            className={`${isOverLimit || isUnderLimit ? 'nickname-input__counter--warning' : ''}`}
          >
            {characterCount}/{MAX_LENGTH}
          </span>
        </div>

        {showValidation && validation.errors.length > 0 && (
          <div className="nickname-input__errors">
            {validation.errors.map((error, index) => (
              <div key={index} className="nickname-input__error">
                ⚠️ {error}
              </div>
            ))}
          </div>
        )}

        {showValidation &&
          validation.isValid &&
          characterCount >= MIN_LENGTH &&
          characterCount <= MAX_LENGTH && (
            <div className="nickname-input__success">✓ Nickname looks good!</div>
          )}
      </div>
    </div>
  );
}

export default NicknameInput;
