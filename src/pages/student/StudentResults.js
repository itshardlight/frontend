import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Dashboard.css";

const StudentResults = () => {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    academicYear: "",
    examType: ""
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
      fetchResults(token);
    }
  }, [navigate]);

  const fetchResults = async (token, filterParams = {}) => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      
      console.log("Fetching results with token:", token ? "Token exists" : "No token");
      console.log("Filter params:", filterParams);
      
      const params = new URLSearchParams(filterParams);
      const response = await axios.get(
        `http://localhost:5000/api/results/my-results?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        setResults(response.data.results || []);
        console.log("Results set:", response.data.results?.length || 0, "items");
      } else {
        setError(response.data.message || "Failed to fetch results");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        // Redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.status === 403) {
        setError("Access denied. Student role required.");
      } else if (err.response?.status === 404) {
        setError("Student record not found. Please contact administration.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch results");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    const token = localStorage.getItem("token");
    const filterParams = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== "")
    );
    fetchResults(token, filterParams);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': case 'A': return 'bg-success';
      case 'B+': case 'B': return 'bg-primary';
      case 'C+': case 'C': return 'bg-warning';
      default: return 'bg-danger';
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'bg-success';
    if (percentage >= 75) return 'bg-primary';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-danger';
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
            <h1 className="header-title">My Results</h1>
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
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h2>Academic Performance</h2>
              <p>Track your exam results and academic progress</p>
            </div>
            <button 
              className="refresh-btn"
              onClick={() => {
                const token = localStorage.getItem("token");
                fetchResults(token);
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-arrow-clockwise me-2"></i>
              )}
              Refresh
            </button>
          </div>

          {/* Results Summary - Dashboard Style */}
          {results.length > 0 && (
            <div className="stats-grid mb-4">
              <div className="stat-card stat-card-primary">
                <div className="stat-icon">
                  <i className="bi bi-journal-text"></i>
                </div>
                <div className="stat-info">
                  <h3>{results.length}</h3>
                  <p>Total Exams</p>
                </div>
              </div>
              <div className="stat-card stat-card-success">
                <div className="stat-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="stat-info">
                  <h3>{Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)}%</h3>
                  <p>Average Score</p>
                </div>
              </div>
              <div className="stat-card stat-card-info">
                <div className="stat-icon">
                  <i className="bi bi-trophy"></i>
                </div>
                <div className="stat-info">
                  <h3>{Math.max(...results.map(r => r.percentage))}%</h3>
                  <p>Best Score</p>
                </div>
              </div>
              <div className="stat-card stat-card-warning">
                <div className="stat-icon">
                  <i className="bi bi-award"></i>
                </div>
                <div className="stat-info">
                  <h3>{results.filter(r => r.grade === 'A+' || r.grade === 'A').length}</h3>
                  <p>A Grades</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters - Dashboard Style */}
          <div className="card shadow-sm mb-4" style={{ borderRadius: '20px', border: 'none' }}>
            <div className="card-body" style={{ padding: '25px' }}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>Academic Year</label>
                  <select 
                    className="form-select"
                    name="academicYear"
                    value={filters.academicYear}
                    onChange={handleFilterChange}
                    style={{ borderRadius: '12px', padding: '10px 15px' }}
                  >
                    <option value="">All Years</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                    <option value="2022-23">2022-23</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label" style={{ fontWeight: '600', color: '#374151' }}>Exam Type</label>
                  <select 
                    className="form-select"
                    name="examType"
                    value={filters.examType}
                    onChange={handleFilterChange}
                    style={{ borderRadius: '12px', padding: '10px 15px' }}
                  >
                    <option value="">All Exams</option>
                    <option value="Unit Test">Unit Test</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final Exam">Final Exam</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setFilters({ academicYear: "", examType: "" });
                      const token = localStorage.getItem("token");
                      fetchResults(token);
                    }}
                    style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: '600' }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table - Dashboard Style */}
          <div className="card shadow-sm" style={{ borderRadius: '20px', border: 'none' }}>
            <div className="card-header" style={{ background: 'white', borderRadius: '20px 20px 0 0', borderBottom: '1px solid #e5e7eb' }}>
              <h5 className="mb-0" style={{ color: '#1E3A8A', fontWeight: '600' }}>
                <i className="bi bi-graph-up me-2"></i>
                Exam Results
              </h5>
            </div>
            <div className="card-body" style={{ padding: '25px' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading results...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Exam Type</th>
                        <th>Subject</th>
                        <th>Marks Obtained</th>
                        <th>Total Marks</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                        <th>Academic Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td>{new Date(result.examDate).toLocaleDateString()}</td>
                          <td>
                            <span className="badge bg-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}>
                              {result.examType}
                            </span>
                          </td>
                          <td className="fw-bold">{result.subject}</td>
                          <td className="text-center">{result.marksObtained}</td>
                          <td className="text-center">{result.totalMarks}</td>
                          <td>
                            <span className={`badge ${getPercentageColor(result.percentage)}`} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}>
                              {result.percentage}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getGradeColor(result.grade)}`} style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px' }}>
                              {result.grade}
                            </span>
                          </td>
                          <td>{result.academicYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-graph-up" style={{ fontSize: '4rem', color: '#9CA3AF' }}></i>
                  <h4 className="mt-3" style={{ color: '#6B7280' }}>No Results Found</h4>
                  <p style={{ color: '#9CA3AF' }}>No exam results are available yet. Check back later!</p>
                </div>
              )}
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

export default StudentResults;