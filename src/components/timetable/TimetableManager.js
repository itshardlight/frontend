import React, { useState, useEffect } from 'react';
import TimetableViewer from './TimetableViewer';
import { timetableService } from '../../services/timetableService';

const TimetableManager = ({ userRole }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshTimetable, setRefreshTimetable] = useState(0);

  // Form data for timetable entry
  const [formData, setFormData] = useState({
    subject: '',
    startTime: '',
    endTime: '',
    room: ''
  });

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    // Component initialization
  }, []);

  const handleEditEntry = (entryData) => {
    const { day, period, entry, defaultStartTime, defaultEndTime } = entryData;
    
    setEditingEntry({
      day,
      period,
      entryId: entry?._id || null
    });

    setFormData({
      subject: entry?.subject || '',
      startTime: entry?.startTime || defaultStartTime,
      endTime: entry?.endTime || defaultEndTime,
      room: entry?.room || ''
    });

    setShowModal(true);
  };

  const handleSaveEntry = async () => {
    if (!selectedClass || !selectedSection || !editingEntry) {
      setError('Please select a class and section first');
      return;
    }

    if (!formData.subject || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const entryData = {
        class: selectedClass,
        section: selectedSection,
        dayOfWeek: editingEntry.day,
        period: editingEntry.period,
        subject: formData.subject,
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room
      };

      if (editingEntry.entryId) {
        entryData._id = editingEntry.entryId;
      }

      console.log('Saving timetable entry:', entryData);
      const response = await timetableService.saveTimetableEntry(entryData);
      console.log('Save response:', response);
      
      setSuccess('Timetable entry saved successfully');
      setShowModal(false);
      
      // Reset form
      setFormData({
        subject: '',
        startTime: '',
        endTime: '',
        room: ''
      });
      setEditingEntry(null);

      // Refresh timetable
      setRefreshTimetable(prev => prev + 1);
    } catch (err) {
      console.error('Error saving timetable entry:', err);
      setError(err.message || 'Failed to save timetable entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!editingEntry?.entryId) {
      setError('No entry to delete');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await timetableService.deleteTimetableEntry(editingEntry.entryId);
      setSuccess('Timetable entry deleted successfully');
      setShowModal(false);
      
      // Reset form
      setFormData({
        subject: '',
        startTime: '',
        endTime: '',
        room: ''
      });
      setEditingEntry(null);

      // Refresh timetable
      setRefreshTimetable(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to delete timetable entry');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntry(null);
    setFormData({
      subject: '',
      startTime: '',
      endTime: '',
      room: ''
    });
    setError('');
  };

  return (
    <div className="timetable-manager">
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
          <i className="fas fa-check-circle me-2"></i>
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
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {selectedClass && selectedSection && (
        <TimetableViewer 
          className={selectedClass}
          section={selectedSection}
          readOnly={false}
          onEditEntry={handleEditEntry}
          refreshKey={refreshTimetable}
        />
      )}

      {(!selectedClass || !selectedSection) && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          Select a class and section above to start managing the timetable.
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingEntry?.entryId ? 'Edit' : 'Add'} Timetable Entry
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>
                      Class {selectedClass} - Section {selectedSection}
                    </strong>
                    <br />
                    <span className="text-muted">
                      {editingEntry?.day?.charAt(0).toUpperCase() + editingEntry?.day?.slice(1)} - 
                      Period {editingEntry?.period}
                    </span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter subject name"
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label">Start Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">End Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Room</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.room}
                      onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                      placeholder="Enter room number (optional)"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  {editingEntry?.entryId && (
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      onClick={handleDeleteEntry}
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSaveEntry}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default TimetableManager;