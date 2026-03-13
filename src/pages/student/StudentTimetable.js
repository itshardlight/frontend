import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableViewer from '../../components/timetable/TimetableViewer';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import '../../styles/Dashboard.css';

const StudentTimetable = () => {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'student') {
      navigate("/dashboard");
      return;
    }

    fetchStudentProfile();
  }, [navigate]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get('http://localhost:5000/api/profiles/me/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.profile) {
        setStudentProfile(response.data.profile);
      } else {
        setError('Student profile not found. Please contact administration.');
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError('Failed to load student profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin": return "badge-admin";
      case "teacher": return "badge-teacher";
      case "student": return "badge-student";
      case "fee_department": return "badge-fee-department";
      default: return "bg-secondary";
    }
  };

  // Sidebar Menu Items for student
  const getSidebarMenuItems = () => {
    return [
      { icon: 'bi-speedometer2', label: 'Dashboard', path: '/dashboard' },
      { icon: 'bi-person-circle', label: 'Profile', path: '/profile' },
      { icon: 'bi-person-badge', label: 'My Profile', path: '/student/profile' },
      { icon: 'bi-calendar-check', label: 'Attendance', path: '/student/attendance' },
      { icon: 'bi-graph-up', label: 'Results', path: '/student/results' },
      { icon: 'bi-cash-stack', label: 'Fees', path: '/student/fees' },
      { icon: 'bi-calendar-week', label: 'My Timetable', path: '/student/timetable' }
    ];
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-main">
          <div className="dashboard-body">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your timetable...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-main">
          <div className="dashboard-body">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
                <div className="text-center">
                  <button 
                    className="btn btn-primary"
                    onClick={handleBackToDashboard}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-main">
          <div className="dashboard-body">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="alert alert-warning">
                  <i className="bi bi-info-circle me-2"></i>
                  Your profile information is not available. Please contact administration to set up your profile.
                </div>
                <div className="text-center">
                  <button 
                    className="btn btn-primary"
                    onClick={handleBackToDashboard}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract class and section from different possible data structures
  const getClassInfo = () => {
    // Check if data is from Profile model (academic.currentGrade)
    if (studentProfile.academic?.currentGrade && studentProfile.academic?.section) {
      return {
        class: studentProfile.academic.currentGrade,
        section: studentProfile.academic.section,
        rollNumber: studentProfile.academic.rollNumber
      };
    }
    // Check if data is from Student model (direct class/section)
    if (studentProfile.class && studentProfile.section) {
      return {
        class: studentProfile.class,
        section: studentProfile.section,
        rollNumber: studentProfile.rollNumber
      };
    }
    return null;
  };

  const classInfo = getClassInfo();

  if (!classInfo) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-main">
          <div className="dashboard-body">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="alert alert-warning">
                  <i className="bi bi-info-circle me-2"></i>
                  Your class and section information is not available. Please contact administration to update your profile.
                </div>
                <div className="text-center">
                  <button 
                    className="btn btn-primary"
                    onClick={handleBackToDashboard}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>Menu</h4>
          <button className="close-sidebar" onClick={closeSidebar}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          {getSidebarMenuItems().map((item, index) => (
            <button
              key={index}
              className="sidebar-item"
              onClick={() => navigateTo(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            <h1 className="header-title">My Timetable</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.username}</span>
                <span className={`user-role badge ${getRoleBadgeClass(user?.role)}`}>
                  {user?.role?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="dashboard-body">
          <div className="welcome-section">
            <div className="welcome-text">
              <h2>
                <i className="bi bi-calendar-week me-2 text-primary"></i>
                My Class Schedule
              </h2>
              <p>View your class timetable and subjects for the current academic year.</p>
            </div>
            <button 
              className="refresh-btn"
              onClick={handleBackToDashboard}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>

          {/* Student Info Card */}
          <div className="dashboard-content">
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="bi bi-person-badge me-2"></i>
                      Student Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <strong>Student Name:</strong>
                        <p className="mb-0">{studentProfile.firstName} {studentProfile.lastName}</p>
                      </div>
                      <div className="col-md-2">
                        <strong>Class:</strong>
                        <p className="mb-0">Class {classInfo.class}</p>
                      </div>
                      <div className="col-md-2">
                        <strong>Section:</strong>
                        <p className="mb-0">Section {classInfo.section}</p>
                      </div>
                      <div className="col-md-2">
                        <strong>Roll Number:</strong>
                        <p className="mb-0">{classInfo.rollNumber}</p>
                      </div>
                      <div className="col-md-3">
                        <strong>Academic Year:</strong>
                        <p className="mb-0">{new Date().getFullYear()}-{new Date().getFullYear() + 1}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timetable Card */}
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="bi bi-calendar-week me-2"></i>
                      Weekly Timetable
                    </h5>
                  </div>
                  <div className="card-body">
                    <TimetableViewer
                      className={classInfo.class}
                      section={classInfo.section}
                      readOnly={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Note:</strong> This is your class timetable. If you notice any discrepancies or if the timetable appears empty, 
                  please contact your class teacher or the administration office.
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <p>&copy; 2024 Student Management System. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#support">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentTimetable;