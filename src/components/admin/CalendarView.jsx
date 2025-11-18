import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
  getDay,
} from 'date-fns';
import './CalendarView.css';

const CalendarView = ({
  schedules = [],
  view = 'month',
  onDateClick,
  onScheduleClick,
  onScheduleDrop,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedSchedule, setDraggedSchedule] = useState(null);

  // Get the visible date range based on view
  const getDateRange = () => {
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return { start: weekStart, end: weekEnd };
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return { start: calendarStart, end: calendarEnd };
    }
  };

  const { start, end } = getDateRange();
  const days = eachDayOfInterval({ start, end });

  // Navigate to previous period
  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  // Navigate to next period
  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  // Navigate to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    return schedules.filter((schedule) =>
      isSameDay(new Date(schedule.scheduledDate), date)
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e, schedule) => {
    setDraggedSchedule(schedule);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    if (draggedSchedule && onScheduleDrop) {
      onScheduleDrop(draggedSchedule, date);
    }
    setDraggedSchedule(null);
  };

  const handleDragEnd = () => {
    setDraggedSchedule(null);
  };

  // Render a single day cell
  const renderDayCell = (day) => {
    const daySchedules = getSchedulesForDate(day);
    const isCurrentMonth = view === 'week' || isSameMonth(day, currentDate);
    const isTodayDate = isToday(day);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const isSunday = getDay(day) === 0;

    const cellClasses = [
      'calendar-day',
      !isCurrentMonth && 'calendar-day--other-month',
      isTodayDate && 'calendar-day--today',
      isSelected && 'calendar-day--selected',
      isSunday && 'calendar-day--sunday',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={day.toISOString()}
        className={cellClasses}
        onClick={() => onDateClick && onDateClick(day)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, day)}
      >
        <div className="calendar-day__header">
          <span className="calendar-day__number">{format(day, 'd')}</span>
          {isSunday && <span className="calendar-day__badge">Sunday</span>}
        </div>
        <div className="calendar-day__content">
          {daySchedules.length === 0 && isSunday && (
            <div className="calendar-day__empty">
              <span className="calendar-day__empty-text">No lesson scheduled</span>
            </div>
          )}
          {daySchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`calendar-schedule calendar-schedule--${schedule.status.toLowerCase()}`}
              draggable={onScheduleDrop}
              onDragStart={(e) => handleDragStart(e, schedule)}
              onDragEnd={handleDragEnd}
              onClick={(e) => {
                e.stopPropagation();
                onScheduleClick && onScheduleClick(schedule);
              }}
            >
              {schedule.series && (
                <div
                  className="calendar-schedule__indicator"
                  style={{ backgroundColor: schedule.series.color || '#3b82f6' }}
                />
              )}
              <div className="calendar-schedule__content">
                <div className="calendar-schedule__title">
                  {schedule.lesson?.title || schedule.series?.name || 'Untitled'}
                </div>
                {schedule.leader && (
                  <div className="calendar-schedule__leader">
                    {schedule.leader.firstName} {schedule.leader.lastName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-header__controls">
          <button
            className="calendar-header__button"
            onClick={handlePrevious}
            title={view === 'week' ? 'Previous week' : 'Previous month'}
          >
            ← Prev
          </button>
          <button className="calendar-header__button" onClick={handleToday}>
            Today
          </button>
          <button
            className="calendar-header__button"
            onClick={handleNext}
            title={view === 'week' ? 'Next week' : 'Next month'}
          >
            Next →
          </button>
        </div>
        <h2 className="calendar-header__title">
          {view === 'week'
            ? `Week of ${format(start, 'MMM d, yyyy')}`
            : format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="calendar-grid__header">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map(renderDayCell)}
      </div>

      {draggedSchedule && (
        <div className="calendar-drag-hint">
          Drag to reschedule: {draggedSchedule.lesson?.title || draggedSchedule.series?.name}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
