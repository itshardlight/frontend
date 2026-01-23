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
      const matchesClass = !filters.class || student.academic?.class === filters.class;
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
        (student.basicInfo?.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         student.basicInfo?.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
         student.academic?.rollNumber?.toString().includes(filters.search) ||
         student.basicInfo?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
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

              {/* Student Fees Tab - will continue in next part */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;