import React, { useEffect, useState } from 'react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultsManagement } from '../../components/teacher';
import "../../styles/Dashboard.css";

const ResultsPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    const parsedUser = userData ? JSON.parse(userData) : {};
    const role = userRole || parsedUser.role;
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user has permission to access results
    if (!['admin', 'teacher'].includes(role)) {
      navigate('/dashboard');
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

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
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const getSidebarMenuItems = () => {
    const role = user?.role;
    const commonItems = [
      { icon: 'bi-speedometer2', label: 'Dashboard', path: '/dashboard' }
    ];

    if (role === 'admin') {
      return [
        ...commonItems,
        { icon: 'bi-gear', label: 'Admin Panel', path: '/admin/panel' },
        { icon: 'bi-people', label: 'Students', path: '/admin/student-registration' },
        { icon: 'bi-clipboard-check', label: 'Attendance', path: '/teacher/attendance' },
        { icon: 'bi-journal-text', label: 'Results', path: '/teacher/results' },
        { icon: 'bi-cash-stack', label: 'Fee Management', path: '/fee-department/fees' }
      ];
    } else if (role === 'teacher') {
      return [
        ...commonItems,
        { icon: 'bi-people', label: 'Students', path: '/admin/student-registration' },
        { icon: 'bi-clipboard-check', label: 'Attendance', path: '/teacher/attendance' },
        { icon: 'bi-journal-text', label: 'Results', path: '/teacher/results' }
      ];
    }
    return commonItems;
  };

  if (!user) return null;

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
            <h1 className="header-title">Results Management</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className={`user-role badge ${user.role === 'admin' ? 'badge-admin' : 'badge-teacher'}`}>
                  {user.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="dashboard-body">
          <ResultsManagement />
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

export default ResultsPage;