import { useState, useEffect } from 'react';

const AttendanceViewer = () => {
  const [attendanceData, setAttendanceData] = useState({
    summary: {},
    records: [],
    loading: true,
    error: null
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    class: '1',
    section: 'A'
  });

  useEffect(() => {
    // Default to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFilters(prev => ({
      ...prev,
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    }));
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
      if (!token) throw new Error('No authentication token found');

      const params = new URLSearchParams();
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/class/${filters.class}/${filters.section}?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = await response.json();

      if (result.success) {
        setAttendanceData({
          summary: result.data.summary || {},
          records: result.data.history || [],
          loading: false,
          error: null
        });
      } else {
        throw new Error(result.message || 'Failed to fetch attendance data');
      }

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load attendance data'
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent':  return 'danger';
      case 'late':    return 'warning';
      case 'excused': return 'info';
      default:        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return 'bi-check-circle-fill';
      case 'absent':  return 'bi-x-circle-fill';
      case 'late':    return 'bi-clock-fill';
      case 'excused': return 'bi-info-circle-fill';
      default:        return 'bi-question-circle';
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
          <button className="btn btn-outline-danger btn-sm ms-3" onClick={fetchAttendanceData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2>
          <i className="bi bi-calendar-check me-2 text-primary"></i>
          Attendance Records
        </h2>
        <p className="text-muted mb-0">View daily attendance history by class</p>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
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
            <div className="col-md-2">
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
            <div className="col-md-2">
              <label htmlFor="class" className="form-label">Class</label>
              <select
                className="form-select"
                id="class"
                name="class"
                value={filters.class}
                onChange={handleFilterChange}
              >
                {['1','2','3','4','5','6','7','8','9','10'].map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="section" className="form-label">Section</label>
              <select
                className="form-select"
                id="section"
                name="section"
                value={filters.section}
                onChange={handleFilterChange}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={fetchAttendanceData}>
                <i className="bi bi-search me-2"></i>Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            Attendance — Class {filters.class}-{filters.section}
            <span className="badge bg-primary ms-2">{attendanceData.records.length} records</span>
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
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Marked By</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.records.map((record, index) => (
                    <tr key={index}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.studentName}</td>
                      <td><strong>{record.rollNumber}</strong></td>
                      <td>
                        <span className={`badge bg-${getStatusColor(record.status)}`}>
                          <i className={`bi ${getStatusIcon(record.status)} me-1`}></i>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td><small className="text-muted">{record.remarks || '—'}</small></td>
                      <td><small className="text-muted">{record.markedBy || '—'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceViewer;
