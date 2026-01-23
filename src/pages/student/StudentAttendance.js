import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentAttendance = () => {
  const [user, setUser] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark shadow-sm" style={{ backgroundColor: '#2c3e50' }}>
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-calendar-check me-2"></i>
            My Attendance
          </span>
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-light btn-sm me-2"
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
            <button 
              className="btn btn-outline-info btn-sm" 
              onClick={() => navigate("/profile")}
            >
              <i className="bi bi-person-circle me-1"></i>
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {/* Student Info */}
        {attendanceData?.student && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="mb-1">
                    <i className="bi bi-person-badge me-2 text-primary"></i>
                    {attendanceData.student.name}
                  </h5>
                  <p className="text-muted mb-0">
                    Roll Number: <strong>{attendanceData.student.rollNumber}</strong> | 
                    Class: <strong>{attendanceData.student.class}-{attendanceData.student.section}</strong>
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <div className="d-flex justify-content-end align-items-center">
                    <span className="me-2">Overall Attendance:</span>
                    <span className={`badge fs-6 ${
                      (attendanceData.summary?.percentage || 0) >= 90 ? 'bg-success' :
                      (attendanceData.summary?.percentage || 0) >= 75 ? 'bg-primary' :
                      (attendanceData.summary?.percentage || 0) >= 60 ? 'bg-warning' :
                      'bg-danger'
                    }`}>
                      {attendanceData.summary?.percentage || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Summary */}
        {attendanceData?.summary && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card bg-success bg-opacity-10 border-success">
                <div className="card-body text-center">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-success">{attendanceData.summary.present || 0}</h4>
                  <small className="text-muted">Present</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger bg-opacity-10 border-danger">
                <div className="card-body text-center">
                  <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-danger">{attendanceData.summary.absent || 0}</h4>
                  <small className="text-muted">Absent</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning bg-opacity-10 border-warning">
                <div className="card-body text-center">
                  <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-warning">{attendanceData.summary.late || 0}</h4>
                  <small className="text-muted">Late</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info bg-opacity-10 border-info">
                <div className="card-body text-center">
                  <i className="bi bi-info-circle text-info" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-info">{attendanceData.summary.excused || 0}</h4>
                  <small className="text-muted">Excused</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subject-wise Summary */}
        {attendanceData?.subjectSummary && attendanceData.subjectSummary.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-book me-2"></i>
                Subject-wise Attendance
              </h5>
            </div>
            <div className="card-body">
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

        {/* Date Range Filter */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
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
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Detailed Attendance Records
              {attendanceData?.records && (
                <span className="badge bg-primary ms-2">{attendanceData.records.length}</span>
              )}
            </h5>
          </div>
          <div className="card-body">
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

        {/* Attendance Insights */}
        {attendanceData?.summary && attendanceData.summary.total > 0 && (
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Attendance Insights
              </h5>
            </div>
            <div className="card-body">
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
      </div>
    </div>
  );
};

export default StudentAttendance;