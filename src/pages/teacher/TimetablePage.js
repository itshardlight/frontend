import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableManager from '../../components/timetable/TimetableManager';
import '../../styles/Timetable.css';

const TimetablePage = () => {
  const [user, setUser] = useState(null);
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
            <button className="nav-link active">
              <i className="fas fa-edit me-2"></i>
              Manage Classes
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <div className="tab-pane fade show active">
          <TimetableManager userRole={user.role} />
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;