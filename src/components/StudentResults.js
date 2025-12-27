import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentResults = ({ studentId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    academicYear: '2024-25',
    examType: ''
  });

  const examTypes = [
    { value: '', label: 'All Exams' },
    { value: 'unit_test_1', label: 'Unit Test 1' },
    { value: 'unit_test_2', label: 'Unit Test 2' },
    { value: 'mid_term', label: 'Mid Term' },
    { value: 'final_term', label: 'Final Term' },
    { value: 'annual', label: 'Annual' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half Yearly' }
  ];

  // Fetch student results
  const fetchResults = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.examType) params.append('examType', filters.examType);

      const response = await axios.get(
        `http://localhost:5000/api/results/student/${studentId}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(response.data.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error.response?.data?.message || 'Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Calculate GPA (simple average of all grades)
  const calculateGPA = (results) => {
    if (results.length === 0) return 0;
    
    const gradePoints = {
      'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0,
      'C+': 2.7, 'C': 2.3, 'D': 2.0, 'F': 0.0
    };
    
    const totalPoints = results.reduce((sum, result) => {
      return sum + (gradePoints[result.overallGrade] || 0);
    }, 0);
    
    return (totalPoints / results.length).toFixed(2);
  };

  // Get grade color
  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'success', 'A': 'success', 'B+': 'info', 'B': 'info',
      'C+': 'warning', 'C': 'warning', 'D': 'secondary', 'F': 'danger'
    };
    return colors[grade] || 'secondary';
  };

  // Get result color
  const getResultColor = (result) => {
    return result === 'pass' ? 'success' : 'danger';
  };

  useEffect(() => {
    if (studentId) {
      fetchResults();
    }
  }, [studentId, filters]);

  if (!studentId) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Student ID not found. Please contact your administrator.
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                My Academic Results
              </h4>
            </div>
            <div className="card-body">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Academic Year</label>
                  <select 
                    className="form-select"
                    value={filters.academicYear}
                    onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                  >
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                    <option value="2022-23">2022-23</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Exam Type</label>
                  <select 
                    className="form-select"
                    value={filters.examType}
                    onChange={(e) => handleFilterChange('examType', e.target.value)}
                  >
                    {examTypes.map(exam => (
                      <option key={exam.value} value={exam.value}>{exam.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              {/* Loading */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading your results...</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  {results.length > 0 && (
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="card bg-primary text-white">
                          <div className="card-body text-center">
                            <i className="bi bi-journal-text" style={{ fontSize: '2rem' }}></i>
                            <h3 className="mt-2 mb-0">{results.length}</h3>
                            <small>Total Exams</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-success text-white">
                          <div className="card-body text-center">
                            <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                            <h3 className="mt-2 mb-0">{results.filter(r => r.result === 'pass').length}</h3>
                            <small>Passed</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-info text-white">
                          <div className="card-body text-center">
                            <i className="bi bi-percent" style={{ fontSize: '2rem' }}></i>
                            <h3 className="mt-2 mb-0">
                              {results.length > 0 ? 
                                Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0}%
                            </h3>
                            <small>Average</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card bg-warning text-white">
                          <div className="card-body text-center">
                            <i className="bi bi-star" style={{ fontSize: '2rem' }}></i>
                            <h3 className="mt-2 mb-0">{calculateGPA(results)}</h3>
                            <small>GPA</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results List */}
                  {results.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                      <h5 className="mt-3 text-muted">No Results Found</h5>
                      <p className="text-muted">No exam results are available for the selected filters.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {results.map(result => (
                        <div key={result._id} className="col-lg-6 mb-4">
                          <div className="card h-100 border-0 shadow-sm">
                            <div className="card-header bg-light border-0">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 text-primary">
                                  <i className="bi bi-calendar-event me-2"></i>
                                  {result.examName}
                                </h6>
                                <span className={`badge bg-${getResultColor(result.result)}`}>
                                  {result.result.toUpperCase()}
                                </span>
                              </div>
                              <small className="text-muted">
                                {result.examType.replace('_', ' ').toUpperCase()} • {result.academicYear}
                              </small>
                            </div>
                            <div className="card-body">
                              {/* Overall Performance */}
                              <div className="row mb-3">
                                <div className="col-6">
                                  <div className="text-center">
                                    <h4 className="text-primary mb-0">{result.percentage}%</h4>
                                    <small className="text-muted">Percentage</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="text-center">
                                    <h4 className={`text-${getGradeColor(result.overallGrade)} mb-0`}>
                                      {result.overallGrade}
                                    </h4>
                                    <small className="text-muted">Grade</small>
                                  </div>
                                </div>
                              </div>

                              {/* Total Marks */}
                              <div className="text-center mb-3">
                                <span className="badge bg-secondary fs-6">
                                  {result.totalObtainedMarks} / {result.totalMaxMarks} Marks
                                </span>
                              </div>

                              {/* Subjects */}
                              <h6 className="text-muted mb-2">Subject-wise Performance:</h6>
                              <div className="table-responsive">
                                <table className="table table-sm">
                                  <thead>
                                    <tr>
                                      <th>Subject</th>
                                      <th>Marks</th>
                                      <th>Grade</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {result.subjects.map((subject, index) => (
                                      <tr key={index}>
                                        <td>
                                          <small className="fw-medium">{subject.subjectName}</small>
                                        </td>
                                        <td>
                                          <small>{subject.obtainedMarks}/{subject.maxMarks}</small>
                                        </td>
                                        <td>
                                          <span className={`badge bg-${getGradeColor(subject.grade)} badge-sm`}>
                                            {subject.grade}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Attendance */}
                              <div className="d-flex justify-content-between align-items-center mt-3">
                                <small className="text-muted">
                                  <i className="bi bi-calendar-check me-1"></i>
                                  Attendance: {result.attendance}%
                                </small>
                                <small className="text-muted">
                                  {new Date(result.createdAt).toLocaleDateString()}
                                </small>
                              </div>

                              {/* Remarks */}
                              {result.remarks && (
                                <div className="mt-3">
                                  <small className="text-muted">
                                    <strong>Remarks:</strong> {result.remarks}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;