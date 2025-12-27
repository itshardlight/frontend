import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultsManagement = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    examType: '',
    academicYear: '2024-25'
  });
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for creating results
  const [resultForm, setResultForm] = useState({
    examName: '',
    subjects: [
      { subjectName: 'Mathematics', subjectCode: 'MATH', maxMarks: 100, obtainedMarks: '', remarks: '' },
      { subjectName: 'Science', subjectCode: 'SCI', maxMarks: 100, obtainedMarks: '', remarks: '' },
      { subjectName: 'English', subjectCode: 'ENG', maxMarks: 100, obtainedMarks: '', remarks: '' }
    ],
    remarks: '',
    attendance: 100
  });

  const examTypes = [
    { value: 'unit_test_1', label: 'Unit Test 1' },
    { value: 'unit_test_2', label: 'Unit Test 2' },
    { value: 'mid_term', label: 'Mid Term' },
    { value: 'final_term', label: 'Final Term' },
    { value: 'annual', label: 'Annual' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half Yearly' }
  ];

  const classes = ['9', '10', '11', '12'];
  const sections = ['A', 'B', 'C'];

  // Calculate totals and grades
  const calculateTotals = () => {
    const totalMaxMarks = resultForm.subjects.reduce((sum, subject) => sum + (parseInt(subject.maxMarks) || 0), 0);
    const totalObtainedMarks = resultForm.subjects.reduce((sum, subject) => sum + (parseInt(subject.obtainedMarks) || 0), 0);
    const percentage = totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 100 * 100) / 100 : 0;
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C+';
    else if (percentage >= 40) grade = 'C';
    else if (percentage >= 33) grade = 'D';

    return { totalMaxMarks, totalObtainedMarks, percentage, grade };
  };

  // Fetch students for bulk entry
  const fetchStudentsForBulkEntry = async () => {
    if (!filters.class || !filters.section || !filters.examType || !filters.academicYear) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/results/bulk-entry/${filters.class}/${filters.section}?examType=${filters.examType}&academicYear=${filters.academicYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || 'Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch results for viewing
  const fetchResults = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
      if (filters.examType) params.append('examType', filters.examType);
      if (filters.academicYear) params.append('academicYear', filters.academicYear);

      const response = await axios.get(
        `http://localhost:5000/api/results?${params.toString()}`,
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
    setSelectedStudent(null);
  };

  // Handle subject changes
  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...resultForm.subjects];
    updatedSubjects[index][field] = value;
    setResultForm(prev => ({ ...prev, subjects: updatedSubjects }));
  };

  // Add new subject
  const addSubject = () => {
    setResultForm(prev => ({
      ...prev,
      subjects: [...prev.subjects, { subjectName: '', subjectCode: '', maxMarks: 100, obtainedMarks: '', remarks: '' }]
    }));
  };

  // Remove subject
  const removeSubject = (index) => {
    if (resultForm.subjects.length > 1) {
      const updatedSubjects = resultForm.subjects.filter((_, i) => i !== index);
      setResultForm(prev => ({ ...prev, subjects: updatedSubjects }));
    }
  };

  // Submit result
  const handleSubmitResult = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    if (!resultForm.examName.trim()) {
      setError('Please enter exam name');
      return;
    }

    // Validate subjects
    const invalidSubjects = resultForm.subjects.filter(subject => 
      !subject.subjectName.trim() || 
      !subject.subjectCode.trim() || 
      subject.obtainedMarks === '' || 
      parseInt(subject.obtainedMarks) > parseInt(subject.maxMarks)
    );

    if (invalidSubjects.length > 0) {
      setError('Please fill all subject details correctly. Obtained marks cannot exceed maximum marks.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const resultData = {
        studentId: selectedStudent._id,
        examType: filters.examType,
        examName: resultForm.examName,
        academicYear: filters.academicYear,
        subjects: resultForm.subjects.map(subject => ({
          ...subject,
          maxMarks: parseInt(subject.maxMarks),
          obtainedMarks: parseInt(subject.obtainedMarks)
        })),
        remarks: resultForm.remarks,
        attendance: parseInt(resultForm.attendance)
      };
      
      console.log('Sending result data:', resultData);
      
      const response = await axios.post('http://localhost:5000/api/results', resultData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Result created successfully!');
      setSelectedStudent(null);
      setResultForm({
        examName: '',
        subjects: [
          { subjectName: 'Mathematics', subjectCode: 'MATH', maxMarks: 100, obtainedMarks: '', remarks: '' },
          { subjectName: 'Science', subjectCode: 'SCI', maxMarks: 100, obtainedMarks: '', remarks: '' },
          { subjectName: 'English', subjectCode: 'ENG', maxMarks: 100, obtainedMarks: '', remarks: '' }
        ],
        remarks: '',
        attendance: 100
      });
      
      // Refresh students list
      fetchStudentsForBulkEntry();
    } catch (error) {
      console.error('Error creating result:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || 'Error creating result');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    if (activeTab === 'create') {
      fetchStudentsForBulkEntry();
    } else if (activeTab === 'view') {
      fetchResults();
    }
  }, [filters, activeTab]);

  const totals = calculateTotals();

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-journal-text me-2"></i>
                Results Management
              </h4>
            </div>
            <div className="card-body">
              {/* Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Results
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
                    onClick={() => setActiveTab('view')}
                  >
                    <i className="bi bi-table me-2"></i>
                    View Results
                  </button>
                </li>
              </ul>

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <label className="form-label">Class</label>
                  <select 
                    className="form-select"
                    value={filters.class}
                    onChange={(e) => handleFilterChange('class', e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Section</label>
                  <select 
                    className="form-select"
                    value={filters.section}
                    onChange={(e) => handleFilterChange('section', e.target.value)}
                  >
                    <option value="">Select Section</option>
                    {sections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Exam Type</label>
                  <select 
                    className="form-select"
                    value={filters.examType}
                    onChange={(e) => handleFilterChange('examType', e.target.value)}
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map(exam => (
                      <option key={exam.value} value={exam.value}>{exam.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
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
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
              )}

              {/* Create Results Tab */}
              {activeTab === 'create' && (
                <div>
                  {!selectedStudent ? (
                    <div>
                      <h5 className="mb-3">Select Student</h5>
                      {loading ? (
                        <div className="text-center">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="row">
                          {students.map(student => (
                            <div key={student._id} className="col-md-4 col-lg-3 mb-3">
                              <div 
                                className={`card h-100 ${student.hasResult ? 'border-secondary' : 'border-primary'} ${!student.hasResult ? 'cursor-pointer' : ''}`}
                                style={{ cursor: student.hasResult ? 'not-allowed' : 'pointer' }}
                                onClick={() => !student.hasResult && setSelectedStudent(student)}
                              >
                                <div className="card-body text-center">
                                  <i className={`bi ${student.hasResult ? 'bi-check-circle-fill text-success' : 'bi-person-circle'} mb-2`} style={{ fontSize: '2rem' }}></i>
                                  <h6 className="card-title">{student.firstName} {student.lastName}</h6>
                                  <p className="card-text small text-muted">
                                    Roll: {student.rollNumber}<br/>
                                    Class: {student.class}-{student.section}
                                  </p>
                                  {student.hasResult && (
                                    <span className="badge bg-success">Result Exists</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Create Result for {selectedStudent.firstName} {selectedStudent.lastName}</h5>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedStudent(null)}
                        >
                          <i className="bi bi-arrow-left me-1"></i>
                          Back to Students
                        </button>
                      </div>

                      <form onSubmit={handleSubmitResult}>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label">Exam Name</label>
                            <input 
                              type="text"
                              className="form-control"
                              value={resultForm.examName}
                              onChange={(e) => setResultForm(prev => ({ ...prev, examName: e.target.value }))}
                              placeholder="e.g., Mid Term Examination 2024"
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Attendance (%)</label>
                            <input 
                              type="number"
                              className="form-control"
                              value={resultForm.attendance}
                              onChange={(e) => setResultForm(prev => ({ ...prev, attendance: e.target.value }))}
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>

                        <h6 className="mb-3">Subjects</h6>
                        {resultForm.subjects.map((subject, index) => (
                          <div key={index} className="card mb-3">
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-3">
                                  <label className="form-label">Subject Name</label>
                                  <input 
                                    type="text"
                                    className="form-control"
                                    value={subject.subjectName}
                                    onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label className="form-label">Subject Code</label>
                                  <input 
                                    type="text"
                                    className="form-control"
                                    value={subject.subjectCode}
                                    onChange={(e) => handleSubjectChange(index, 'subjectCode', e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label className="form-label">Max Marks</label>
                                  <input 
                                    type="number"
                                    className="form-control"
                                    value={subject.maxMarks}
                                    onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                                    min="1"
                                    required
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label className="form-label">Obtained Marks</label>
                                  <input 
                                    type="number"
                                    className="form-control"
                                    value={subject.obtainedMarks}
                                    onChange={(e) => handleSubjectChange(index, 'obtainedMarks', e.target.value)}
                                    min="0"
                                    max={subject.maxMarks}
                                    required
                                  />
                                </div>
                                <div className="col-md-2">
                                  <label className="form-label">Remarks</label>
                                  <input 
                                    type="text"
                                    className="form-control"
                                    value={subject.remarks}
                                    onChange={(e) => handleSubjectChange(index, 'remarks', e.target.value)}
                                    placeholder="Optional"
                                  />
                                </div>
                                <div className="col-md-1 d-flex align-items-end">
                                  {resultForm.subjects.length > 1 && (
                                    <button 
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => removeSubject(index)}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button 
                          type="button"
                          className="btn btn-outline-primary btn-sm mb-3"
                          onClick={addSubject}
                        >
                          <i className="bi bi-plus me-1"></i>
                          Add Subject
                        </button>

                        <div className="row mb-3">
                          <div className="col-md-12">
                            <label className="form-label">Overall Remarks</label>
                            <textarea 
                              className="form-control"
                              rows="3"
                              value={resultForm.remarks}
                              onChange={(e) => setResultForm(prev => ({ ...prev, remarks: e.target.value }))}
                              placeholder="Optional overall remarks"
                            />
                          </div>
                        </div>

                        {/* Totals Display */}
                        <div className="card bg-light mb-3">
                          <div className="card-body">
                            <h6>Result Summary</h6>
                            <div className="row">
                              <div className="col-md-3">
                                <strong>Total Max Marks:</strong> {totals.totalMaxMarks}
                              </div>
                              <div className="col-md-3">
                                <strong>Total Obtained:</strong> {totals.totalObtainedMarks}
                              </div>
                              <div className="col-md-3">
                                <strong>Percentage:</strong> {totals.percentage}%
                              </div>
                              <div className="col-md-3">
                                <strong>Grade:</strong> <span className={`badge ${totals.grade === 'F' ? 'bg-danger' : 'bg-success'}`}>{totals.grade}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button 
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Creating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-2"></i>
                                Create Result
                              </>
                            )}
                          </button>
                          <button 
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setSelectedStudent(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* View Results Tab */}
              {activeTab === 'view' && (
                <div>
                  <h5 className="mb-3">Results Overview</h5>
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Student</th>
                            <th>Roll No.</th>
                            <th>Class</th>
                            <th>Exam</th>
                            <th>Total Marks</th>
                            <th>Percentage</th>
                            <th>Grade</th>
                            <th>Result</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map(result => (
                            <tr key={result._id}>
                              <td>{result.studentId?.firstName} {result.studentId?.lastName}</td>
                              <td>{result.rollNumber}</td>
                              <td>{result.class}-{result.section}</td>
                              <td>{result.examName}</td>
                              <td>{result.totalObtainedMarks}/{result.totalMaxMarks}</td>
                              <td>{result.percentage}%</td>
                              <td>
                                <span className={`badge ${result.overallGrade === 'F' ? 'bg-danger' : 'bg-success'}`}>
                                  {result.overallGrade}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${result.result === 'pass' ? 'bg-success' : 'bg-danger'}`}>
                                  {result.result.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  result.status === 'draft' ? 'bg-secondary' :
                                  result.status === 'published' ? 'bg-primary' :
                                  result.status === 'verified' ? 'bg-success' : 'bg-warning'
                                }`}>
                                  {result.status.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button className="btn btn-outline-primary btn-sm" title="View Details">
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  {result.status === 'draft' && (
                                    <button className="btn btn-outline-warning btn-sm" title="Edit">
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {results.length === 0 && (
                        <div className="text-center py-4">
                          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                          <p className="text-muted mt-2">No results found for the selected filters.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsManagement;