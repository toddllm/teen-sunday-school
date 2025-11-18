import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './LessonAssignmentModal.css';

const LessonAssignmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  existingSchedule = null,
  lessons = [],
  teachers = [],
  groupId,
}) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    lessonId: '',
    leaderId: '',
    notes: '',
    status: 'SCHEDULED',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
      }));
    }

    if (existingSchedule) {
      setFormData({
        scheduledDate: format(new Date(existingSchedule.scheduledDate), 'yyyy-MM-dd'),
        lessonId: existingSchedule.lessonId || '',
        leaderId: existingSchedule.leaderId || '',
        notes: existingSchedule.notes || '',
        status: existingSchedule.status || 'SCHEDULED',
      });
    }
  }, [selectedDate, existingSchedule]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    }

    if (!formData.lessonId) {
      newErrors.lessonId = 'Lesson is required';
    }

    if (!groupId) {
      newErrors.groupId = 'Group is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        groupId,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        lessonId: formData.lessonId || null,
        leaderId: formData.leaderId || null,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        submit: error.message || 'Failed to save schedule',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      scheduledDate: '',
      lessonId: '',
      leaderId: '',
      notes: '',
      status: 'SCHEDULED',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {existingSchedule ? 'Edit Scheduled Lesson' : 'Assign Lesson'}
          </h2>
          <button className="modal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="scheduledDate" className="form-label">
              Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className={`form-input ${errors.scheduledDate ? 'form-input--error' : ''}`}
              required
            />
            {errors.scheduledDate && (
              <span className="form-error">{errors.scheduledDate}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lessonId" className="form-label">
              Lesson <span className="required">*</span>
            </label>
            <select
              id="lessonId"
              name="lessonId"
              value={formData.lessonId}
              onChange={handleChange}
              className={`form-input ${errors.lessonId ? 'form-input--error' : ''}`}
              required
            >
              <option value="">Select a lesson...</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  Q{lesson.quarter} U{lesson.unit} L{lesson.lessonNumber}: {lesson.title}
                </option>
              ))}
            </select>
            {errors.lessonId && <span className="form-error">{errors.lessonId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="leaderId" className="form-label">
              Teacher/Leader
            </label>
            <select
              id="leaderId"
              name="leaderId"
              value={formData.leaderId}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Not assigned</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </div>

          {existingSchedule && (
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input form-textarea"
              rows="3"
              placeholder="Add any notes or special instructions..."
            />
          </div>

          {errors.submit && (
            <div className="form-error form-error--submit">{errors.submit}</div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn--secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Saving...' : existingSchedule ? 'Update' : 'Assign Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonAssignmentModal;
