import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const ResultsManagement = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState('create');
  
  // Enhanced filters with more options
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    examType: '',
    academicYear: '2024-25',
    search: ''
  });
  
  // States for data management
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingResultId, setEditingResultId] = useState(null);
  
  // Form state for creating/editing results
  const [resultForm, setResultForm] = useState({
    examName: '',
    studentClass: '',
    studentSection: '',
    subjects: [
      { subjectName: 'Mathematics', subjectCode: 'MATH', maxMarks: 100, obtainedMarks: '', remarks: '' },
      { subjectName: 'Science', subjectCode: 'SCI', maxMarks: 100, obtainedMarks: '', remarks: '' },
      { subjectName: 'English', subjectCode: 'ENG', maxMarks: 100, obtainedMarks: '', remarks: '' }
    ],
    remarks: '',
    attendance: 100
  });

  // Constants for dropdowns
  const examTypes = [
    { value: '', label: 'All Exam Types' },
    { value: 'unit_test_1', label: 'Unit Test 1' },
    { value: 'unit_test_2', label: 'Unit Test 2' },
    { value: 'mid_term', label: 'Mid Term' },
    { value: 'final_term', label: 'Final Term' },
    { value: 'annual', label: 'Annual' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half Yearly' }
  ];

  const classes = ['', '9', '10', '11', '12'];
  const sections = ['', 'A', 'B', 'C'];

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

    const result = percentage >= 33 ? 'pass' : 'fail';

    return { totalMaxMarks, totalObtainedMarks, percentage, grade, result };
  };

  // Filter results based on all filter criteria
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesClass = !filters.class || result.studentClass === filters.class;
      const matchesSection = !filters.section || result.studentSection === filters.section;
      const matchesExamType = !filters.examType || result.examType === filters.examType;
      const matchesAcademicYear = !filters.academicYear || result.academicYear === filters.academicYear;
      const matchesSearch = !filters.search || 
        (result.studentId?.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         result.studentId?.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         result.rollNumber?.toString().includes(filters.search) ||
         result.examName?.toLowerCase().includes(filters.search.toLowerCase()));

      return matchesClass && matchesSection && matchesExamType && 
             matchesAcademicYear && matchesSearch;
    });
  }, [results, filters]);

  // Fetch students for bulk entry
  const fetchStudentsForBulkEntry = async () => {
    if (!filters.class || !filters.section) {
      setStudents([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/results/bulk-entry/${filters.class}/${filters.section}?academicYear=${filters.academicYear}`,
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

  // Fetch all results for viewing
  const fetchResults = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
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
    setIsEditing(false);
    setEditingResultId(null);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      class: '',
      section: '',
      examType: '',
      academicYear: '2024-25',
      search: ''
    });
  };

  // Handle subject changes
  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...resultForm.subjects];
    updatedSubjects[index][field] = value;
    
    // Auto-calculate percentage for marks
    if (field === 'obtainedMarks') {
      const maxMarks = parseInt(updatedSubjects[index].maxMarks) || 100;
      const obtained = parseInt(value) || 0;
      if (obtained > maxMarks) {
        updatedSubjects[index][field] = maxMarks.toString();
      }
    }
    
    setResultForm(prev => ({ ...prev, subjects: updatedSubjects }));
  };

  // Add new subject
  const addSubject = () => {
    setResultForm(prev => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        { subjectName: '', subjectCode: '', maxMarks: 100, obtainedMarks: '', remarks: '' }
      ]
    }));
  };

  // Remove subject
  const removeSubject = (index) => {
    if (resultForm.subjects.length > 1) {
      const updatedSubjects = resultForm.subjects.filter((_, i) => i !== index);
      setResultForm(prev => ({ ...prev, subjects: updatedSubjects }));
    }
  };

  // Load result for editing
  const loadResultForEditing = async (resultId) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/results/${resultId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = response.data.data;
      setResultForm({
        examName: result.examName,
        studentClass: result.studentClass,
        studentSection: result.studentSection,
        subjects: result.subjects.map(sub => ({
          subjectName: sub.subjectName,
          subjectCode: sub.subjectCode,
          maxMarks: sub.maxMarks,
          obtainedMarks: sub.obtainedMarks,
          remarks: sub.remarks || ''
        })),
        remarks: result.remarks || '',
        attendance: result.attendance || 100
      });

      setIsEditing(true);
      setEditingResultId(resultId);
      setActiveTab('create');
      setSelectedStudent(result.studentId);
      
      // Set filters based on the result being edited
      setFilters(prev => ({
        ...prev,
        class: result.studentClass,
        section: result.studentSection,
        examType: result.examType,
        academicYear: result.academicYear
      }));

      setSuccess('Result loaded for editing');
    } catch (error) {
      console.error('Error loading result:', error);
      setError(error.response?.data?.message || 'Error loading result for editing');
    } finally {
      setLoading(false);
    }
  };

  // Handle exam type change with auto-population
  const handleExamTypeChange = (value) => {
    setFilters(prev => ({ ...prev, examType: value }));
    
    // Auto-populate exam name if not already set
    if (value && !resultForm.examName.trim()) {
      const selectedExam = examTypes.find(exam => exam.value === value);
      if (selectedExam && selectedExam.label !== 'All Exam Types') {
        setResultForm(prev => ({ 
          ...prev, 
          examName: selectedExam.label 
        }));
      }
    }
  };

  // Submit result (create or update)
  const handleSubmitResult = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    if (!filters.examType) {
      setError('Please select exam type');
      return;
    }

    if (!resultForm.examName.trim()) {
      setError('Please enter exam name');
      return;
    }

    if (!resultForm.studentClass || !resultForm.studentSection) {
      setError('Please select the class and section the student is studying in');
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
      const totals = calculateTotals();

      const resultData = {
        studentId: selectedStudent._id,
        examType: filters.examType,
        examName: resultForm.examName,
        academicYear: filters.academicYear,
        studentClass: resultForm.studentClass,
        studentSection: resultForm.studentSection,
        subjects: resultForm.subjects.map(subject => ({
          ...subject,
          maxMarks: parseInt(subject.maxMarks),
          obtainedMarks: parseInt(subject.obtainedMarks)
        })),
        remarks: resultForm.remarks,
        attendance: parseInt(resultForm.attendance),
        totalMaxMarks: totals.totalMaxMarks,
        totalObtainedMarks: totals.totalObtainedMarks,
        percentage: totals.percentage,
        overallGrade: totals.grade,
        result: totals.result
      };

      let response;
      if (isEditing && editingResultId) {
        // Update existing result
        response = await axios.put(
          `http://localhost:5000/api/results/${editingResultId}`,
          resultData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Result updated successfully!');
      } else {
        // Create new result
        response = await axios.post(
          'http://localhost:5000/api/results',
          resultData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Result created successfully!');
      }

      // Reset form
      setSelectedStudent(null);
      setIsEditing(false);
      setEditingResultId(null);
      setResultForm({
        examName: '',
        studentClass: '',
        studentSection: '',
        subjects: [
          { subjectName: 'Mathematics', subjectCode: 'MATH', maxMarks: 100, obtainedMarks: '', remarks: '' },
          { subjectName: 'Science', subjectCode: 'SCI', maxMarks: 100, obtainedMarks: '', remarks: '' },
          { subjectName: 'English', subjectCode: 'ENG', maxMarks: 100, obtainedMarks: '', remarks: '' }
        ],
        remarks: '',
        attendance: 100
      });

      // Refresh data
      if (activeTab === 'create') {
        fetchStudentsForBulkEntry();
      } else {
        fetchResults();
      }
    } catch (error) {
      console.error('Error saving result:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || `Error ${isEditing ? 'updating' : 'creating'} result`);
    } finally {
      setLoading(false);
    }
  };

  // Delete result
  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/results/${resultId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Result deleted successfully!');
      fetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      setError(error.response?.data?.message || 'Error deleting result');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingResultId(null);
    setSelectedStudent(null);
    setResultForm({
      examName: '',
      studentClass: '',
      studentSection: '',
      subjects: [
        { subjectName: 'Mathematics', subjectCode: 'MATH', maxMarks: 100, obtainedMarks: '', remarks: '' },
        { subjectName: 'Science', subjectCode: 'SCI', maxMarks: 100, obtainedMarks: '', remarks: '' },
        { subjectName: 'English', subjectCode: 'ENG', maxMarks: 100, obtainedMarks: '', remarks: '' }
      ],
      remarks: '',
      attendance: 100
    });
  };

  // Preload student data when selected
  const preloadStudentData = (student) => {
    setSelectedStudent(student);
    
    // Preload class and section from student data
    if (student.class && student.section) {
      setResultForm(prev => ({
        ...prev,
        studentClass: student.class,
        studentSection: student.section
      }));
    }
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    if (activeTab === 'create') {
      fetchStudentsForBulkEntry();
    } else if (activeTab === 'view') {
      fetchResults();
    }
  }, [filters.class, filters.section, filters.academicYear, activeTab]);

  const totals = calculateTotals();

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-journal-text me-2"></i>
                Results Management
              </h4>
              {isEditing && (
                <span className="badge bg-warning">
                  <i className="bi bi-pencil me-1"></i>
                  Editing Mode
                </span>
              )}
            </div>
            
            <div className="card-body">
              {/* Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('create');
                      cancelEditing();
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    {isEditing ? 'Edit Result' : 'Create Results'}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
                    onClick={() => setActiveTab('view')}
                  >
                    <i className="bi bi-table me-2"></i>
                    View Results
                    {results.length > 0 && (
                      <span className="badge bg-secondary ms-2">{results.length}</span>
                    )}
                  </button>
                </li>
              </ul>

              {/* Enhanced Filters */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0">
                    <i className="bi bi-funnel me-2"></i>
                    Filters
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-2">
                      <label className="form-label">Class</label>
                      <select
                        className="form-select"
                        value={filters.class}
                        onChange={(e) => handleFilterChange('class', e.target.value)}
                      >
                        <option value="">All Classes</option>
                        {classes.filter(c => c !== '').map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Section</label>
                      <select
                        className="form-select"
                        value={filters.section}
                        onChange={(e) => handleFilterChange('section', e.target.value)}
                      >
                        <option value="">All Sections</option>
                        {sections.filter(s => s !== '').map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
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
                    <div className="col-md-2">
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
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={resetFilters}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  {activeTab === 'view' && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label className="form-label">Search</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name, roll number, or exam..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 d-flex align-items-end">
                        <div className="text-muted small">
                          Showing {filteredResults.length} of {results.length} results
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
              )}

              {/* Create/Edit Results Tab */}
              {activeTab === 'create' && (
                <div>
                  {!selectedStudent ? (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Select Student</h5>
                        <div className="text-muted small">
                          {students.filter(s => !s.hasResult).length} students without results
                        </div>
                      </div>
                      
                      {loading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : !filters.class || !filters.section ? (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Please select a class and section to view students
                        </div>
                      ) : (
                        <div className="row">
                          {students.map(student => (
                            <div key={student._id} className="col-md-4 col-lg-3 mb-3">
                              <div
                                className={`card h-100 ${student.hasResult ? 'border-warning' : 'border-primary'} hover-shadow transition-all`}
                                style={{ 
                                  cursor: student.hasResult ? 'default' : 'pointer',
                                  opacity: student.hasResult ? 0.8 : 1
                                }}
                                onClick={() => !student.hasResult && preloadStudentData(student)}
                              >
                                <div className="card-body text-center">
                                  <div className="mb-2">
                                    <i className={`bi ${student.hasResult ? 'bi-person-check text-warning' : 'bi-person-plus text-primary'}`} 
                                       style={{ fontSize: '2.5rem' }}></i>
                                  </div>
                                  <h6 className="card-title">{student.firstName} {student.lastName}</h6>
                                  <p className="card-text small text-muted mb-2">
                                    Roll: <strong>{student.rollNumber}</strong><br />
                                    Class: {student.class}-{student.section}
                                  </p>
                                  {student.hasResult ? (
                                    <div>
                                      <span className="badge bg-warning">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        Result Exists
                                      </span>
                                      <button
                                        className="btn btn-link btn-sm mt-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          loadResultForEditing(student.existingResultId);
                                        }}
                                      >
                                        <i className="bi bi-pencil me-1"></i>
                                        Edit Result
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="badge bg-success">Ready for Entry</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {students.length === 0 && (
                            <div className="col-12 text-center py-5">
                              <i className="bi bi-people" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                              <p className="text-muted mt-3">No students found for the selected class and section.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h5>
                            {isEditing ? 'Edit Result' : 'Create Result'} for 
                            <span className="text-primary ms-2">
                              {selectedStudent.firstName} {selectedStudent.lastName}
                            </span>
                          </h5>
                          <p className="text-muted mb-0">
                            Roll: {selectedStudent.rollNumber} | 
                            Class: {selectedStudent.class}-{selectedStudent.section}
                          </p>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEditing}
                          >
                            <i className="bi bi-arrow-left me-1"></i>
                            {isEditing ? 'Cancel Edit' : 'Back to Students'}
                          </button>
                          {isEditing && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteResult(editingResultId)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      <form onSubmit={handleSubmitResult}>
                        {/* Exam Details */}
                        <div className="card mb-4">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">
                              <i className="bi bi-journal-text me-2"></i>
                              Exam Details
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">Exam Type *</label>
                                <select
                                  className="form-select"
                                  value={filters.examType}
                                  onChange={(e) => handleExamTypeChange(e.target.value)}
                                  required
                                >
                                  <option value="">Select Exam Type</option>
                                  {examTypes
                                    .filter(exam => exam.value !== '')
                                    .map(exam => (
                                      <option key={exam.value} value={exam.value}>
                                        {exam.label}
                                      </option>
                                    ))}
                                </select>
                                <small className="text-muted">Select the type of exam</small>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Exam Name *</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={resultForm.examName}
                                  onChange={(e) => setResultForm(prev => ({ ...prev, examName: e.target.value }))}
                                  placeholder="Enter exam name (e.g., 'First Term Exam')"
                                  required
                                />
                                <small className="text-muted">Custom name for this exam</small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Student Details */}
                        <div className="card mb-4">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">
                              <i className="bi bi-person-circle me-2"></i>
                              Student Details
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-4">
                                <label className="form-label">Class (Studying) *</label>
                                <select
                                  className="form-select"
                                  value={resultForm.studentClass}
                                  onChange={(e) => setResultForm(prev => ({ ...prev, studentClass: e.target.value }))}
                                  required
                                >
                                  <option value="">Select Class</option>
                                  {classes.filter(c => c !== '').map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Section (Studying) *</label>
                                <select
                                  className="form-select"
                                  value={resultForm.studentSection}
                                  onChange={(e) => setResultForm(prev => ({ ...prev, studentSection: e.target.value }))}
                                  required
                                >
                                  <option value="">Select Section</option>
                                  {sections.filter(s => s !== '').map(sec => (
                                    <option key={sec} value={sec}>{sec}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-4">
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
                          </div>
                        </div>

                        {/* Subjects Section */}
                        <div className="card mb-4">
                          <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                              <i className="bi bi-book me-2"></i>
                              Subjects
                            </h6>
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={addSubject}
                            >
                              <i className="bi bi-plus-circle me-1"></i>
                              Add Subject
                            </button>
                          </div>
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th width="25%">Subject Name *</th>
                                    <th width="15%">Subject Code *</th>
                                    <th width="15%">Max Marks *</th>
                                    <th width="15%">Obtained Marks *</th>
                                    <th width="20%">Remarks</th>
                                    <th width="10%">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {resultForm.subjects.map((subject, index) => (
                                    <tr key={index}>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={subject.subjectName}
                                          onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                                          required
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={subject.subjectCode}
                                          onChange={(e) => handleSubjectChange(index, 'subjectCode', e.target.value)}
                                          required
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control"
                                          value={subject.maxMarks}
                                          onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                                          min="1"
                                          required
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control"
                                          value={subject.obtainedMarks}
                                          onChange={(e) => handleSubjectChange(index, 'obtainedMarks', e.target.value)}
                                          min="0"
                                          max={subject.maxMarks}
                                          required
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={subject.remarks}
                                          onChange={(e) => handleSubjectChange(index, 'remarks', e.target.value)}
                                          placeholder="Good/Excellent/..."
                                        />
                                      </td>
                                      <td>
                                        {resultForm.subjects.length > 1 && (
                                          <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeSubject(index)}
                                            title="Remove Subject"
                                          >
                                            <i className="bi bi-trash"></i>
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* Overall Remarks */}
                        <div className="card mb-4">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">
                              <i className="bi bi-chat-left-text me-2"></i>
                              Overall Remarks
                            </h6>
                          </div>
                          <div className="card-body">
                            <textarea
                              className="form-control"
                              rows="3"
                              value={resultForm.remarks}
                              onChange={(e) => setResultForm(prev => ({ ...prev, remarks: e.target.value }))}
                              placeholder="Enter overall remarks, comments, or feedback..."
                            />
                          </div>
                        </div>

                        {/* Result Summary */}
                        <div className="card mb-4 border-primary">
                          <div className="card-header bg-primary text-white">
                            <h6 className="mb-0">
                              <i className="bi bi-graph-up me-2"></i>
                              Result Summary
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row text-center">
                              <div className="col-md-3 mb-3">
                                <div className="p-3 bg-light rounded">
                                  <div className="text-muted small">Total Max Marks</div>
                                  <div className="h4 mb-0">{totals.totalMaxMarks}</div>
                                </div>
                              </div>
                              <div className="col-md-3 mb-3">
                                <div className="p-3 bg-light rounded">
                                  <div className="text-muted small">Total Obtained</div>
                                  <div className="h4 mb-0">{totals.totalObtainedMarks}</div>
                                </div>
                              </div>
                              <div className="col-md-3 mb-3">
                                <div className="p-3 bg-light rounded">
                                  <div className="text-muted small">Percentage</div>
                                  <div className="h4 mb-0">{totals.percentage}%</div>
                                </div>
                              </div>
                              <div className="col-md-3 mb-3">
                                <div className="p-3 bg-light rounded">
                                  <div className="text-muted small">Grade</div>
                                  <div className="h4 mb-0">
                                    <span className={`badge ${totals.grade === 'F' ? 'bg-danger' : 'bg-success'} fs-6`}>
                                      {totals.grade}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center mt-2">
                              <span className={`badge ${totals.result === 'pass' ? 'bg-success' : 'bg-danger'} fs-6 px-4 py-2`}>
                                {totals.result.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-3">
                          <button
                            type="submit"
                            className="btn btn-primary px-4"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                {isEditing ? 'Updating...' : 'Creating...'}
                              </>
                            ) : (
                              <>
                                <i className={`bi ${isEditing ? 'bi-check2-circle' : 'bi-save'} me-2`}></i>
                                {isEditing ? 'Update Result' : 'Save Result'}
                              </>
                            )}
                          </button>
                          
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={cancelEditing}
                            disabled={loading}
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
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Results Overview</h5>
                    <div className="small text-muted">
                      Filtered: <strong>{filteredResults.length}</strong> results
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th width="15%">Student</th>
                            <th width="8%">Roll No.</th>
                            <th width="8%">Class-Sec</th>
                            <th width="15%">Exam</th>
                            <th width="10%">Marks</th>
                            <th width="8%">Percentage</th>
                            <th width="8%">Grade</th>
                            <th width="8%">Result</th>
                            <th width="10%">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResults.map(result => (
                            <tr key={result._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-person-circle me-2 text-primary"></i>
                                  <div>
                                    <div className="fw-semibold">{result.studentId?.firstName} {result.studentId?.lastName}</div>
                                    <small className="text-muted">{result.examType?.replace('_', ' ')}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="fw-bold">{result.rollNumber}</td>
                              <td>
                                <span className="badge bg-secondary">
                                  {result.studentClass}-{result.studentSection}
                                </span>
                              </td>
                              <td>
                                <div className="small">{result.examName}</div>
                                <div className="text-muted x-small">{result.academicYear}</div>
                              </td>
                              <td>
                                <div>
                                  <span className="fw-bold">{result.totalObtainedMarks}</span>
                                  <span className="text-muted">/{result.totalMaxMarks}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`fw-bold ${result.percentage >= 33 ? 'text-success' : 'text-danger'}`}>
                                  {result.percentage}%
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${result.overallGrade === 'F' ? 'bg-danger' : result.overallGrade === 'A+' ? 'bg-success' : 'bg-info'}`}>
                                  {result.overallGrade}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${result.result === 'pass' ? 'bg-success' : 'bg-danger'}`}>
                                  {result.result.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    title="View Details"
                                    onClick={() => {
                                      // View result details - could be implemented with modal
                                      alert(`Viewing result for ${result.studentId?.firstName}`);
                                    }}
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-warning"
                                    title="Edit Result"
                                    onClick={() => loadResultForEditing(result._id)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    title="Delete Result"
                                    onClick={() => handleDeleteResult(result._id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {filteredResults.length === 0 && (
                        <div className="text-center py-5">
                          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                          <p className="text-muted mt-3">
                            {results.length === 0 
                              ? 'No results found. Try changing your filters or create new results.'
                              : 'No results match your current filters. Try adjusting them.'
                            }
                          </p>
                          {results.length === 0 && filters.class && filters.section && (
                            <button
                              className="btn btn-primary mt-2"
                              onClick={() => setActiveTab('create')}
                            >
                              <i className="bi bi-plus-circle me-2"></i>
                              Create Your First Result
                            </button>
                          )}
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