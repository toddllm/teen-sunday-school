import React, { useState } from 'react';
import { format, addDays, addWeeks, addMonths, startOfDay } from 'date-fns';
import './ReminderModal.css';

function ReminderModal({ verseRef, existingReminder, onSetReminder, onClose }) {
  const [reminderDate, setReminderDate] = useState(
    existingReminder ? format(new Date(existingReminder), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('09:00');

  const quickOptions = [
    {
      label: 'Tomorrow',
      value: addDays(startOfDay(new Date()), 1)
    },
    {
      label: 'In 3 Days',
      value: addDays(startOfDay(new Date()), 3)
    },
    {
      label: 'Next Week',
      value: addWeeks(startOfDay(new Date()), 1)
    },
    {
      label: 'In 2 Weeks',
      value: addWeeks(startOfDay(new Date()), 2)
    },
    {
      label: 'Next Month',
      value: addMonths(startOfDay(new Date()), 1)
    }
  ];

  const handleQuickSelect = (date) => {
    // Set to 9 AM by default
    const dateWithTime = new Date(date);
    dateWithTime.setHours(9, 0, 0, 0);
    const formatted = format(dateWithTime, "yyyy-MM-dd'T'HH:mm");
    setReminderDate(formatted);
    setCustomDate('');
  };

  const handleCustomDate = () => {
    if (customDate && customTime) {
      const combined = `${customDate}T${customTime}`;
      setReminderDate(combined);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reminderDate) {
      alert('Please select a reminder date and time');
      return;
    }

    const selectedDate = new Date(reminderDate);
    const now = new Date();

    if (selectedDate <= now) {
      alert('Please select a future date and time');
      return;
    }

    onSetReminder(selectedDate.toISOString());
  };

  const handleRemoveReminder = () => {
    onSetReminder(null);
    onClose();
  };

  return (
    <div className="reminder-modal-overlay" onClick={onClose}>
      <div className="reminder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reminder-modal-header">
          <h2>Set Reminder</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="reminder-modal-content">
          <p className="verse-ref-label">For: <strong>{verseRef}</strong></p>

          <form onSubmit={handleSubmit}>
            {/* Quick Options */}
            <div className="quick-options">
              <h3>Quick Select</h3>
              <div className="quick-options-grid">
                {quickOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={`quick-option-btn ${
                      reminderDate &&
                      format(new Date(reminderDate), 'yyyy-MM-dd') ===
                        format(option.value, 'yyyy-MM-dd')
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleQuickSelect(option.value)}
                  >
                    <div className="option-label">{option.label}</div>
                    <div className="option-date">
                      {format(option.value, 'MMM d')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date/Time */}
            <div className="custom-datetime">
              <h3>Or Choose Custom Date & Time</h3>
              <div className="datetime-inputs">
                <div className="input-group">
                  <label htmlFor="custom-date">Date</label>
                  <input
                    id="custom-date"
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="custom-time">Time</label>
                  <input
                    id="custom-time"
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="apply-custom-btn"
                  onClick={handleCustomDate}
                  disabled={!customDate}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Selected Reminder Display */}
            {reminderDate && (
              <div className="selected-reminder">
                <strong>Reminder set for:</strong>
                <div className="reminder-display">
                  {format(new Date(reminderDate), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="reminder-modal-actions">
              {existingReminder && (
                <button
                  type="button"
                  className="remove-reminder-btn"
                  onClick={handleRemoveReminder}
                >
                  Remove Reminder
                </button>
              )}
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={!reminderDate}>
                Set Reminder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReminderModal;
