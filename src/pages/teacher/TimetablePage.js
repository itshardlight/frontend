import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableManager from '../../components/timetable/TimetableManager';
import "bootstrap/dist/css/bootstrap.min.css";
import '../../styles/Dashboard.css';

const TimetablePage = () => {
  const [user, setUser] = useState(null);
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

    if (parsedUser.role !== 'teacher' && parsedUser.role !== 'admin') {
      navigate("/dashboard");
      return;
    }
  }, [navigate]);

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

  // Sidebar Menu Items based on role
  const getSidebarMenuItems = () => {
    const commonItems = [
      { icon: 'bi-speedometer2', label: 'Dashboard', path: '/dashboard' },
      { icon: 'bi-person-circle', label: 'Profile', path: '/profile' }
    ];

    const roleSpecificItems = {
      student: [
        { icon: 'bi-person-badge', label: 'My Profile', path: '/student/profile' },
        { icon: 'bi-calendar-check', label: 'Attendance', path: '/student/attendance' },
        { icon: 'bi-graph-up', label: 'Results', path: '/student/results' },
        { icon: 'bi-cash-stack', label: 'Fees', path: '/student/fees' },
        { icon: 'bi-calendar-week', label: 'My Timetable', path: '/student/timetable' }
      ],
      teacher: [
        { icon: 'bi-people', label: 'Students', path: '/admin/student-registration' },
        { icon: 'bi-clipboard-check', label: 'Attendance', path: '/teacher/attendance' },
        { icon: 'bi-journal-text', label: 'Results', path: '/teacher/results' }
      ],
      admin: [
        { icon: 'bi-gear', label: 'Admin Panel', path: '/admin/panel' },
        { icon: 'bi-people', label: 'Students', path: '/admin/student-registration' },
        { icon: 'bi-clipboard-check', label: 'Attendance', path: '/teacher/attendance' },
        { icon: 'bi-journal-text', label: 'Results', path: '/teacher/results' },
        { icon: 'bi-cash-stack', label: 'Fee Management', path: '/fee-department/fees' }
      ],
      fee_department: [
        { icon: 'bi-cash-stack', label: 'Fee Management', path: '/fee-department/fees' },
        { icon: 'bi-graph-up-arrow', label: 'Reports', path: '/fee-department/fees' }
      ]
    };

    return [...commonItems, ...(roleSpecificItems[user?.role] || [])];
  };

  if (!user) {
    return null;
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
            <h1 className="header-title">Timetable Management</h1>
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
                Manage Class Timetables
              </h2>
              <p>Create and manage timetables for different classes and sections.</p>
            </div>
            <button 
              className="refresh-btn"
              onClick={handleBackToDashboard}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>

          {/* Timetable Content */}
          <div className="dashboard-content">
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="bi bi-calendar-week me-2"></i>
                      Timetable Manager
                    </h5>
                  </div>
                  <div className="card-body">
                    <TimetableManager userRole={user?.role} />
                  </div>
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

export default TimetablePage;