import React, { useState, useEffect } from 'react';
import { timetableService } from '../../services/timetableService';

const TimetableManager = ({ userRole }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timetableData, setTimetableData] = useState({});
  const [originalData, setOriginalData] = useState({});

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C', 'D'];
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
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
    if (selectedClass && selectedSection) {
      fetchTimetable();
    }
  }, [selectedClass, selectedSection]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await timetableService.getClassTimetable(selectedClass, selectedSection);
      const data = response.data || [];
      
      // Convert array to object for easier editing
      const timetableObj = {};
      data.forEach(entry => {
        const key = `${entry.dayOfWeek}-${entry.period}`;
        timetableObj[key] = {
          _id: entry._id,
          subject: entry.subject || '',
          startTime: entry.startTime || '',
          endTime: entry.endTime || ''
        };
      });
      
      setTimetableData(timetableObj);
      setOriginalData(JSON.parse(JSON.stringify(timetableObj)));
    } catch (err) {
      setError(err.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlot = (period) => {
    return timeSlots.find(slot => slot.period === period);
  };

  const handleInputChange = (day, period, field, value) => {
    const key = `${day}-${period}`;
    setTimetableData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedClass || !selectedSection) {
      setError('Please select a class and section first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare all entries for bulk save
      const entries = [];
      days.forEach(day => {
        periods.forEach(period => {
          const key = `${day}-${period}`;
          const entry = timetableData[key];
          
          // Only include entries with a subject
          if (entry && entry.subject && entry.subject.trim()) {
            const timeSlot = getTimeSlot(period);
            entries.push({
              _id: entry._id || null,
              class: selectedClass,
              section: selectedSection,
              dayOfWeek: day,
              period: period,
              subject: entry.subject.trim(),
              startTime: entry.startTime || timeSlot?.start || '',
              endTime: entry.endTime || timeSlot?.end || ''
            });
          }
        });
      });

      if (entries.length === 0) {
        setError('Please add at least one subject to save');
        return;
      }

      console.log('Saving all entries:', entries);
      const response = await timetableService.saveBulkTimetable(entries);
      console.log('Save response:', response);
      
      setSuccess(`Successfully saved ${entries.length} timetable entries!`);
      
      // Refresh timetable
      await fetchTimetable();
    } catch (err) {
      console.error('Error saving timetable:', err);
      setError(err.message || 'Failed to save timetable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="timetable-manager-simple">
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Select Class</label>
          <select 
            className="form-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Choose a class...</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Select Section</label>
          <select 
            className="form-select"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Choose a section...</option>
            {sections.map(section => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle me-2"></i>
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess('')}
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {selectedClass && selectedSection && (
        <>
          {loading && !timetableData ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading timetable...</p>
            </div>
          ) : (
            <>
              <div className="timetable-edit-grid">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Period</th>
                      <th style={{ width: '100px' }}>Time</th>
                      {days.map(day => (
                        <th key={day}>
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
                          <td className="text-center fw-bold">Period {period}</td>
                          <td className="text-center text-muted small">
                            {timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : ''}
                          </td>
                          {days.map(day => {
                            const key = `${day}-${period}`;
                            const entry = timetableData[key] || {};
                            return (
                              <td key={key} className="p-2">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Subject"
                                  value={entry.subject || ''}
                                  onChange={(e) => handleInputChange(day, period, 'subject', e.target.value)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveAll}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {(!selectedClass || !selectedSection) && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Select a class and section above to start managing the timetable.
        </div>
      )}
    </div>
  );
};

export default TimetableManager;