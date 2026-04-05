import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StudentDashboardCharts = ({ userId }) => {
  const [data, setData] = useState({
    fees: null,
    attendance: null,
    results: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartKey, setChartKey] = useState(0); // Add key to force chart recreation

  useEffect(() => {
    fetchAllData();
  }, [userId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [feesRes, attendanceRes, resultsRes] = await Promise.all([
        // Fetch fee data
        axios.get('http://localhost:5000/api/profiles/me/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } })),
        
        // Fetch attendance data
        axios.get('http://localhost:5000/api/attendance/my-attendance', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } })),
        
        // Fetch results data
        axios.get('http://localhost:5000/api/results/my-results', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } }))
      ]);

      setData({
        fees: feesRes.data.success ? feesRes.data.profile?.feeInfo : null,
        attendance: attendanceRes.data.success ? attendanceRes.data.data : null,
        results: resultsRes.data.success ? resultsRes.data.results : null
      });

      // Force chart recreation by updating key
      setChartKey(prev => prev + 1);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-charts-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-charts-container">
        <div className="alert alert-warning text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  // Fee Chart Data
  const getFeeChartData = () => {
    if (!data.fees || !data.fees.totalFee) {
      return null;
    }

    const { totalFee, paidAmount = 0, pendingAmount = 0 } = data.fees;
    return {
      labels: ['Paid', 'Pending'],
      datasets: [{
        data: [paidAmount, pendingAmount],
        backgroundColor: ['#28a745', '#ffc107'],
        borderColor: ['#1e7e34', '#e0a800'],
        borderWidth: 2,
      }]
    };
  };

  // Attendance Chart Data
  const getAttendanceChartData = () => {
    if (!data.attendance) {
      return null;
    }

    // Check if we have summary data
    if (data.attendance.summary) {
      const { summary } = data.attendance;
      const presentDays = summary.present || 0;
      const absentDays = summary.absent || 0;
      const lateDays = summary.late || 0;
      const excusedDays = summary.excused || 0;
      
      // Only show chart if there's actual data
      const totalDays = presentDays + absentDays + lateDays + excusedDays;
      if (totalDays === 0) {
        return null;
      }
      
      return {
        labels: ['Present', 'Absent', 'Late', 'Excused'],
        datasets: [{
          data: [presentDays, absentDays, lateDays, excusedDays],
          backgroundColor: ['#28a745', '#dc3545', '#fd7e14', '#6c757d'],
          borderColor: ['#1e7e34', '#a71e2a', '#dc6502', '#495057'],
          borderWidth: 2,
        }]
      };
    }

    // Fallback: if we have records but no summary, calculate from records
    if (data.attendance.records && data.attendance.records.length > 0) {
      const records = data.attendance.records;
      const statusCounts = records.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {});

      const presentDays = statusCounts.present || 0;
      const absentDays = statusCounts.absent || 0;
      const lateDays = statusCounts.late || 0;
      const excusedDays = statusCounts.excused || 0;

      return {
        labels: ['Present', 'Absent', 'Late', 'Excused'],
        datasets: [{
          data: [presentDays, absentDays, lateDays, excusedDays],
          backgroundColor: ['#28a745', '#dc3545', '#fd7e14', '#6c757d'],
          borderColor: ['#1e7e34', '#a71e2a', '#dc6502', '#495057'],
          borderWidth: 2,
        }]
      };
    }

    return null;
  };

  // Results Chart Data
  const getResultsChartData = () => {
    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Get last 5 results for the chart
    const recentResults = data.results.slice(-5);
    const labels = recentResults.map(result => result.examName || result.examType);
    const percentages = recentResults.map(result => result.percentage || 0);

    // Define color logic based on marks
    const getBarColor = (percentage) => {
      if (percentage < 40) {
        return '#dc3545'; // Red for below passing (40%)
      } else if (percentage >= 80) {
        return '#007bff'; // Blue for above 80%
      } else {
        return '#ffc107'; // Yellow for between passing and 80%
      }
    };

    const getBorderColor = (percentage) => {
      if (percentage < 40) {
        return '#a71e2a'; // Darker red
      } else if (percentage >= 80) {
        return '#0056b3'; // Darker blue
      } else {
        return '#e0a800'; // Darker yellow
      }
    };

    // Generate colors for each bar based on percentage
    const backgroundColors = percentages.map(getBarColor);
    const borderColors = percentages.map(getBorderColor);

    return {
      labels,
      datasets: [{
        label: 'Percentage',
        data: percentages,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 4,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: { size: 12 }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            // Check if this is a fee chart by looking at the label format
            if (context.label === 'Paid' || context.label === 'Pending') {
              return `${context.label}: Rs.${value.toLocaleString()} (${percentage}%)`;
            }
            // For attendance and other charts
            return `${context.label}: ${value} days (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = context.parsed.y;
            let status = '';
            if (percentage < 40) {
              status = ' (Below Passing)';
            } else if (percentage >= 80) {
              status = ' (Excellent)';
            } else {
              status = ' (Passing)';
            }
            return `${percentage}%${status}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  const feeChartData = getFeeChartData();
  const attendanceChartData = getAttendanceChartData();
  const resultsChartData = getResultsChartData();

  return (
    <div className="dashboard-charts-container">
      <div className="row">
        {/* Fee Chart */}
        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">
                <i className="bi bi-cash-stack me-2"></i>
                Fee Status
              </h6>
            </div>
            <div className="card-body">
              {feeChartData ? (
                <>
                  <div style={{ height: '200px' }}>
                    <Doughnut key={`fee-chart-${chartKey}`} data={feeChartData} options={chartOptions} />
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      Total: Rs.{data.fees.totalFee.toLocaleString()}
                    </small>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-info-circle text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2">No fee data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">
                <i className="bi bi-calendar-check me-2"></i>
                Attendance
              </h6>
            </div>
            <div className="card-body">
              {attendanceChartData ? (
                <>
                  <div style={{ height: '200px' }}>
                    <Doughnut key={`attendance-chart-${chartKey}`} data={attendanceChartData} options={chartOptions} />
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      {data.attendance.summary?.percentage?.toFixed(1) || 
                       (data.attendance.records ? 
                         ((data.attendance.records.filter(r => r.status === 'present').length / 
                           data.attendance.records.length) * 100).toFixed(1) : 0)}% Overall
                      <br />
                      Total: {data.attendance.summary?.total || data.attendance.records?.length || 0} days
                    </small>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-info-circle text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2">
                    {data.attendance ? 'No attendance records found' : 'No attendance data available'}
                  </p>
                  {data.attendance && (
                    <small className="text-muted">
                      Check back after attendance is marked
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Chart */}
        <div className="col-lg-4 col-md-12 mb-4">
          <div className="card h-100">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Recent Results
              </h6>
            </div>
            <div className="card-body">
              {resultsChartData ? (
                <>
                  <div style={{ height: '200px' }}>
                    <Bar key={`results-chart-${chartKey}`} data={resultsChartData} options={barOptions} />
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      Last {Math.min(data.results.length, 5)} exams
                    </small>
                    <div className="mt-2">
                      <small className="d-block text-muted">
                        <span style={{ color: '#dc3545' }}>●</span> Below 40% 
                        <span className="mx-2" style={{ color: '#ffc107' }}>●</span> 40-79% 
                        <span className="mx-2" style={{ color: '#007bff' }}>●</span> 80%+
                      </small>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-info-circle text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2">No results available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardCharts;