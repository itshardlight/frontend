import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Dashboard.css";

const StudentAttendance = () => {
  const [user, setUser] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAttendance(token);
    }
  }, [navigate]);

  const fetchAttendance = async (token, params = {}) => {
    try {
      setLoading(true);
      setError("");
      const queryParams = new URLSearchParams(params);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/my-attendance?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setAttendanceData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch attendance data");
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.response?.data?.message || "Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    const newDateRange = { ...dateRange, [name]: value };
    setDateRange(newDateRange);
  };

  const applyDateFilter = () => {
    const token = localStorage.getItem("token");
    const params = {};
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;
    fetchAttendance(token, params);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-success';
      case 'absent': return 'bg-danger';
      case 'late': return 'bg-warning';
      case 'excused': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return 'bi-check-circle-fill';
      case 'absent': return 'bi-x-circle-fill';
      case 'late': return 'bi-clock-fill';
      case 'excused': return 'bi-info-circle-fill';
      default: return 'bi-question-circle';
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 75) return 'text-primary';
    if (percentage >= 60) return 'text-warning';
    return 'text-danger';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  const getSidebarMenuItems = () => {
    return [
      { icon: 'bi-speedometer2', label: 'Dashboard', path: '/dashboard' },
      { icon: 'bi-person-badge', label: 'My Profile', path: '/student/profile' },
      { icon: 'bi-calendar-check', label: 'Attendance', path: '/student/attendance' },
      { icon: 'bi-graph-up', label: 'Results', path: '/student/results' },
      { icon: 'bi-cash-stack', label: 'Fees', path: '/student/fees' }
    ];
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
            <h1 className="header-title">My Attendance</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-role badge badge-student">
                  STUDENT
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="dashboard-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          {/* Student Info - Welcome Section */}
          {attendanceData?.student && (
            <div className="welcome-section">
              <div className="welcome-text">
                <h2>
                  <i className="bi bi-person-badge me-2"></i>
                  {attendanceData.student.name}
                </h2>
                <p>
                  Roll Number: <strong>{attendanceData.student.rollNumber}</strong> | 
                  Class: <strong>{attendanceData.student.class}-{attendanceData.student.section}</strong>
                </p>
              </div>
              <div>
                <span className={`badge ${
                  (attendanceData.summary?.percentage || 0) >= 90 ? 'bg-success' :
                  (attendanceData.summary?.percentage || 0) >= 75 ? 'bg-primary' :
                  (attendanceData.summary?.percentage || 0) >= 60 ? 'bg-warning' :
                  'bg-danger'
                }`} style={{ fontSize: '1.2rem', padding: '10px 20px', borderRadius: '12px' }}>
                  {attendanceData.summary?.percentage || 0}% Overall
                </span>
              </div>
            </div>
          )}

          {/* Attendance Summary - Dashboard Style */}
          {attendanceData?.summary && (
            <div className="stats-grid mb-4">
              <div className="stat-card stat-card-success">
                <div className="stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>{attendanceData.summary.present || 0}</h3>
                  <p>Present</p>
                </div>
              </div>
              <div className="stat-card stat-card-warning">
                <div className="stat-icon">
                  <i className="bi bi-x-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>{attendanceData.summary.absent || 0}</h3>
                  <p>Absent</p>
                </div>
              </div>
              <div className="stat-card stat-card-info">
                <div className="stat-icon">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="stat-info">
                  <h3>{attendanceData.summary.late || 0}</h3>
                  <p>Late</p>
                </div>
              </div>
              <div className="stat-card stat-card-primary">
                <div className="stat-icon">
                  <i className="bi bi-info-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>{attendanceData.summary.excused || 0}</h3>
                  <p>Excused</p>
                </div>
              </div>
            </div>
          )}

          {/* Subject-wise Summary - Dashboard Style */}
          {attendanceData?.subjectSummary && attendanceData.subjectSummary.length > 0 && (
            <div className="card shadow-sm mb-4" style={{ borderRadius: '20px', border: 'none' }}>
              <div className="card-header" style={{ background: 'white', borderRadius: '20px 20px 0 0', borderBottom: '1px solid #e5e7eb' }}>
                <h5 className="mb-0" style={{ color: '#1E3A8A', fontWeight: '600' }}>
                  <i className="bi bi-book me-2"></i>
                  Subject-wise Attendance
                </h5>
              </div>
              <div className="card-body" style={{ padding: '25px' }}>
              <div className="row g-3">
                {attendanceData.subjectSummary.map((subject, index) => (
                  <div key={index} className="col-md-6 col-lg-4">
                    <div className="card border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">{subject._id}</h6>
                          <span className={`badge ${
                            subject.percentage >= 90 ? 'bg-success' :
                            subject.percentage >= 75 ? 'bg-primary' :
                            subject.percentage >= 60 ? 'bg-warning' :
                            'bg-danger'
                          }`}>
                            {subject.percentage}%
                          </span>
                        </div>
                        <div className="progress mb-2" style={{ height: '6px' }}>
                          <div 
                            className={`progress-bar ${
                              subject.percentage >= 75 ? 'bg-success' : 
                              subject.percentage >= 60 ? 'bg-warning' : 'bg-danger'
                            }`}
                            style={{ width: `${subject.percentage}%` }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          Present: {subject.present} / Total: {subject.total}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

          {/* Date Range Filter - Dashboard Style */}
          <div className="card shadow-sm mb-4" style={{ borderRadius: '20px', border: 'none' }}>
            <div className="card-body" style={{ padding: '25px' }}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Start Date</label>
                <input 
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">End Date</label>
                <input 
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                />
              </div>
              <div className="col-md-4">
                <button 
                  className="btn btn-primary me-2"
                  onClick={applyDateFilter}
                  style={{ 
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-funnel me-1"></i>
                  Apply Filter
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setDateRange({ startDate: "", endDate: "" });
                    const token = localStorage.getItem("token");
                    fetchAttendance(token);
                  }}
                  style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: '600' }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Attendance Records - Dashboard Style */}
          <div className="card shadow-sm" style={{ borderRadius: '20px', border: 'none' }}>
            <div className="card-header" style={{ background: 'white', borderRadius: '20px 20px 0 0', borderBottom: '1px solid #e5e7eb' }}>
              <h5 className="mb-0" style={{ color: '#1E3A8A', fontWeight: '600' }}>
                <i className="bi bi-calendar-check me-2"></i>
                Detailed Attendance Records
                {attendanceData?.records && (
                  <span className="badge bg-primary ms-2" style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}>
                    {attendanceData.records.length}
                  </span>
                )}
              </h5>
            </div>
            <div className="card-body" style={{ padding: '25px' }}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading attendance...</p>
              </div>
            ) : attendanceData?.records && attendanceData.records.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Remarks</th>
                      <th>Marked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.records.map((record, index) => (
                      <tr key={index}>
                        <td>{formatDate(record.date)}</td>
                        <td className="fw-bold">{record.subject}</td>
                        <td>
                          <span className="badge bg-secondary">{record.period}</span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusColor(record.status)}`}>
                            <i className={`bi ${getStatusIcon(record.status)} me-1`}></i>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{formatTime(record.timeIn)}</td>
                        <td>{formatTime(record.timeOut)}</td>
                        <td>
                          <small className="text-muted">
                            {record.remarks || '-'}
                          </small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {record.markedBy || '-'}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted py-5">
                <i className="bi bi-calendar-x" style={{ fontSize: '4rem' }}></i>
                <h4 className="mt-3">No Attendance Records</h4>
                <p>No attendance data is available for the selected period.</p>
              </div>
            )}
          </div>
        </div>

          {/* Attendance Insights - Dashboard Style */}
          {attendanceData?.summary && attendanceData.summary.total > 0 && (
            <div className="card shadow-sm mt-4" style={{ borderRadius: '20px', border: 'none' }}>
              <div className="card-header" style={{ background: 'white', borderRadius: '20px 20px 0 0', borderBottom: '1px solid #e5e7eb' }}>
                <h5 className="mb-0" style={{ color: '#1E3A8A', fontWeight: '600' }}>
                  <i className="bi bi-graph-up me-2"></i>
                  Attendance Insights
                </h5>
              </div>
              <div className="card-body" style={{ padding: '25px' }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Total Classes:</strong> {attendanceData.summary.total}
                  </div>
                  <div className="mb-3">
                    <strong>Classes Attended:</strong> {attendanceData.summary.present}
                  </div>
                  <div className="mb-3">
                    <strong>Classes Missed:</strong> {attendanceData.summary.absent}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Late Arrivals:</strong> {attendanceData.summary.late}
                  </div>
                  <div className="mb-3">
                    <strong>Attendance Status:</strong> 
                    <span className={`ms-2 badge ${
                      (attendanceData.summary.percentage || 0) >= 90 ? 'bg-success' :
                      (attendanceData.summary.percentage || 0) >= 75 ? 'bg-primary' :
                      (attendanceData.summary.percentage || 0) >= 60 ? 'bg-warning' :
                      'bg-danger'
                    }`}>
                      {(attendanceData.summary.percentage || 0) >= 90 ? 'Excellent' :
                       (attendanceData.summary.percentage || 0) >= 75 ? 'Good' :
                       (attendanceData.summary.percentage || 0) >= 60 ? 'Average' :
                       'Needs Improvement'}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Minimum Required:</strong> 75%
                  </div>
                </div>
              </div>
              
              {attendanceData.summary.percentage < 75 && (
                <div className="alert alert-warning mt-3" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Attention:</strong> Your attendance is below the minimum required 75%. 
                  Please ensure regular attendance to meet academic requirements.
                </div>
              )}
              </div>
            </div>
          )}
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

export default StudentAttendance;