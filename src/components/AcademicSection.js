import React, { useState, useEffect } from 'react';

const AcademicSection = ({ profile, currentUser, editing, editData, setEditData }) => {
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-25');
  
  const canView = ['admin', 'teacher', 'student', 'parent'].includes(currentUser.role);
  const canEdit = ['admin', 'teacher'].includes(currentUser.role);

  if (!canView || !profile.academic) return null;

  // Fetch student results
  useEffect(() => {
    if (profile._id) {
      fetchStudentResults();
    }
  }, [profile._id, selectedAcademicYear]);

  const fetchStudentResults = async () => {
    try {
      setLoadingResults(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/results/student/${profile._id}?academicYear=${selectedAcademicYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const calculateGPA = () => {
    if (results.length === 0) return 0;
    
    const gradePoints = {
      'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0
    };
    
    let totalPoints = 0;
    let totalSubjects = 0;
    
    results.forEach(result => {
      result.subjects.forEach(subject => {
        totalPoints += gradePoints[subject.grade] || 0;
        totalSubjects++;
      });
    });
    
    return totalSubjects > 0 ? (totalPoints / totalSubjects).toFixed(2) : 0;
  };

  const getOverallPerformance = () => {
    if (results.length === 0) return { average: 0, status: 'No data' };
    
    const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
    const average = (totalPercentage / results.length).toFixed(2);
    
    let status = 'Excellent';
    if (average < 90) status = 'Very Good';
    if (average < 80) status = 'Good';
    if (average < 70) status = 'Average';
    if (average < 60) status = 'Below Average';
    if (average < 40) status = 'Poor';
    
    return { average, status };
  };

  const renderResultsSection = () => {
    const performance = getOverallPerformance();
    const gpa = calculateGPA();
    
    return (
      <div className="results-section">
        <div className="results-header">
          <h4>Academic Results & Performance</h4>
          <div className="academic-year-selector">
            <label>Academic Year:</label>
            <select 
              value={selectedAcademicYear} 
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>
        </div>

        <div className="performance-summary">
          <div className="performance-card">
            <h5>Overall Average</h5>
            <div className="performance-value">{performance.average}%</div>
            <div className="performance-status">{performance.status}</div>
          </div>
          <div className="performance-card">
            <h5>GPA</h5>
            <div className="performance-value">{gpa}</div>
            <div className="performance-status">Out of 10</div>
          </div>
          <div className="performance-card">
            <h5>Exams Taken</h5>
            <div className="performance-value">{results.length}</div>
            <div className="performance-status">This Year</div>
          </div>
        </div>

        {loadingResults ? (
          <div className="loading-results">Loading results...</div>
        ) : results.length > 0 ? (
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className="result-card">
                <div className="result-header">
                  <h5>{result.examName}</h5>
                  <div className="result-meta">
                    <span className="exam-type">{result.examType.replace('_', ' ').toUpperCase()}</span>
                    <span className={`result-status ${result.result}`}>{result.result.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="result-summary">
                  <div className="summary-item">
                    <label>Total Marks:</label>
                    <span>{result.totalObtainedMarks}/{result.totalMaxMarks}</span>
                  </div>
                  <div className="summary-item">
                    <label>Percentage:</label>
                    <span className="percentage">{result.percentage}%</span>
                  </div>
                  <div className="summary-item">
                    <label>Grade:</label>
                    <span className={`grade grade-${result.overallGrade.replace('+', 'plus')}`}>
                      {result.overallGrade}
                    </span>
                  </div>
                  <div className="summary-item">
                    <label>Attendance:</label>
                    <span>{result.attendance}%</span>
                  </div>
                </div>

                <div className="subjects-breakdown">
                  <h6>Subject-wise Performance</h6>
                  <div className="subjects-grid">
                    {result.subjects.map((subject, subIndex) => (
                      <div key={subIndex} className="subject-item">
                        <div className="subject-name">{subject.subjectName}</div>
                        <div className="subject-marks">
                          {subject.obtainedMarks}/{subject.maxMarks}
                        </div>
                        <div className={`subject-grade grade-${subject.grade.replace('+', 'plus')}`}>
                          {subject.grade}
                        </div>
                        <div className="subject-percentage">
                          {((subject.obtainedMarks / subject.maxMarks) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {result.remarks && (
                  <div className="result-remarks">
                    <label>Remarks:</label>
                    <p>{result.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No academic results found for {selectedAcademicYear}</p>
          </div>
        )}
      </div>
    );
  };

  const handleAcademicChange = (field, value) => {
    setEditData({
      ...editData,
      academic: {
        ...editData.academic,
        [field]: value
      }
    });
  };

  const handleHistoryChange = (index, field, value) => {
    const newHistory = [...(editData.academic?.academicHistory || [])];
    newHistory[index] = {
      ...newHistory[index],
      [field]: value
    };
    setEditData({
      ...editData,
      academic: {
        ...editData.academic,
        academicHistory: newHistory
      }
    });
  };

  const addAcademicRecord = () => {
    const newHistory = [...(editData.academic?.academicHistory || [])];
    newHistory.push({
      grade: '',
      year: '',
      percentage: 0,
      subjects: []
    });
    setEditData({
      ...editData,
      academic: {
        ...editData.academic,
        academicHistory: newHistory
      }
    });
  };

  return (
    <div className="profile-section academic-section">
      <h3>Academic Information</h3>
      
      <div className="profile-grid">
        <div className="profile-field">
          <label>Current Grade:</label>
          {editing && canEdit ? (
            <select
              value={editData.academic?.currentGrade || ''}
              onChange={(e) => handleAcademicChange('currentGrade', e.target.value)}
            >
              <option value="">Select Grade</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          ) : (
            <span>{profile.academic.currentGrade || 'Not assigned'}</span>
          )}
        </div>
        
        <div className="profile-field">
          <label>Section:</label>
          {editing && canEdit ? (
            <select
              value={editData.academic?.section || ''}
              onChange={(e) => handleAcademicChange('section', e.target.value)}
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          ) : (
            <span>{profile.academic.section || 'Not assigned'}</span>
          )}
        </div>
        
        <div className="profile-field">
          <label>Roll Number:</label>
          <span>{profile.academic.rollNumber}</span>
        </div>
        
        <div className="profile-field">
          <label>Admission Date:</label>
          <span>
            {profile.academic.admissionDate 
              ? new Date(profile.academic.admissionDate).toLocaleDateString()
              : 'Not specified'}
          </span>
        </div>
        
        <div className="profile-field full-width">
          <label>Previous School:</label>
          {editing && canEdit ? (
            <input
              type="text"
              value={editData.academic?.previousSchool || ''}
              onChange={(e) => handleAcademicChange('previousSchool', e.target.value)}
            />
          ) : (
            <span>{profile.academic.previousSchool || 'Not specified'}</span>
          )}
        </div>
      </div>

      {/* Real Academic Results Section */}
      {renderResultsSection()}

      {/* Legacy Academic History Section */}
      {profile.academic.academicHistory && profile.academic.academicHistory.length > 0 && (
        <div className="academic-history">
          <h4>Academic History (Legacy)</h4>
          {profile.academic.academicHistory.map((record, index) => (
            <div key={index} className="history-record">
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Grade:</label>
                  {editing && canEdit ? (
                    <input
                      type="text"
                      value={editData.academic?.academicHistory?.[index]?.grade || ''}
                      onChange={(e) => handleHistoryChange(index, 'grade', e.target.value)}
                    />
                  ) : (
                    <span>{record.grade}</span>
                  )}
                </div>
                <div className="profile-field">
                  <label>Year:</label>
                  {editing && canEdit ? (
                    <input
                      type="text"
                      value={editData.academic?.academicHistory?.[index]?.year || ''}
                      onChange={(e) => handleHistoryChange(index, 'year', e.target.value)}
                    />
                  ) : (
                    <span>{record.year}</span>
                  )}
                </div>
                <div className="profile-field">
                  <label>Percentage:</label>
                  {editing && canEdit ? (
                    <input
                      type="number"
                      value={editData.academic?.academicHistory?.[index]?.percentage || ''}
                      onChange={(e) => handleHistoryChange(index, 'percentage', parseFloat(e.target.value))}
                    />
                  ) : (
                    <span>{record.percentage}%</span>
                  )}
                </div>
              </div>
              {record.subjects && record.subjects.length > 0 && (
                <div className="subjects-list">
                  <label>Subjects:</label>
                  <ul>
                    {record.subjects.map((subject, subIndex) => (
                      <li key={subIndex}>
                        {subject.name}: {subject.marks} ({subject.grade})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {editing && canEdit && (
            <button onClick={addAcademicRecord} className="btn-add">
              Add Academic Record
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicSection;