import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultsSection = ({ studentId }) => {
  const [allResults, setAllResults] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('2024-25');
  const [availableYears, setAvailableYears] = useState(['2024-25', '2023-24', '2022-23']);

  useEffect(() => {
    if (studentId) {
      fetchAllResults();
    }
  }, [studentId]);

  useEffect(() => {
    if (activeTab && allResults.length > 0) {
      filterResultsByYear(activeTab);
    }
  }, [activeTab, allResults]);

  const fetchAllResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/results/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const allResultsData = response.data.data;
        setAllResults(allResultsData);
        
        // Extract unique academic years from results
        const years = [...new Set(allResultsData.map(result => result.academicYear))].sort().reverse();
        if (years.length > 0) {
          setAvailableYears(years);
          setActiveTab(years[0]); // Set the most recent year as active
        }
        
        // Filter results for the active tab
        filterResultsByYear(years[0] || '2024-25');
      } else {
        setError(response.data.message || 'Failed to load results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const filterResultsByYear = (year) => {
    const filteredResults = allResults.filter(result => result.academicYear === year);
    setResults(filteredResults);
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  };

  const getGradeBadgeClass = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-success';
      case 'B+':
      case 'B':
        return 'bg-info';
      case 'C+':
      case 'C':
        return 'bg-warning text-dark';
      case 'D':
        return 'bg-secondary';
      case 'F':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const formatExamType = (examType) => {
    return examType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const groupResultsByYear = () => {
    const grouped = {};
    allResults.forEach(result => {
      if (!grouped[result.academicYear]) {
        grouped[result.academicYear] = [];
      }
      grouped[result.academicYear].push(result);
    });
    return grouped;
  };

  const calculateYearlyStats = (yearResults) => {
    if (yearResults.length === 0) return null;

    const totalPercentage = yearResults.reduce((sum, result) => sum + result.percentage, 0);
    const averagePercentage = totalPercentage / yearResults.length;
    const overallGrade = calculateGrade(averagePercentage);
    
    // Calculate attendance average
    const totalAttendance = yearResults.reduce((sum, result) => sum + (result.attendance || 100), 0);
    const averageAttendance = totalAttendance / yearResults.length;

    return {
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      overallGrade,
      averageAttendance: Math.round(averageAttendance * 100) / 100,
      totalExams: yearResults.length
    };
  };

  const handleTabChange = (year) => {
    setActiveTab(year);
    filterResultsByYear(year);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (allResults.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        No results found for this student.
      </div>
    );
  }

  const groupedResults = groupResultsByYear();

  return (
    <div className="row g-3">
      {/* Academic Year Tabs */}
      <div className="col-12">
        <ul className="nav nav-pills mb-3" id="results-tab" role="tablist">
          {availableYears.map((year) => (
            <li className="nav-item" key={year} role="presentation">
              <button 
                className={`nav-link ${activeTab === year ? 'active' : ''}`}
                id={`year-${year}-tab`}
                type="button" 
                role="tab"
                onClick={() => handleTabChange(year)}
              >
                {year} {groupedResults[year] ? `(${groupedResults[year].length})` : '(0)'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Current Year Results */}
      <div className="col-12">
        <div className="tab-content" id="results-tabContent">
          <div className="tab-pane fade show active" role="tabpanel">
            {results.length === 0 ? (
              <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                No results found for academic year {activeTab}.
              </div>
            ) : (
              <div className="row g-3">
                {/* Individual Exam Results */}
                {results.map((result, index) => (
                  <div key={result._id} className="col-md-6">
                    <div className={`card border-${index % 2 === 0 ? 'info' : 'warning'}`}>
                      <div className={`card-header ${index % 2 === 0 ? 'bg-info text-white' : 'bg-warning text-dark'}`}>
                        <h6 className="mb-0">{formatExamType(result.examType)} - {result.examName}</h6>
                      </div>
                      <div className="card-body">
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
                              {result.subjects.map((subject, subIndex) => (
                                <tr key={subIndex}>
                                  <td>{subject.subjectName}</td>
                                  <td>{subject.obtainedMarks}/{subject.maxMarks}</td>
                                  <td>
                                    <span className={`badge ${getGradeBadgeClass(subject.grade)}`}>
                                      {subject.grade}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3 p-2 bg-light rounded">
                          <strong>
                            Overall: {result.totalObtainedMarks}/{result.totalMaxMarks} ({result.percentage}%) - 
                            Grade <span className={`badge ${getGradeBadgeClass(result.overallGrade)} ms-1`}>
                              {result.overallGrade}
                            </span>
                          </strong>
                        </div>
                        {result.remarks && (
                          <div className="mt-2">
                            <small className="text-muted">
                              <strong>Remarks:</strong> {result.remarks}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Yearly Summary for Current Tab */}
                {(() => {
                  const yearStats = calculateYearlyStats(results);
                  return yearStats ? (
                    <div className="col-12 mt-4">
                      <div className="card border-success">
                        <div className="card-header bg-success text-white">
                          <h6 className="mb-0">Annual Summary {activeTab}</h6>
                        </div>
                        <div className="card-body">
                          <div className="row text-center">
                            <div className="col-md-3">
                              <div className="p-3">
                                <h4 className="text-primary mb-1">{yearStats.averagePercentage}%</h4>
                                <small className="text-muted">Overall Average</small>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="p-3">
                                <h4 className="text-success mb-1">{yearStats.overallGrade}</h4>
                                <small className="text-muted">Final Grade</small>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="p-3">
                                <h4 className="text-info mb-1">{yearStats.totalExams}</h4>
                                <small className="text-muted">Total Exams</small>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="p-3">
                                <h4 className="text-warning mb-1">{yearStats.averageAttendance}%</h4>
                                <small className="text-muted">Avg Attendance</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      {availableYears.length > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <i className="bi bi-graph-up me-2"></i>
                Performance Trend
              </h6>
              <p className="mb-0">
                <strong>Academic Progress:</strong> Student has appeared in {allResults.length} exams across {availableYears.length} academic years. 
                {availableYears.length >= 2 && (() => {
                  const currentYearStats = calculateYearlyStats(groupedResults[availableYears[0]] || []);
                  const previousYearStats = calculateYearlyStats(groupedResults[availableYears[1]] || []);
                  
                  if (currentYearStats && previousYearStats) {
                    const improvement = currentYearStats.averagePercentage - previousYearStats.averagePercentage;
                    
                    if (improvement > 0) {
                      return ` Showing improvement of ${improvement.toFixed(1)}% from previous year.`;
                    } else if (improvement < 0) {
                      return ` Performance declined by ${Math.abs(improvement).toFixed(1)}% from previous year.`;
                    } else {
                      return ` Performance maintained at same level as previous year.`;
                    }
                  }
                  return '';
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;