import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const FeeManagement = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enhanced filters
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    academicYear: '2024-25',
    search: '',
    paymentStatus: '', // paid, pending, overdue
    feeType: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // States for data management
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    receiptNumber: '',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  
  // Fee structure form state
  const [feeStructureForm, setFeeStructureForm] = useState({
    totalFee: '',
    tuitionFee: '',
    admissionFee: '',
    examFee: '',
    libraryFee: '',
    sportsFee: '',
    otherFees: '',
    dueDate: ''
  });

  // Constants for dropdowns
  const classes = ['', '9', '10', '11', '12'];
  const sections = ['', 'A', 'B', 'C'];
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online', label: 'Online Transfer' },
    { value: 'card', label: 'Card Payment' },
    { value: 'upi', label: 'UPI' }
  ];
  const paymentStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'paid', label: 'Fully Paid' },
    { value: 'partial', label: 'Partially Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' }
  ];

  // Filter students based on all filter criteria
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesClass = !filters.class || student.academic?.currentGrade === filters.class;
      const matchesSection = !filters.section || student.academic?.section === filters.section;
      const matchesAcademicYear = !filters.academicYear || student.academic?.academicYear === filters.academicYear;
      
      // Payment status filter
      let matchesPaymentStatus = true;
      if (filters.paymentStatus) {
        const feeInfo = student.feeInfo || {};
        const totalFee = feeInfo.totalFee || 0;
        const paidAmount = feeInfo.paidAmount || 0;
        const pendingAmount = totalFee - paidAmount;
        
        switch (filters.paymentStatus) {
          case 'paid':
            matchesPaymentStatus = pendingAmount <= 0 && totalFee > 0;
            break;
          case 'partial':
            matchesPaymentStatus = paidAmount > 0 && pendingAmount > 0;
            break;
          case 'pending':
            matchesPaymentStatus = paidAmount === 0 && totalFee > 0;
            break;
          case 'overdue':
            // Consider overdue if pending amount > 0 and due date passed
            matchesPaymentStatus = pendingAmount > 0;
            break;
          default:
            matchesPaymentStatus = true;
        }
      }
      
      // Amount range filter
      const feeAmount = student.feeInfo?.totalFee || 0;
      const matchesMinAmount = !filters.minAmount || feeAmount >= parseFloat(filters.minAmount);
      const matchesMaxAmount = !filters.maxAmount || feeAmount <= parseFloat(filters.maxAmount);
      
      // Enhanced search
      const matchesSearch = !filters.search || 
        (student.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         student.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         student.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         student.academic?.rollNumber?.toString().includes(filters.search) ||
         student.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
         student.parentInfo?.fatherName?.toLowerCase().includes(filters.search.toLowerCase()));

      return matchesClass && matchesSection && matchesAcademicYear && 
             matchesPaymentStatus && matchesMinAmount && matchesMaxAmount && matchesSearch;
    });
  }, [students, filters]);

  // Fetch students with fee information
  const fetchStudents = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);

      const response = await axios.get(
        `http://localhost:5000/api/fees/students?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || 'Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      class: '',
      section: '',
      academicYear: '2024-25',
      search: '',
      paymentStatus: '',
      feeType: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Add payment
  const handleAddPayment = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const paymentData = {
        studentId: selectedStudent._id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        receiptNumber: paymentForm.receiptNumber,
        description: paymentForm.description,
        paymentDate: paymentForm.paymentDate
      };

      await axios.post(
        'http://localhost:5000/api/fees/payment',
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Payment added successfully!');
      setPaymentForm({
        amount: '',
        paymentMethod: 'cash',
        receiptNumber: '',
        description: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error adding payment:', error);
      setError(error.response?.data?.message || 'Error adding payment');
    } finally {
      setLoading(false);
    }
  };

  // Update fee structure
  const handleUpdateFeeStructure = async (studentId, feeData = null) => {
    const feeStructureData = feeData || feeStructureForm;
    
    if (!feeStructureData.totalFee) {
      setError('Please enter total fee amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/fees/structure/${studentId}`,
        feeStructureData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Fee structure updated successfully!');
      setFeeStructureForm({
        totalFee: '',
        tuitionFee: '',
        admissionFee: '',
        examFee: '',
        libraryFee: '',
        sportsFee: '',
        otherFees: '',
        dueDate: ''
      });
      fetchStudents();
    } catch (error) {
      console.error('Error updating fee structure:', error);
      setError(error.response?.data?.message || 'Error updating fee structure');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalStudents = filteredStudents.length;
    const totalFeeAmount = filteredStudents.reduce((sum, student) => sum + (student.feeInfo?.totalFee || 0), 0);
    const totalPaidAmount = filteredStudents.reduce((sum, student) => sum + (student.feeInfo?.paidAmount || 0), 0);
    const totalPendingAmount = totalFeeAmount - totalPaidAmount;
    
    const fullyPaidStudents = filteredStudents.filter(student => {
      const feeInfo = student.feeInfo || {};
      return (feeInfo.totalFee || 0) > 0 && (feeInfo.totalFee - (feeInfo.paidAmount || 0)) <= 0;
    }).length;
    
    const pendingStudents = filteredStudents.filter(student => {
      const feeInfo = student.feeInfo || {};
      return (feeInfo.totalFee || 0) > 0 && (feeInfo.totalFee - (feeInfo.paidAmount || 0)) > 0;
    }).length;

    return {
      totalStudents,
      totalFeeAmount,
      totalPaidAmount,
      totalPendingAmount,
      fullyPaidStudents,
      pendingStudents,
      collectionRate: totalFeeAmount > 0 ? Math.round((totalPaidAmount / totalFeeAmount) * 100) : 0
    };
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchStudents();
  }, [filters.class, filters.section, filters.academicYear]);

  const stats = calculateStats();

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-cash-stack me-2"></i>
                Fee Management
              </h4>
              <span className="badge bg-light text-success">
                Collection Rate: {stats.collectionRate}%
              </span>
            </div>
            
            <div className="card-body">
              {/* Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <i className="bi bi-graph-up me-2"></i>
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                  >
                    <i className="bi bi-people me-2"></i>
                    Student Fees
                    {filteredStudents.length > 0 && (
                      <span className="badge bg-secondary ms-2">{filteredStudents.length}</span>
                    )}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Add Payment
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'structure' ? 'active' : ''}`}
                    onClick={() => setActiveTab('structure')}
                  >
                    <i className="bi bi-gear me-2"></i>
                    Fee Structure
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                  >
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Reports
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
                      <label className="form-label">Payment Status</label>
                      <select
                        className="form-select"
                        value={filters.paymentStatus}
                        onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                      >
                        {paymentStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
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
                  
                  <div className="row mt-3">
                    <div className="col-md-4">
                      <label className="form-label">Search</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name, roll number, email..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Min Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        value={filters.minAmount}
                        onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Max Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="100000"
                        value={filters.maxAmount}
                        onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <div className="text-muted small">
                        Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
                      </div>
                    </div>
                  </div>
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

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div>
                  {/* Statistics Cards */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-2">
                      <div className="card bg-primary bg-opacity-10 border-primary">
                        <div className="card-body text-center">
                          <i className="bi bi-people-fill text-primary" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2 mb-0 text-primary">{stats.totalStudents}</h4>
                          <small className="text-muted">Total Students</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-info bg-opacity-10 border-info">
                        <div className="card-body text-center">
                          <i className="bi bi-currency-rupee text-info" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2 mb-0 text-info">₹{stats.totalFeeAmount.toLocaleString()}</h4>
                          <small className="text-muted">Total Fee Amount</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-success bg-opacity-10 border-success">
                        <div className="card-body text-center">
                          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2 mb-0 text-success">₹{stats.totalPaidAmount.toLocaleString()}</h4>
                          <small className="text-muted">Collected Amount</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-warning bg-opacity-10 border-warning">
                        <div className="card-body text-center">
                          <i className="bi bi-clock-fill text-warning" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2 mb-0 text-warning">₹{stats.totalPendingAmount.toLocaleString()}</h4>
                          <small className="text-muted">Pending Amount</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-success bg-opacity-10 border-success">
                        <div className="card-body text-center">
                          <i className="bi bi-person-check-fill text-success" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2 mb-0 text-success">{stats.fullyPaidStudents}</h4>
                          <small className="text-muted">Fully Paid</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="card bg-danger bg-opacity-10 border-danger">
                        <div className="card-body text-center">
                          <i className="bi bi-person-x-fill text-danger" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2 mb-0 text-danger">{stats.pendingStudents}</h4>
                          <small className="text-muted">Pending Payment</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collection Rate Progress */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Fee Collection Progress</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Collection Rate</span>
                        <span className="fw-bold">{stats.collectionRate}%</span>
                      </div>
                      <div className="progress" style={{ height: '20px' }}>
                        <div 
                          className={`progress-bar ${stats.collectionRate >= 80 ? 'bg-success' : stats.collectionRate >= 60 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${stats.collectionRate}%` }}
                        >
                          {stats.collectionRate}%
                        </div>
                      </div>
                      <div className="row mt-3 text-center">
                        <div className="col-md-6">
                          <small className="text-muted">Collected: ₹{stats.totalPaidAmount.toLocaleString()}</small>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Pending: ₹{stats.totalPendingAmount.toLocaleString()}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading students...</p>
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover table-striped">
                        <thead className="table-dark">
                          <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Email</th>
                            <th>Total Fee</th>
                            <th>Paid</th>
                            <th>Pending</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student) => {
                            const feeInfo = student.feeInfo || {};
                            const totalFee = feeInfo.totalFee || 0;
                            const paidAmount = feeInfo.paidAmount || 0;
                            const pendingAmount = totalFee - paidAmount;
                            
                            let statusBadge = 'secondary';
                            let statusText = 'No Fee Set';
                            
                            if (totalFee > 0) {
                              if (pendingAmount <= 0) {
                                statusBadge = 'success';
                                statusText = 'Paid';
                              } else if (paidAmount > 0) {
                                statusBadge = 'warning';
                                statusText = 'Partial';
                              } else {
                                statusBadge = 'danger';
                                statusText = 'Pending';
                              }
                            }
                            
                            return (
                              <tr key={student._id}>
                                <td>{student.academic?.rollNumber || 'N/A'}</td>
                                <td>
                                  <strong>{student.fullName || `${student.firstName} ${student.lastName}`}</strong>
                                </td>
                                <td>
                                  <span className="badge bg-info">
                                    {student.academic?.currentGrade}-{student.academic?.section}
                                  </span>
                                </td>
                                <td>{student.email}</td>
                                <td>₹{totalFee.toLocaleString()}</td>
                                <td className="text-success">₹{paidAmount.toLocaleString()}</td>
                                <td className="text-danger">₹{pendingAmount.toLocaleString()}</td>
                                <td>
                                  <span className={`badge bg-${statusBadge}`}>{statusText}</span>
                                </td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => {
                                        setSelectedStudent(student);
                                        setActiveTab('payments');
                                      }}
                                      title="Add Payment"
                                    >
                                      <i className="bi bi-credit-card"></i>
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => {
                                        setSelectedStudent(student);
                                        setFeeStructureForm({
                                          totalFee: feeInfo.totalFee || '',
                                          tuitionFee: feeInfo.tuitionFee || '',
                                          admissionFee: feeInfo.admissionFee || '',
                                          examFee: feeInfo.examFee || '',
                                          libraryFee: feeInfo.libraryFee || '',
                                          sportsFee: feeInfo.sportsFee || '',
                                          otherFees: feeInfo.otherFees || '',
                                          dueDate: feeInfo.dueDate ? new Date(feeInfo.dueDate).toISOString().split('T')[0] : ''
                                        });
                                        setActiveTab('structure');
                                      }}
                                      title="Edit Fee Structure"
                                    >
                                      <i className="bi bi-gear"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-people" style={{ fontSize: '4rem' }}></i>
                      <h4 className="mt-3">No Students Found</h4>
                      <p>Try adjusting your filters or add students to the system.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Add Payment Tab */}
              {activeTab === 'payments' && (
                <div>
                  <div className="card">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-credit-card me-2"></i>
                        Add Payment
                      </h5>
                    </div>
                    <div className="card-body">
                      {selectedStudent ? (
                        <div>
                          {/* Selected Student Info */}
                          <div className="alert alert-info">
                            <h6>Selected Student:</h6>
                            <p className="mb-0">
                              <strong>{selectedStudent.fullName || `${selectedStudent.firstName} ${selectedStudent.lastName}`}</strong>
                              <br />
                              Roll Number: {selectedStudent.academic?.rollNumber}
                              <br />
                              Class: {selectedStudent.academic?.currentGrade}-{selectedStudent.academic?.section}
                              <br />
                              Pending Amount: ₹{((selectedStudent.feeInfo?.totalFee || 0) - (selectedStudent.feeInfo?.paidAmount || 0)).toLocaleString()}
                            </p>
                            <button
                              className="btn btn-sm btn-outline-secondary mt-2"
                              onClick={() => setSelectedStudent(null)}
                            >
                              Change Student
                            </button>
                          </div>

                          {/* Payment Form */}
                          <form onSubmit={handleAddPayment}>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">Payment Amount *</label>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    required
                                    min="1"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Payment Method *</label>
                                <select
                                  className="form-select"
                                  value={paymentForm.paymentMethod}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                  required
                                >
                                  {paymentMethods.map(method => (
                                    <option key={method.value} value={method.value}>{method.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Receipt Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={paymentForm.receiptNumber}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })}
                                  placeholder="Auto-generated if empty"
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Payment Date *</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={paymentForm.paymentDate}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label">Description</label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={paymentForm.description}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                                  placeholder="Optional payment notes..."
                                ></textarea>
                              </div>
                              <div className="col-12">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                  {loading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-check-circle me-2"></i>
                                      Add Payment
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary ms-2"
                                  onClick={() => setActiveTab('students')}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="text-center text-muted py-5">
                          <i className="bi bi-person-plus" style={{ fontSize: '4rem' }}></i>
                          <h4 className="mt-3">No Student Selected</h4>
                          <p>Please select a student from the Student Fees tab to add a payment.</p>
                          <button
                            className="btn btn-primary"
                            onClick={() => setActiveTab('students')}
                          >
                            Go to Student Fees
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Structure Tab */}
              {activeTab === 'structure' && (
                <div>
                  <div className="card">
                    <div className="card-header bg-secondary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-gear me-2"></i>
                        Update Fee Structure
                      </h5>
                    </div>
                    <div className="card-body">
                      {selectedStudent ? (
                        <div>
                          {/* Selected Student Info */}
                          <div className="alert alert-info">
                            <h6>Selected Student:</h6>
                            <p className="mb-0">
                              <strong>{selectedStudent.fullName || `${selectedStudent.firstName} ${selectedStudent.lastName}`}</strong>
                              <br />
                              Roll Number: {selectedStudent.academic?.rollNumber}
                              <br />
                              Class: {selectedStudent.academic?.currentGrade}-{selectedStudent.academic?.section}
                            </p>
                            <button
                              className="btn btn-sm btn-outline-secondary mt-2"
                              onClick={() => setSelectedStudent(null)}
                            >
                              Change Student
                            </button>
                          </div>

                          {/* Fee Structure Form */}
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateFeeStructure(selectedStudent._id);
                          }}>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">Tuition Fee</label>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={feeStructureForm.tuitionFee}
                                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, tuitionFee: e.target.value })}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Admission Fee</label>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={feeStructureForm.admissionFee}
                                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, admissionFee: e.target.value })}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Exam Fee</label>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={feeStructureForm.examFee}
                                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, examFee: e.target.value })}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Library Fee</label>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={feeStructureForm.libraryFee}
                                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, libraryFee: e.target.value })}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Sports Fee</label>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={feeStructureForm.sportsFee}
                                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, sportsFee: e.target.value })}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Other Fees</label>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={feeStructureForm.otherFees}
                                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, otherFees: e.target.value })}
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Total Fee *</label>
                                <div className="input-group">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={feeStructureForm.totalFee}
                                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, totalFee: e.target.value })}
                                    required
                                    min="1"
                                    step="0.01"
                                  />
                                </div>
                                <small className="text-muted">Enter the total fee amount</small>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Due Date</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={feeStructureForm.dueDate}
                                  onChange={(e) => setFeeStructureForm({ ...feeStructureForm, dueDate: e.target.value })}
                                />
                              </div>
                              <div className="col-12">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                  {loading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-check-circle me-2"></i>
                                      Update Fee Structure
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary ms-2"
                                  onClick={() => setActiveTab('students')}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="text-center text-muted py-5">
                          <i className="bi bi-gear" style={{ fontSize: '4rem' }}></i>
                          <h4 className="mt-3">No Student Selected</h4>
                          <p>Please select a student from the Student Fees tab to update fee structure.</p>
                          <button
                            className="btn btn-primary"
                            onClick={() => setActiveTab('students')}
                          >
                            Go to Student Fees
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div>
                  <div className="card">
                    <div className="card-header bg-info text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Fee Collection Reports
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-4">
                        {/* Summary Report */}
                        <div className="col-12">
                          <h6>Collection Summary</h6>
                          <table className="table table-bordered">
                            <tbody>
                              <tr>
                                <td><strong>Total Students</strong></td>
                                <td>{stats.totalStudents}</td>
                              </tr>
                              <tr>
                                <td><strong>Total Fee Amount</strong></td>
                                <td>₹{stats.totalFeeAmount.toLocaleString()}</td>
                              </tr>
                              <tr className="table-success">
                                <td><strong>Total Collected</strong></td>
                                <td>₹{stats.totalPaidAmount.toLocaleString()}</td>
                              </tr>
                              <tr className="table-warning">
                                <td><strong>Total Pending</strong></td>
                                <td>₹{stats.totalPendingAmount.toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td><strong>Collection Rate</strong></td>
                                <td>
                                  <span className={`badge ${stats.collectionRate >= 80 ? 'bg-success' : stats.collectionRate >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                    {stats.collectionRate}%
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td><strong>Fully Paid Students</strong></td>
                                <td>{stats.fullyPaidStudents}</td>
                              </tr>
                              <tr>
                                <td><strong>Pending Payment Students</strong></td>
                                <td>{stats.pendingStudents}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Export Options */}
                        <div className="col-12">
                          <h6>Export Reports</h6>
                          <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary" onClick={() => window.print()}>
                              <i className="bi bi-printer me-2"></i>
                              Print Report
                            </button>
                            <button className="btn btn-outline-success" disabled>
                              <i className="bi bi-file-excel me-2"></i>
                              Export to Excel
                            </button>
                            <button className="btn btn-outline-danger" disabled>
                              <i className="bi bi-file-pdf me-2"></i>
                              Export to PDF
                            </button>
                          </div>
                          <small className="text-muted d-block mt-2">
                            Excel and PDF export features coming soon
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;