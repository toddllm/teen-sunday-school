import React, { useState, useEffect } from 'react';
import { useCurriculum } from '../contexts/CurriculumContext';
import CalendarView from '../components/admin/CalendarView';
import LessonAssignmentModal from '../components/admin/LessonAssignmentModal';
import { startOfMonth, endOfMonth } from 'date-fns';
import './CurriculumCalendarPage.css';

const CurriculumCalendarPage = () => {
  const {
    schedules,
    metrics,
    loading,
    error,
    fetchSchedules,
    fetchMetrics,
    assignLesson,
    updateSchedule,
    deleteSchedule,
  } = useCurriculum();

  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch groups, lessons, and teachers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch groups
        const groupsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/groups`, { headers });
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          setGroups(groupsData.groups || groupsData.data || groupsData);
        }

        // Fetch lessons
        const lessonsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/lessons`, { headers });
        if (lessonsResponse.ok) {
          const lessonsData = await lessonsResponse.json();
          setLessons(lessonsData.lessons || lessonsData.data || lessonsData);
        }

        // Fetch teachers/users with teacher role
        const usersResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/users?role=TEACHER`, { headers });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setTeachers(usersData.users || usersData.data || usersData);
        }
      } catch (err) {
        console.error('Error fetching calendar data:', err);
      }
    };

    fetchData();
  }, []);

  // Fetch schedules when group or month changes
  useEffect(() => {
    if (selectedGroup) {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      fetchSchedules(selectedGroup, start, end, view);
      fetchMetrics(selectedGroup, start, end);
    }
  }, [selectedGroup, currentMonth, view, fetchSchedules, fetchMetrics]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleScheduleClick = (schedule) => {
    setEditingSchedule(schedule);
    setSelectedDate(new Date(schedule.scheduledDate));
    setIsModalOpen(true);
  };

  const handleScheduleDrop = async (schedule, newDate) => {
    try {
      await updateSchedule(schedule.id, {
        scheduledDate: newDate.toISOString(),
      });

      // Refresh data
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      await fetchSchedules(selectedGroup, start, end, view);
      await fetchMetrics(selectedGroup, start, end);
    } catch (err) {
      console.error('Error rescheduling lesson:', err);
      alert('Failed to reschedule lesson. Please try again.');
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, formData);
      } else {
        await assignLesson(formData);
      }

      // Refresh data
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      await fetchSchedules(selectedGroup, start, end, view);
      await fetchMetrics(selectedGroup, start, end);

      setIsModalOpen(false);
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this scheduled lesson?')) {
      return;
    }

    try {
      await deleteSchedule(scheduleId);

      // Refresh data
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      await fetchSchedules(selectedGroup, start, end, view);
      await fetchMetrics(selectedGroup, start, end);
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert('Failed to delete schedule. Please try again.');
    }
  };

  return (
    <div className="curriculum-calendar-page">
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">Curriculum Calendar</h1>
          <p className="page-subtitle">
            Schedule and manage lessons for your groups
          </p>
        </div>
        <div className="page-header__actions">
          <select
            className="group-selector"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">Select a group...</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <div className="view-toggle">
            <button
              className={`view-toggle__button ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button
              className={`view-toggle__button ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {metrics && (
        <div className="metrics-dashboard">
          <div className="metric-card">
            <div className="metric-card__icon" style={{ background: '#eff6ff' }}>
              📅
            </div>
            <div className="metric-card__content">
              <div className="metric-card__value">{metrics.totalScheduled}</div>
              <div className="metric-card__label">Scheduled Lessons</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card__icon" style={{ background: '#fef3c7' }}>
              ☀️
            </div>
            <div className="metric-card__content">
              <div className="metric-card__value">{metrics.totalSundays}</div>
              <div className="metric-card__label">Total Sundays</div>
            </div>
          </div>

          <div className="metric-card">
            <div
              className="metric-card__icon"
              style={{
                background:
                  metrics.unscheduledSundays > 0 ? '#fef2f2' : '#f0fdf4',
              }}
            >
              {metrics.unscheduledSundays > 0 ? '⚠️' : '✅'}
            </div>
            <div className="metric-card__content">
              <div
                className="metric-card__value"
                style={{
                  color: metrics.unscheduledSundays > 0 ? '#ef4444' : '#22c55e',
                }}
              >
                {metrics.unscheduledSundays}
              </div>
              <div className="metric-card__label">Unscheduled Sundays</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card__icon" style={{ background: '#f0fdf4' }}>
              ✓
            </div>
            <div className="metric-card__content">
              <div className="metric-card__value">
                {metrics.statusBreakdown?.COMPLETED || 0}
              </div>
              <div className="metric-card__label">Completed</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-message__icon">⚠️</span>
          <span className="error-message__text">{error}</span>
        </div>
      )}

      {!selectedGroup ? (
        <div className="empty-state">
          <div className="empty-state__icon">📚</div>
          <h3 className="empty-state__title">Select a Group</h3>
          <p className="empty-state__description">
            Choose a group from the dropdown above to view and manage the curriculum
            calendar.
          </p>
        </div>
      ) : loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading calendar...</p>
        </div>
      ) : (
        <CalendarView
          schedules={schedules}
          view={view}
          onDateClick={handleDateClick}
          onScheduleClick={handleScheduleClick}
          onScheduleDrop={handleScheduleDrop}
          selectedDate={selectedDate}
        />
      )}

      <LessonAssignmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
          setSelectedDate(null);
        }}
        onSubmit={handleModalSubmit}
        selectedDate={selectedDate}
        existingSchedule={editingSchedule}
        lessons={lessons}
        teachers={teachers}
        groupId={selectedGroup}
      />
    </div>
  );
};

export default CurriculumCalendarPage;
