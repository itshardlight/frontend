import React, { useState, useEffect } from 'react';
import { timetableService } from '../../services/timetableService';
import '../../styles/Timetable.css';

const TimetableViewer = ({ className, section, readOnly = false, onEditEntry }) => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const timeSlots = [
    { period: '1', start: '09:00', end: '09:45' },
    { period: '2', start: '09:45', end: '10:30' },
    { period: '3', start: '10:30', end: '11:15' },
    { period: '4', start: '11:30', end: '12:15' },
    { period: '5', start: '12:15', end: '13:00' },
    { period: '6', start: '14:00', end: '14:45' },
    { period: '7', start: '14:45', end: '15:30' },
    { period: '8', start: '15:30', end: '16:15' }
  ];

  useEffect(() => {
    if (className && section) {
      fetchTimetable();
    }
  }, [className, section]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await timetableService.getClassTimetable(className, section);
      setTimetable(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const getTimetableEntry = (day, period) => {
    return timetable.find(entry => 
      entry.dayOfWeek === day && entry.period === period
    );
  };

  const getTimeSlot = (period) => {
    return timeSlots.find(slot => slot.period === period);
  };

  const handleCellClick = (day, period) => {
    if (!readOnly && onEditEntry) {
      const entry = getTimetableEntry(day, period);
      const timeSlot = getTimeSlot(period);
      onEditEntry({
        day,
        period,
        entry,
        defaultStartTime: timeSlot?.start || '',
        defaultEndTime: timeSlot?.end || ''
      });
    }
  };

  if (loading) {
    return (
      <div className="timetable-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading timetable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timetable-error">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <h4 className="mb-0">
          <i className="fas fa-calendar-alt me-2"></i>
          Class {className} - Section {section} Timetable
        </h4>
      </div>

      <div className="timetable-grid">
        <table className="timetable-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Period</th>
              <th style={{ width: '80px' }}>Time</th>
              {days.map(day => (
                <th key={day} style={{ width: '150px' }}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => {
              const timeSlot = getTimeSlot(period);
              return (
                <tr key={period}>
                  <td className="period-cell">
                    Period {period}
                  </td>
                  <td className="time-cell">
                    {timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : ''}
                  </td>
                  {days.map(day => {
                    const entry = getTimetableEntry(day, period);
                    return (
                      <td
                        key={`${day}-${period}`}
                        className={`subject-cell ${!entry ? 'empty-cell' : ''}`}
                        onClick={() => handleCellClick(day, period)}
                        style={{ cursor: readOnly ? 'default' : 'pointer' }}
                      >
                        {entry ? (
                          <div className="subject-info">
                            <div className="subject-name">{entry.subject}</div>
                            <div className="teacher-name">{entry.teacherName}</div>
                            {entry.room && (
                              <div className="room-info">Room: {entry.room}</div>
                            )}
                          </div>
                        ) : (
                          <span>{readOnly ? '-' : 'Click to add'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div className="mt-3 text-muted">
          <small>
            <i className="fas fa-info-circle me-1"></i>
            Click on any cell to add or edit a timetable entry
          </small>
        </div>
      )}
    </div>
  );
};

export default TimetableViewer;