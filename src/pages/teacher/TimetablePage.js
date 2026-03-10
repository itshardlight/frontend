import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableManager from '../../components/timetable/TimetableManager';
import { timetableService } from '../../services/timetableService';
import '../../styles/Timetable.css';

const TimetablePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('manage');
  const [teacherSchedule, setTeacherSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'teacher' && parsedUser.role !== 'admin') {
      navigate("/dashboard");
      return;
    }

    if (activeTab === 'schedule') {
      fetchTeacherSchedule(parsedUser._id);
    }
  }, [navigate, activeTab]);

  const fetchTeacherSchedule = async (teacherId) => {
    try {
      setLoading(true);
      setError('');
      const response = await timetableService.getTeacherSchedule(teacherId);
      setTeacherSchedule(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const renderTeacherSchedule = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your schedule...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      );
    }

    if (teacherSchedule.length === 0) {
      return (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          You don't have any classes assigned yet. Contact administration or use the "Manage Classes" tab to create timetable entries.
        </div>
      );
    }

    // Group schedule by day
    const scheduleByDay = teacherSchedule.reduce((acc, entry) => {
      if (!acc[entry.dayOfWeek]) {
        acc[entry.dayOfWeek] = [];
      }
      acc[entry.dayOfWeek].push(entry);
      return acc;
    }, {});

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    return (
      <div className="timetable-container">
        <div className="timetable-header">
          <h4 className="mb-0">
            <i className="fas fa-user-clock me-2"></i>
            My Teaching Schedule
          </h4>
        </div>

        <div className="row">
          {days.map(day => (
            <div key={day} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0 text-center">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </h6>
                </div>
                <div className="card-body">
                  {scheduleByDay[day] ? (
                    scheduleByDay[day]
                      .sort((a, b) => parseInt(a.period) - parseInt(b.period))
                      .map(entry => (
                        <div key={entry._id} className="mb-3 p-2 border rounded">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong className="text-primary">Period {entry.period}</strong>
                              <div className="small text-muted">
                                {entry.startTime} - {entry.endTime}
                              </div>
                            </div>
                            {entry.room && (
                              <span className="badge bg-secondary">{entry.room}</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <div className="fw-bold">{entry.subject}</div>
                            <div className="small text-muted">
                              Class {entry.class} - Section {entry.section}
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-muted py-3">
                      <i className="fas fa-calendar-times fa-2x mb-2"></i>
                      <p className="mb-0">No classes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Total Classes:</strong> {teacherSchedule.length} periods per week
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="fas fa-calendar-alt me-2 text-primary"></i>
                Timetable Management
              </h2>
              <p className="text-muted mb-0">
                Manage class timetables and view your teaching schedule
              </p>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={handleBackToDashboard}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="timetable-tabs">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <i className="fas fa-edit me-2"></i>
              Manage Classes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <i className="fas fa-user-clock me-2"></i>
              My Schedule
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'manage' && (
          <div className="tab-pane fade show active">
            <TimetableManager userRole={user.role} />
          </div>
        )}
        {activeTab === 'schedule' && (
          <div className="tab-pane fade show active">
            {renderTeacherSchedule()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetablePage;