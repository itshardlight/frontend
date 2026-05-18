import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AIPredictions = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [analysisDebug, setAnalysisDebug] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Available classes and sections
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        navigate("/dashboard");
        return;
      }
      setUser(parsedUser);
      fetchAvailableClasses();
    }
  }, [navigate]);

  const fetchAvailableClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/ai-predictions/available-classes',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setAvailableClasses(response.data.data.combinations);
      }
    } catch (err) {
      console.error('Error fetching available classes:', err);
    }
  };

  const fixResultsStatus = async () => {
    if (!selectedClass || !selectedSection) {
      setError('Please select class and section first');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/ai-predictions/fix-results-status',
        { class: selectedClass, section: selectedSection },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert(`✅ ${response.data.data.message}`);
        // Re-analyze the class after fixing
        analyzeClass();
      } else {
        setError(response.data.message || 'Failed to fix results status');
      }
    } catch (err) {
      console.error('Error fixing results:', err);
      setError(err.response?.data?.message || 'Failed to fix results status');
    } finally {
      setLoading(false);
    }
  };

  const checkAllStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Check all students without class/section filter
      const response = await axios.get(
        `http://localhost:5000/api/ai-predictions/analyze-class`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('All students response:', response.data);
      
      if (response.data.success) {
        const analysisData = response.data.data;
        
        if (analysisData.totalStudents === 0) {
          setError('No students found in the database. Please add students first.');
        } else {
          setError(`Found ${analysisData.totalStudents} total students in database. Try selecting a specific class and section.`);
        }
      }
    } catch (err) {
      console.error('Error checking all students:', err);
      setError('Failed to check students in database');
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
      
      const token = localStorage.getItem('token');
      
      // First, let's check if there are any students at all
      console.log(`Analyzing class ${selectedClass}-${selectedSection}`);
      
      const response = await axios.get(
        `http://localhost:5000/api/ai-predictions/analyze-class?class=${selectedClass}&section=${selectedSection}&includeFailures=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const analysisData = response.data.data;
        console.log('Analysis data:', analysisData);
        
        // Get all students from the analysis
        const allStudents = [
          ...analysisData.weakStudents,
          ...analysisData.atRiskStudents,
          ...analysisData.averagePerformers,
          ...analysisData.strongPerformers
        ];
        
        console.log('All students found:', allStudents.length);
        console.log('Summary:', analysisData.summary);
        
        if (allStudents.length === 0 && analysisData.totalStudents === 0) {
          setError(`No students found in Class ${selectedClass}-${selectedSection}. Please check if students are registered for this class.`);
        } else if (allStudents.length === 0 && analysisData.totalStudents > 0) {
          // Show detailed breakdown of why students couldn't be analyzed
          const summary = analysisData.summary;
          let errorMsg = `Found ${analysisData.totalStudents} students in Class ${selectedClass}-${selectedSection}, but none could be analyzed.\n\n`;
          
          if (summary.noData > 0) {
            errorMsg += `• ${summary.noData} students lack sufficient exam data for prediction\n`;
          }
          
          errorMsg += `\nPossible reasons:\n`;
          errorMsg += `• Students need at least 3 exam results for accurate predictions\n`;
          errorMsg += `• Exam results must be in 'published', 'verified', or 'locked' status\n`;
          errorMsg += `• Check if exam results exist for this class`;
          
          setError(errorMsg);
        } else {
          // Success - show results
          setPredictions(allStudents);
          setAnalysisDebug(analysisData);
          
          // Show success message with summary
          const summary = analysisData.summary;
          let successMsg = `Successfully analyzed ${allStudents.length} out of ${analysisData.totalStudents} students in Class ${selectedClass}-${selectedSection}`;
          
          if (summary.noData > 0) {
            successMsg += `\n\nNote: ${summary.noData} students could not be analyzed due to insufficient exam data.`;
          }
          
          console.log(successMsg);
        }
      } else {
        setError(response.data.message || 'Failed to analyze class');
      }
    } catch (err) {
      console.error('Error analyzing class:', err);
      let errorMessage = 'Failed to analyze class';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceBadge = (prediction) => {
    if (prediction === 'good') {
      return <span className="badge bg-success">✅ Good</span>;
    } else {
      return <span className="badge bg-danger">⚠️ Bad</span>;
    }
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 80) {
      return <span className="badge bg-primary">{confidence}%</span>;
    } else if (confidence >= 60) {
      return <span className="badge bg-warning">{confidence}%</span>;
    } else {
      return <span className="badge bg-secondary">{confidence}%</span>;
    }
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
      { icon: 'bi-gear', label: 'Admin Panel', path: '/admin/panel' },
      { icon: 'bi-person-plus', label: 'Add Student', path: '/admin/student-registration' },
      { icon: 'bi-journal-text', label: 'Results', path: '/admin/results' },
      { icon: 'bi-calendar-week', label: 'Timetable', path: '/admin/timetable' },
      { icon: 'bi-robot', label: 'AI Predictions', path: '/admin/ai-predictions' }
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
            <h1 className="header-title">🤖 AI Predictions</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-role badge badge-admin">ADMIN</span>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="dashboard-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* Class Selection */}
          <div className="card shadow-sm mb-4" style={{ borderRadius: '15px', border: 'none' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%)', borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0 text-white">
                <i className="bi bi-search me-2"></i>
                Random Forest Classification
              </h5>
            </div>
            <div className="card-body" style={{ padding: '25px' }}>
              <p className="text-muted mb-4">
                Select a class to see Random Forest predictions for next exam performance
              </p>
              
              {availableClasses.length > 0 && (
                <div className="alert alert-info mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Available Classes:</strong> {availableClasses.map(c => `${c.class}-${c.section} (${c.studentCount} students)`).join(', ')}
                </div>
              )}
              
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Class</label>
                  <select 
                    className="form-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Section</label>
                  <select 
                    className="form-select"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="">Select Section</option>
                    {sections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button 
                    className="btn btn-primary w-100 me-2"
                    onClick={analyzeClass}
                    disabled={loading || !selectedClass || !selectedSection}
                    style={{ 
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cpu me-2"></i>
                        Run Prediction
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={checkAllStudents}
                    disabled={loading}
                    style={{ borderRadius: '10px' }}
                    title="Check all students in database"
                  >
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {predictions.length > 0 && (
            <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
              <div className="card-header" style={{ background: 'white', borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e5e7eb' }}>
                <h5 className="mb-0" style={{ color: '#1E3A8A', fontWeight: '600' }}>
                  <i className="bi bi-graph-up me-2"></i>
                  Classification Results - Class {selectedClass}-{selectedSection}
                </h5>
              </div>
              <div className="card-body" style={{ padding: '25px' }}>
                {/* Analysis Summary */}
                {analysisDebug && (
                  <div className="alert alert-info mb-4">
                    <h6 className="alert-heading">
                      <i className="bi bi-info-circle me-2"></i>
                      Analysis Summary
                    </h6>
                    <div className="row">
                      <div className="col-md-3">
                        <strong>Total Students:</strong> {analysisDebug.totalStudents}
                      </div>
                      <div className="col-md-3">
                        <strong>Analyzed:</strong> {analysisDebug.analyzedStudents}
                      </div>
                      <div className="col-md-3">
                        <strong>No Data:</strong> {analysisDebug.summary?.noData || 0}
                      </div>
                      <div className="col-md-3">
                        <strong>Success Rate:</strong> {analysisDebug.totalStudents > 0 ? Math.round((analysisDebug.analyzedStudents / analysisDebug.totalStudents) * 100) : 0}%
                      </div>
                    </div>
                    {analysisDebug.summary?.noData > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {analysisDebug.summary.noData} students could not be analyzed due to insufficient exam data (need at least 3 published results)
                        </small>
                        <button 
                          className="btn btn-link btn-sm p-0 ms-2"
                          onClick={() => setShowDebugInfo(!showDebugInfo)}
                        >
                          {showDebugInfo ? 'Hide Details' : 'Show Details'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Debug Information */}
                {showDebugInfo && analysisDebug && (
                  <div className="card bg-light mb-4">
                    <div className="card-header bg-secondary text-white">
                      <h6 className="mb-0">
                        <i className="bi bi-bug me-2"></i>
                        Debug Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6>Risk Distribution:</h6>
                          <ul className="list-unstyled">
                            <li><span className="badge bg-danger me-2">{analysisDebug.summary?.highRisk || 0}</span>High Risk</li>
                            <li><span className="badge bg-warning me-2">{analysisDebug.summary?.mediumRisk || 0}</span>Medium Risk</li>
                            <li><span className="badge bg-success me-2">{analysisDebug.summary?.lowRisk || 0}</span>Low Risk</li>
                            <li><span className="badge bg-secondary me-2">{analysisDebug.summary?.noData || 0}</span>No Data</li>
                          </ul>
                        </div>
                        <div className="col-md-6">
                          <h6>Category Breakdown:</h6>
                          <ul className="list-unstyled">
                            <li><span className="badge bg-danger me-2">{analysisDebug.weakStudents?.length || 0}</span>Weak Students</li>
                            <li><span className="badge bg-warning me-2">{analysisDebug.atRiskStudents?.length || 0}</span>At Risk Students</li>
                            <li><span className="badge bg-info me-2">{analysisDebug.averagePerformers?.length || 0}</span>Average Performers</li>
                            <li><span className="badge bg-success me-2">{analysisDebug.strongPerformers?.length || 0}</span>Strong Performers</li>
                          </ul>
                        </div>
                      </div>
                      
                      {analysisDebug.summary?.noData > 0 && (
                        <div className="mt-3">
                          <h6 className="text-warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Students Not Analyzed ({analysisDebug.summary.noData})
                          </h6>
                          <div className="alert alert-warning">
                            <strong>Common reasons students can't be analyzed:</strong>
                            <ul className="mb-0 mt-2">
                              <li>Less than 3 published exam results</li>
                              <li>Exam results in 'draft' status (need 'published', 'verified', or 'locked')</li>
                              <li>Missing attendance data</li>
                              <li>Incomplete subject scores</li>
                            </ul>
                          </div>
                          
                          {analysisDebug.failureDetails && analysisDebug.failureDetails.length > 0 && (
                            <div className="mt-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6>Detailed Failure Analysis:</h6>
                                <button 
                                  className="btn btn-warning btn-sm"
                                  onClick={fixResultsStatus}
                                  disabled={loading}
                                >
                                  <i className="bi bi-wrench me-1"></i>
                                  Fix Draft Results
                                </button>
                              </div>
                              <div className="table-responsive">
                                <table className="table table-sm table-striped">
                                  <thead>
                                    <tr>
                                      <th>Student</th>
                                      <th>Roll Number</th>
                                      <th>Results Count</th>
                                      <th>Reason</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analysisDebug.failureDetails.map((failure, index) => (
                                      <tr key={index}>
                                        <td>{failure.student.name}</td>
                                        <td>{failure.student.rollNumber}</td>
                                        <td>
                                          <span className={`badge ${failure.resultCount >= 3 ? 'bg-success' : 'bg-danger'}`}>
                                            {failure.resultCount}
                                          </span>
                                        </td>
                                        <td>
                                          <small className="text-muted">{failure.reason}</small>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th style={{ fontWeight: '600' }}>Student</th>
                        <th style={{ fontWeight: '600' }}>Roll Number</th>
                        <th className="text-center" style={{ fontWeight: '600' }}>Next Exam Prediction</th>
                        <th className="text-center" style={{ fontWeight: '600' }}>Confidence</th>
                        <th className="text-center" style={{ fontWeight: '600' }}>Model Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((studentAnalysis, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <strong>{studentAnalysis.student.name}</strong>
                              <br />
                              <small className="text-muted">Class {studentAnalysis.student.class}-{studentAnalysis.student.section}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark" style={{ fontSize: '0.9rem' }}>
                              {studentAnalysis.student.rollNumber}
                            </span>
                          </td>
                          <td className="text-center">
                            {getPerformanceBadge(studentAnalysis.prediction.nextExamPerformance)}
                          </td>
                          <td className="text-center">
                            {getConfidenceBadge(studentAnalysis.prediction.confidence)}
                          </td>
                          <td className="text-center">
                            <small className="text-muted">
                              Random Forest
                              <br />
                              {studentAnalysis.randomForestDetails?.goodVotes || 0}G / {studentAnalysis.randomForestDetails?.badVotes || 0}B
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Summary */}
                <div className="mt-4 p-3" style={{ background: '#f8fafc', borderRadius: '10px' }}>
                  <div className="row text-center">
                    <div className="col-md-3">
                      <h4 className="text-primary">{predictions.length}</h4>
                      <small className="text-muted">Analyzed Students</small>
                    </div>
                    <div className="col-md-3">
                      <h4 className="text-success">
                        {predictions.filter(p => p.prediction.nextExamPerformance === 'good').length}
                      </h4>
                      <small className="text-muted">Good Predictions</small>
                    </div>
                    <div className="col-md-3">
                      <h4 className="text-danger">
                        {predictions.filter(p => p.prediction.nextExamPerformance === 'bad').length}
                      </h4>
                      <small className="text-muted">Bad Predictions</small>
                    </div>
                    <div className="col-md-3">
                      <h4 className="text-info">
                        {Math.round(predictions.reduce((sum, p) => sum + p.prediction.confidence, 0) / predictions.length)}%
                      </h4>
                      <small className="text-muted">Avg Confidence</small>
                    </div>
                  </div>
                  
                  {analysisDebug && analysisDebug.totalStudents > predictions.length && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="alert alert-warning mb-0">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <strong>Analysis Incomplete:</strong> {analysisDebug.totalStudents - predictions.length} out of {analysisDebug.totalStudents} students could not be analyzed.
                          {showDebugInfo ? '' : ' Click "Show Details" above for more information.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && predictions.length === 0 && selectedClass && selectedSection && (
            <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
              <div className="card-body text-center py-5">
                <i className="bi bi-info-circle" style={{ fontSize: '3rem', color: '#6B7280' }}></i>
                <h4 className="mt-3" style={{ color: '#374151' }}>No Students Found</h4>
                <p className="text-muted">No students found in Class {selectedClass}-{selectedSection}</p>
                {availableClasses.length > 0 && (
                  <div className="mt-3">
                    <p className="text-muted mb-2">Available classes:</p>
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                      {availableClasses.map((c, index) => (
                        <button
                          key={index}
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            setSelectedClass(c.class);
                            setSelectedSection(c.section);
                          }}
                        >
                          {c.class}-{c.section} ({c.studentCount} students)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <p>&copy; Student Management System - AI Predictions. All rights reserved.</p>
            <div className="footer-links">
              <small className="text-muted">Powered by Random Forest Classifier</small>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AIPredictions;