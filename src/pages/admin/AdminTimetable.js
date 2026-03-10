import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableManager from '../../components/timetable/TimetableManager';
import TimetableViewer from '../../components/timetable/TimetableViewer';
import '../../styles/Timetable.css';

const AdminTimetable = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('manage');
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedSection, setSelectedSection] = useState('A');
  const navigate = useNavigate();

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C'];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'admin') {
      navigate("/dashboard");
      return;
    }
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
                Timetable Administration
              </h2>
              <p className="text-muted mb-0">
                Complete timetable management for all classes and sections
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
              Manage Timetables
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              <i className="fas fa-eye me-2"></i>
              View Timetables
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'manage' && (
          <div className="tab-pane fade show active">
            <div className="mt-4">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Admin Access:</strong> You have full access to create, edit, and delete timetable entries for all classes and sections.
              </div>
              <TimetableManager userRole={user.role} />
            </div>
          </div>
        )}
        
        {activeTab === 'view' && (
          <div className="tab-pane fade show active">
            <div className="mt-4">
              {/* Class Selection for Viewing */}
              <div className="class-selector">
                <div className="row align-items-center">
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Select Class:</label>
                    <select
                      className="form-select"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {classes.map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Select Section:</label>
                    <select
                      className="form-select"
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      {sections.map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="alert alert-success mb-0 flex-grow-1">
                      <i className="fas fa-eye me-2"></i>
                      <strong>View Mode:</strong> Read-only display
                    </div>
                  </div>
                </div>
              </div>

              {/* Timetable Viewer */}
              <TimetableViewer
                key={`${selectedClass}-${selectedSection}`}
                className={selectedClass}
                section={selectedSection}
                readOnly={true}
              />

              {/* Quick Actions */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="fas fa-tools me-2"></i>
                        Quick Actions
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <button
                            className="btn btn-primary w-100 mb-2"
                            onClick={() => setActiveTab('manage')}
                          >
                            <i className="fas fa-edit me-2"></i>
                            Edit This Timetable
                          </button>
                        </div>
                        <div className="col-md-6">
                          <button
                            className="btn btn-outline-primary w-100 mb-2"
                            onClick={() => window.print()}
                          >
                            <i className="fas fa-print me-2"></i>
                            Print Timetable
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Statistics */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Timetable Overview
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h4 className="text-primary mb-1">12</h4>
                    <small className="text-muted">Total Classes</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h4 className="text-success mb-1">36</h4>
                    <small className="text-muted">Class Sections</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h4 className="text-info mb-1">8</h4>
                    <small className="text-muted">Periods per Day</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <h4 className="text-warning mb-1">6</h4>
                    <small className="text-muted">Working Days</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTimetable;