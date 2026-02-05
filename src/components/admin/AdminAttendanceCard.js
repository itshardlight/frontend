import React, { useState, useEffect } from 'react';
import adminAttendanceService from '../../services/adminAttendanceService';

const AdminAttendanceCard = ({ studentId }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchAttendanceData();
    }
  }, [studentId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminAttendanceService.getStudentAttendanceSummary(studentId);
      setAttendanceData(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header bg-info text-white">
          <h6 className="mb-0">
            <i className="bi bi-calendar-check me-2"></i>
            Attendance Summary
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border spinner-border-sm text-primary"></div>
          <p className="mt-2 mb-0 text-muted small">Loading attendance...</p>
        </div>
      </div>
    );
  }

  if (error || !attendanceData) {
    return (
      <div className="card">
        <div className="card-header bg-info text-white">
          <h6 className="mb-0">
            <i className="bi bi-calendar-check me-2"></i>
            Attendance Summary
          </h6>
        </div>
        <div className="card-body">
          <div className="alert alert-warning mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <small>{error || 'No attendance data available'}</small>
          </div>
        </div>
      </div>
    );
  }

  const { summary, subjectSummary, hasData } = attendanceData;

  if (!hasData) {
    return (
      <div className="card">
        <div className="card-header bg-info text-white">
          <h6 className="mb-0">
            <i className="bi bi-calendar-check me-2"></i>
            Attendance Summary
          </h6>
        </div>
        <div className="card-body">
          <div className="alert alert-info mb-0">
            <i className="bi bi-info-circle me-2"></i>
            <small>No attendance records found for the last 30 days</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-info text-white">
        <h6 className="mb-0">
          <i className="bi bi-calendar-check me-2"></i>
          Attendance Summary
          <small className="ms-2 opacity-75">(Last 30 days)</small>
        </h6>
      </div>
      <div className="card-body">
        {/* Overall Attendance */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted">Overall Attendance:</span>
          <span className={`badge bg-${getPercentageColor(summary.percentage)} fs-6`}>
            {summary.percentage}%
          </span>
        </div>

        {/* Quick Stats */}
        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="text-center p-2 bg-light rounded">
              <div className="text-success fw-bold">{summary.present}</div>
              <small className="text-muted">Present</small>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center p-2 bg-light rounded">
              <div className="text-danger fw-bold">{summary.absent}</div>
              <small className="text-muted">Absent</small>
            </div>
          </div>
          <div className="col-4">
            <div className="text-center p-2 bg-light rounded">
              <div className="text-warning fw-bold">{summary.late}</div>
              <small className="text-muted">Late</small>
            </div>
          </div>
        </div>

        {/* Total Records Info */}
        <div className="pt-2 border-top">
          <small className="text-muted">
            <i className="bi bi-calendar3 me-1"></i>
            Total records: {summary.total} classes
          </small>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceCard;