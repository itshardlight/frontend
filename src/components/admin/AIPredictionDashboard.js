import React, { useState, useEffect } from 'react';
import aiPredictionService from '../../services/aiPredictionService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AIPredictionDashboard.css';

const AIPredictionDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [classAnalysis, setClassAnalysis] = useState(null);
  const [weakStudents, setWeakStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPrediction, setStudentPrediction] = useState(null);
  const [hfStatus, setHfStatus] = useState(null); // Add HF status state

  // Available classes and sections
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C'];

  useEffect(() => {
    loadOverviewData();
    checkHuggingFaceStatus(); // Add HF status check
  }, []);

  // Add function to check Hugging Face status
  const checkHuggingFaceStatus = async () => {
    try {
      const response = await aiPredictionService.getHuggingFaceStatus();
      setHfStatus(response.data);
    } catch (error) {
      console.error('Error checking HF status:', error);
      setHfStatus({ status: 'error', message: 'Unable to check status' });
    }
  };

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading overview data...');
      
      // Load overall weak students with better error handling
      const weakStudentsResponse = await aiPredictionService.getWeakStudents();
      
      console.log('Weak students response:', weakStudentsResponse);
      
      if (weakStudentsResponse.success) {
        const students = weakStudentsResponse.data.students || [];
        console.log(`Loaded ${students.length} weak students`);
        
        // Ensure all students have proper data structure
        const normalizedStudents = students.map(studentAnalysis => ({
          ...studentAnalysis,
          performanceData: {
            averagePercentage: studentAnalysis.performanceData?.averagePercentage ?? 
              studentAnalysis.prediction?.predictedMarks ?? 0,
            trend: studentAnalysis.performanceData?.trend ?? 'stable',
            consistencyScore: studentAnalysis.performanceData?.consistencyScore ?? 
              studentAnalysis.prediction?.confidence ?? 50
          },
          prediction: {
            predictedMarks: studentAnalysis.prediction?.predictedMarks ?? 0,
            riskLevel: studentAnalysis.prediction?.riskLevel ?? 'medium',
            predictedGrade: studentAnalysis.prediction?.predictedGrade ?? 'C',
            confidence: studentAnalysis.prediction?.confidence ?? 50,
            recommendations: studentAnalysis.prediction?.recommendations ?? []
          }
        }));
        
        setWeakStudents(normalizedStudents);
      } else {
        setError(weakStudentsResponse.message || 'Failed to load weak students data');
      }
    } catch (err) {
      console.error('Error loading overview data:', err);
      setError(err.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const analyzeClass = async () => {
    if (!selectedClass || !selectedSection) {
      setError('Please select both class and section');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log(`Analyzing class ${selectedClass}-${selectedSection}...`);
      
      const response = await aiPredictionService.analyzeClass({
        class: selectedClass,
        section: selectedSection
      });
      
      console.log('Class analysis response:', response);
      
      if (response.success) {
        // Normalize the class analysis data
        const normalizedAnalysis = {
          ...response.data,
          weakStudents: (response.data.weakStudents || []).map(studentAnalysis => ({
            ...studentAnalysis,
            performanceData: {
              averagePercentage: studentAnalysis.performanceData?.averagePercentage ?? 
                studentAnalysis.prediction?.predictedMarks ?? 0,
              trend: studentAnalysis.performanceData?.trend ?? 'stable',
              consistencyScore: studentAnalysis.performanceData?.consistencyScore ?? 
                studentAnalysis.prediction?.confidence ?? 50
            },
            prediction: {
              predictedMarks: studentAnalysis.prediction?.predictedMarks ?? 0,
              riskLevel: studentAnalysis.prediction?.riskLevel ?? 'medium',
              predictedGrade: studentAnalysis.prediction?.predictedGrade ?? 'C',
              confidence: studentAnalysis.prediction?.confidence ?? 50,
              recommendations: studentAnalysis.prediction?.recommendations ?? []
            }
          }))
        };
        
        setClassAnalysis(normalizedAnalysis);
      } else {
        setError(response.message || 'Failed to analyze class');
      }
    } catch (err) {
      console.error('Error analyzing class:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewStudentPrediction = async (student) => {
    try {
      setLoading(true);
      setError('');
      setSelectedStudent(student);
      
      // Use the new formula-based prediction
      const response = await aiPredictionService.getStudentFormulaPrediction(student._id);
      setStudentPrediction(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getGradeBadgeClass = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'bg-success';
      case 'B+':
      case 'B': return 'bg-primary';
      case 'C+':
      case 'C': return 'bg-info';
      case 'D': return 'bg-warning';
      case 'F': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-1">🤖 AI Performance Prediction Dashboard</h2>
          <p className="text-muted">Analyze student performance and predict future outcomes using AI</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'class-analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('class-analysis')}
          >
            🏫 Class Analysis
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'weak-students' ? 'active' : ''}`}
            onClick={() => setActiveTab('weak-students')}
          >
            ⚠️ At-Risk Students
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">📈 Performance Overview</h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-primary">{weakStudents.length}</h3>
                        <p className="text-muted small">Total Analyzed</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-danger">{weakStudents.filter(s => s.prediction?.riskLevel === 'high').length}</h3>
                        <p className="text-muted small">High Risk</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-warning">{weakStudents.filter(s => s.prediction?.riskLevel === 'medium').length}</h3>
                        <p className="text-muted small">Medium Risk</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-success">{weakStudents.filter(s => s.prediction?.riskLevel === 'low').length}</h3>
                        <p className="text-muted small">Low Risk</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">🎯 Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setActiveTab('class-analysis')}
                  >
                    Analyze Specific Class
                  </button>
                  <button 
                    className="btn btn-outline-warning"
                    onClick={() => setActiveTab('weak-students')}
                  >
                    View At-Risk Students
                  </button>
                  <button 
                    className="btn btn-outline-info"
                    onClick={loadOverviewData}
                    disabled={loading}
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Analysis Tab */}
      {activeTab === 'class-analysis' && (
        <div>
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">🏫 Class Performance Analysis</h5>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">Class</label>
                  <select 
                    className="form-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Section</label>
                  <select 
                    className="form-select"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    <option value="">Select Section</option>
                    {sections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">&nbsp;</label>
                  <div>
                    <button 
                      className="btn btn-primary"
                      onClick={analyzeClass}
                      disabled={loading || !selectedClass || !selectedSection}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Class'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {classAnalysis && (
            <div className="row">
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">📊 Class Statistics</h6>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-6">
                        <h4>{classAnalysis.totalStudents}</h4>
                        <small className="text-muted">Total Students</small>
                      </div>
                      <div className="col-6">
                        <h4>{classAnalysis.analyzedStudents}</h4>
                        <small className="text-muted">Analyzed</small>
                      </div>
                    </div>
                    <hr />
                    <div className="row text-center">
                      <div className="col-4">
                        <h5 className="text-danger">{classAnalysis.summary.highRisk}</h5>
                        <small>High Risk</small>
                      </div>
                      <div className="col-4">
                        <h5 className="text-warning">{classAnalysis.summary.mediumRisk}</h5>
                        <small>Medium Risk</small>
                      </div>
                      <div className="col-4">
                        <h5 className="text-success">{classAnalysis.summary.lowRisk}</h5>
                        <small>Low Risk</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-header bg-warning text-dark">
                    <h6 className="mb-0">⚠️ Students Needing Attention</h6>
                  </div>
                  <div className="card-body">
                    <div className="list-group list-group-flush">
                      {classAnalysis.weakStudents.slice(0, 5).map((studentAnalysis, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{studentAnalysis.student.firstName} {studentAnalysis.student.lastName}</strong>
                            <br />
                            <small className="text-muted">
                              Avg: {studentAnalysis.performanceData?.averagePercentage !== undefined && studentAnalysis.performanceData?.averagePercentage !== null ? 
                                studentAnalysis.performanceData.averagePercentage.toFixed(1) : 
                                studentAnalysis.prediction?.predictedMarks !== undefined && studentAnalysis.prediction?.predictedMarks !== null ? 
                                studentAnalysis.prediction.predictedMarks.toFixed(1) : 'N/A'}%
                            </small>
                          </div>
                          <span className={`badge ${getRiskBadgeClass(studentAnalysis.prediction.riskLevel)}`}>
                            {studentAnalysis.prediction.riskLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weak Students Tab */}
      {activeTab === 'weak-students' && (
        <div>
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">⚠️ At-Risk Students Analysis</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : weakStudents.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-muted">
                    <i className="fas fa-check-circle fa-3x mb-3 text-success"></i>
                    <h5>Great News!</h5>
                    <p>No at-risk students found in the current analysis.</p>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Class</th>
                        <th>Predicted Marks</th>
                        <th>Trend</th>
                        <th>Risk Level</th>
                        <th>Predicted Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weakStudents.map((studentAnalysis, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <strong>{studentAnalysis.student.firstName} {studentAnalysis.student.lastName}</strong>
                              <br />
                              <small className="text-muted">Roll: {studentAnalysis.student.rollNumber}</small>
                            </div>
                          </td>
                          <td>{studentAnalysis.student.class}-{studentAnalysis.student.section}</td>
                          <td>
                            <span className={`badge ${
                              (studentAnalysis.performanceData?.averagePercentage || studentAnalysis.prediction?.predictedMarks || 0) < 40 ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {studentAnalysis.performanceData?.averagePercentage !== undefined && studentAnalysis.performanceData?.averagePercentage !== null ? 
                                studentAnalysis.performanceData.averagePercentage.toFixed(1) : 
                                studentAnalysis.prediction?.predictedMarks !== undefined && studentAnalysis.prediction?.predictedMarks !== null ? 
                                studentAnalysis.prediction.predictedMarks.toFixed(1) : 'N/A'}%
                            </span>
                            <br />
                            <small className="text-muted">
                              {studentAnalysis.performanceData?.averagePercentage ? 'Current Avg' : 'Predicted'}
                            </small>
                          </td>
                          <td>
                            <span title={studentAnalysis.performanceData?.trend || 'stable'}>
                              {getTrendIcon(studentAnalysis.performanceData?.trend || 'stable')}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getRiskBadgeClass(studentAnalysis.prediction?.riskLevel || 'medium')}`}>
                              {studentAnalysis.prediction?.riskLevel || 'medium'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getGradeBadgeClass(studentAnalysis.prediction?.predictedGrade || 'C')}`}>
                              {studentAnalysis.prediction?.predictedGrade || 'C'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => viewStudentPrediction(studentAnalysis.student)}
                            >
                              View Details
                            </button>
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
      )}

      {/* Student Prediction Modal */}
      {selectedStudent && studentPrediction && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  🎯 AI Prediction for {selectedStudent.firstName} {selectedStudent.lastName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentPrediction(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {studentPrediction.success ? (
                  <div>
                    {/* Formula Display */}
                    <div className="alert alert-info mb-4">
                      <h6 className="mb-2">📊 Prediction Formula:</h6>
                      <code>Predicted Marks = (0.7 × Average Past Marks) + (0.3 × Attendance %)</code>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h4 className={`text-${aiPredictionService.getRiskLevelColor(studentPrediction.prediction.riskLevel)}`}>
                              {studentPrediction.prediction.riskLevel.toUpperCase()} RISK
                            </h4>
                            <p className="mb-0">Risk Level</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h4 className={`text-${aiPredictionService.getGradeColor(studentPrediction.prediction.predictedGrade)}`}>
                              {studentPrediction.prediction.predictedGrade}
                            </h4>
                            <p className="mb-0">Predicted Grade</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prediction Results */}
                    <div className="row mb-4">
                      <div className="col-md-4">
                        <div className="text-center">
                          <h5 className="text-primary">{studentPrediction.prediction.predictedMarks}%</h5>
                          <small className="text-muted">Predicted Marks</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center">
                          <h5 className="text-info">{studentPrediction.prediction.confidence}%</h5>
                          <small className="text-muted">Confidence Level</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center">
                          <h5 className="text-success">{studentPrediction.dataUsed.numberOfExams}</h5>
                          <small className="text-muted">Exams Analyzed</small>
                        </div>
                      </div>
                    </div>

                    {/* Data Used in Calculation */}
                    <div className="card mb-4">
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0">📈 Data Used in Calculation</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="text-center p-3 border rounded">
                              <h5 className="text-primary">
                                {studentPrediction.dataUsed.averagePastMarks !== null ? 
                                  `${studentPrediction.dataUsed.averagePastMarks}%` : 
                                  'No Data'}
                              </h5>
                              <small>Average Past Marks</small>
                              <br />
                              <small className="text-muted">(Weight: 70%)</small>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="text-center p-3 border rounded">
                              <h5 className="text-success">{studentPrediction.dataUsed.attendancePercentage}%</h5>
                              <small>Attendance Percentage</small>
                              <br />
                              <small className="text-muted">(Weight: 30%)</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="card mb-4">
                      <div className="card-header bg-success text-white">
                        <h6 className="mb-0">🧮 Calculation Breakdown</h6>
                      </div>
                      <div className="card-body">
                        <div className="row text-center">
                          <div className="col-md-4">
                            <div className="p-2">
                              <h6 className="text-primary">{studentPrediction.calculationBreakdown.pastMarksContribution}</h6>
                              <small>Past Marks Contribution</small>
                              <br />
                              <small className="text-muted">0.7 × {studentPrediction.dataUsed.averagePastMarks !== null ? 
                                `${studentPrediction.dataUsed.averagePastMarks}%` : 
                                'No Data'}</small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-2">
                              <h6 className="text-success">{studentPrediction.calculationBreakdown.attendanceContribution}</h6>
                              <small>Attendance Contribution</small>
                              <br />
                              <small className="text-muted">0.3 × {studentPrediction.dataUsed.attendancePercentage}%</small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-2 bg-light rounded">
                              <h6 className="text-dark">{studentPrediction.calculationBreakdown.totalPrediction}%</h6>
                              <small><strong>Final Prediction</strong></small>
                              <br />
                              <small className="text-muted">Sum of both contributions</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {studentPrediction.prediction.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h6>📋 Recommendations:</h6>
                        <ul className="list-group">
                          {studentPrediction.prediction.recommendations.map((rec, index) => (
                            <li key={index} className="list-group-item">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-muted">
                      <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                      <p>{studentPrediction.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentPrediction(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionDashboard;