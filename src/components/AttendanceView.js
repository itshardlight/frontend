import { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceView = () => {
  const [attendanceData, setAttendanceData] = useState({
    summary: {},
    subjectSummary: [],
    records: [],
    loading: true,
    error: null
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    subject: ''
  });

  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    // Set default date range (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFilters({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
      subject: ''
    });
  }, []);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchAttendanceData();
    }
  }, [filters]);

  const fetchAttendanceData = async () => {
    try {
      setAttendanceData(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.subject) params.append('subject', filters.subject);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/my-attendance?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = response.data.data;
      
      // Extract unique subjects
      const subjects = [...new Set(data.records.map(record => record.subject))];
      setAvailableSubjects(subjects);

      setAttendanceData({
        summary: data.summary,
        subjectSummary: data.subjectSummary || [],
        records: data.records,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || error.message || 'Failed to load attendance data'
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'secondary';
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

  if (attendanceData.loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (attendanceData.error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {attendanceData.error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3" 
            onClick={fetchAttendanceData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-calendar-check me-2 text-primary"></i>
              Attendance Record
            </h2>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="startDate" className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="endDate" className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <select
                    className="form-select"
                    id="subject"
                    name="subject"
                    value={filters.subject}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Subjects</option>
                    {availableSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={fetchAttendanceData}
                  >
                    <i className="bi bi-search me-2"></i>
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card text-center border-success">
                <div className="card-body">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
                  <h3 className="mt-2 mb-0">{attendanceData.summary.present || 0}</h3>
                  <small className="text-muted">Present</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center border-danger">
                <div className="card-body">
                  <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '2rem' }}></i>
                  <h3 className="mt-2 mb-0">{attendanceData.summary.absent || 0}</h3>
                  <small className="text-muted">Absent</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center border-warning">
                <div className="card-body">
                  <i className="bi bi-clock-fill text-warning" style={{ fontSize: '2rem' }}></i>
                  <h3 className="mt-2 mb-0">{attendanceData.summary.late || 0}</h3>
                  <small className="text-muted">Late</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center border-primary">
                <div className="card-body">
                  <i className="bi bi-percent text-primary" style={{ fontSize: '2rem' }}></i>
                  <h3 className="mt-2 mb-0">{attendanceData.summary.percentage || 0}%</h3>
                  <small className="text-muted">Attendance Rate</small>
                </div>
              </div>
            </div>
          </div>

          {/* Subject-wise Summary */}
          {attendanceData.subjectSummary.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Subject-wise Attendance</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Total</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.subjectSummary.map((subject, index) => (
                        <tr key={index}>
                          <td className="fw-bold">{subject._id}</td>
                          <td>
                            <span className="badge bg-success">{subject.present}</span>
                          </td>
                          <td>
                            <span className="badge bg-danger">{subject.absent}</span>
                          </td>
                          <td>
                            <span className="badge bg-warning">{subject.late}</span>
                          </td>
                          <td>{subject.total}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{subject.percentage}%</span>
                              <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                <div 
                                  className={`progress-bar ${subject.percentage >= 75 ? 'bg-success' : subject.percentage >= 60 ? 'bg-warning' : 'bg-danger'}`}
                                  style={{ width: `${subject.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Records */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                Detailed Attendance Records 
                <span className="badge bg-primary ms-2">{attendanceData.records.length}</span>
              </h5>
            </div>
            <div className="card-body">
              {attendanceData.records.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">No attendance records found for the selected period.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Period</th>
                        <th>Status</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                        <th>Remarks</th>
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
                            <span className={`badge bg-${getStatusColor(record.status)}`}>
                              <i className={`bi ${getStatusIcon(record.status)} me-1`}></i>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td>{formatTime(record.timeIn)}</td>
                          <td>{formatTime(record.timeOut)}</td>
                          <td>
                            <small className="text-muted">
                              {record.remarks || '-'}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;