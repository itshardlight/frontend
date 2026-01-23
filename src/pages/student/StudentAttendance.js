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
      const queryParams = new URLSearchParams(params);
      const response = await axios.get(
        `http://localhost:5000/api/attendance/my-attendance?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setAttendanceData(response.data);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to fetch attendance data");
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

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 75) return 'text-primary';
    if (percentage >= 60) return 'text-warning';
    return 'text-danger';
  };

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">My Attendance</span>
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
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Attendance Summary */}
        {attendanceData?.summary && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card bg-success bg-opacity-10 border-success">
                <div className="card-body text-center">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-success">{attendanceData.summary.presentDays || 0}</h4>
                  <small className="text-muted">Present Days</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger bg-opacity-10 border-danger">
                <div className="card-body text-center">
                  <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-danger">{attendanceData.summary.absentDays || 0}</h4>
                  <small className="text-muted">Absent Days</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning bg-opacity-10 border-warning">
                <div className="card-body text-center">
                  <i className="bi bi-clock text-warning" style={{ fontSize: '2rem' }}></i>
                  <h4 className="mt-2 mb-0 text-warning">{attendanceData.summary.lateDays || 0}</h4>
                  <small className="text-muted">Late Days</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-primary bg-opacity-10 border-primary">
                <div className="card-body text-center">
                  <i className="bi bi-percent text-primary" style={{ fontSize: '2rem' }}></i>
                  <h4 className={`mt-2 mb-0 ${getAttendanceColor(attendanceData.summary.attendancePercentage || 0)}`}>
                    {attendanceData.summary.attendancePercentage || 0}%
                  </h4>
                  <small className="text-muted">Attendance Rate</small>
                </div>
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
              Attendance Records
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
                      <th>Day</th>
                      <th>Status</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.records.map((record, index) => (
                      <tr key={index}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                        <td>
                          <span className={`badge ${getStatusColor(record.status)}`}>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{record.timeIn || '-'}</td>
                        <td>{record.timeOut || '-'}</td>
                        <td>{record.remarks || '-'}</td>
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
        {attendanceData?.summary && (
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
                    <strong>Total School Days:</strong> {(attendanceData.summary.presentDays || 0) + (attendanceData.summary.absentDays || 0)}
                  </div>
                  <div className="mb-3">
                    <strong>Days Present:</strong> {attendanceData.summary.presentDays || 0}
                  </div>
                  <div className="mb-3">
                    <strong>Days Absent:</strong> {attendanceData.summary.absentDays || 0}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong>Late Arrivals:</strong> {attendanceData.summary.lateDays || 0}
                  </div>
                  <div className="mb-3">
                    <strong>Attendance Status:</strong> 
                    <span className={`ms-2 badge ${
                      (attendanceData.summary.attendancePercentage || 0) >= 90 ? 'bg-success' :
                      (attendanceData.summary.attendancePercentage || 0) >= 75 ? 'bg-primary' :
                      (attendanceData.summary.attendancePercentage || 0) >= 60 ? 'bg-warning' :
                      'bg-danger'
                    }`}>
                      {(attendanceData.summary.attendancePercentage || 0) >= 90 ? 'Excellent' :
                       (attendanceData.summary.attendancePercentage || 0) >= 75 ? 'Good' :
                       (attendanceData.summary.attendancePercentage || 0) >= 60 ? 'Average' :
                       'Needs Improvement'}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Minimum Required:</strong> 75%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;