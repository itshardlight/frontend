import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FeeDepartmentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    search: '',
    paymentStatus: ''
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    receiptNumber: '',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  // Fee structure form
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !['fee_department', 'admin'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }

    fetchStudents();
  }, [navigate]); // Remove fetchStudents from dependency array to avoid infinite loop

  const fetchStudents = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
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
        receiptNumber: paymentForm.receiptNumber || `RCP-${Date.now()}`,
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

  const handleUpdateFeeStructure = async (studentId) => {
    if (!feeStructureForm.totalFee) {
      setError('Please enter total fee amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/fees/structure/${studentId}`,
        feeStructureForm,
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

  const filteredStudents = students.filter(student => {
    const matchesClass = !filters.class || student.academic?.currentGrade === filters.class;
    const matchesSection = !filters.section || student.academic?.section === filters.section;
    const matchesSearch = !filters.search || 
      (student.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
       student.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
       student.academic?.rollNumber?.toString().includes(filters.search));

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
        default:
          matchesPaymentStatus = true;
      }
    }

    return matchesClass && matchesSection && matchesSearch && matchesPaymentStatus;
  });

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

  const stats = calculateStats();

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <nav className="navbar navbar-dark bg-warning">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="bi bi-cash-stack me-2"></i>
            {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' 
              ? 'Fee Management (Admin)' 
              : 'Fee Department Dashboard'
            }
          </span>
          <div className="navbar-nav ms-auto d-flex flex-row">
            <button
              className="btn btn-outline-dark btn-sm me-2"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-house me-1"></i>
              Dashboard
            </button>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-warning text-dark">
                <h4 className="mb-0">
                  <i className="bi bi-cash-stack me-2"></i>
                  Fee Management System
                </h4>
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
                      Students ({filteredStudents.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`}
                      onClick={() => setActiveTab('payment')}
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
                </ul>

                {/* Filters */}
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
                          onChange={(e) => setFilters({...filters, class: e.target.value})}
                        >
                          <option value="">All Classes</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                          <option value="11">11</option>
                          <option value="12">12</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Section</label>
                        <select
                          className="form-select"
                          value={filters.section}
                          onChange={(e) => setFilters({...filters, section: e.target.value})}
                        >
                          <option value="">All Sections</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Payment Status</label>
                        <select
                          className="form-select"
                          value={filters.paymentStatus}
                          onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                        >
                          <option value="">All Status</option>
                          <option value="paid">Fully Paid</option>
                          <option value="partial">Partially Paid</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Search</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name or roll number..."
                          value={filters.search}
                          onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <button
                          className="btn btn-outline-secondary w-100"
                          onClick={() => setFilters({class: '', section: '', search: '', paymentStatus: ''})}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Reset
                        </button>
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
                    <div className="card">
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
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'students' && (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Student</th>
                          <th>Class</th>
                          <th>Roll No.</th>
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
                          const pending = (feeInfo.totalFee || 0) - (feeInfo.paidAmount || 0);
                          
                          return (
                            <tr key={student._id}>
                              <td>
                                <div>
                                  <strong>{student.firstName} {student.lastName}</strong>
                                  <br />
                                  <small className="text-muted">{student.userId?.email}</small>
                                </div>
                              </td>
                              <td>{student.academic?.currentGrade}-{student.academic?.section}</td>
                              <td>{student.academic?.rollNumber}</td>
                              <td>₹{(feeInfo.totalFee || 0).toLocaleString()}</td>
                              <td className="text-success">₹{(feeInfo.paidAmount || 0).toLocaleString()}</td>
                              <td className="text-danger">₹{pending.toLocaleString()}</td>
                              <td>
                                {pending <= 0 && feeInfo.totalFee > 0 ? (
                                  <span className="badge bg-success">Paid</span>
                                ) : feeInfo.paidAmount > 0 && pending > 0 ? (
                                  <span className="badge bg-warning">Partial</span>
                                ) : feeInfo.totalFee > 0 ? (
                                  <span className="badge bg-danger">Pending</span>
                                ) : (
                                  <span className="badge bg-secondary">No Fee</span>
                                )}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary me-1"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setActiveTab('payment');
                                  }}
                                >
                                  Add Payment
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setActiveTab('structure');
                                  }}
                                >
                                  Set Fee
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="row">
                    <div className="col-md-8">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Add Payment</h5>
                        </div>
                        <div className="card-body">
                          <form onSubmit={handleAddPayment}>
                            <div className="mb-3">
                              <label className="form-label">Select Student</label>
                              <select
                                className="form-select"
                                value={selectedStudent?._id || ''}
                                onChange={(e) => {
                                  const student = students.find(s => s._id === e.target.value);
                                  setSelectedStudent(student);
                                }}
                                required
                              >
                                <option value="">Choose a student...</option>
                                {students.map(student => (
                                  <option key={student._id} value={student._id}>
                                    {student.firstName} {student.lastName} - {student.academic?.currentGrade}-{student.academic?.section} ({student.academic?.rollNumber})
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Payment Amount</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                                    required
                                    min="1"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Payment Method</label>
                                  <select
                                    className="form-select"
                                    value={paymentForm.paymentMethod}
                                    onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                                  >
                                    <option value="cash">Cash</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="online">Online Transfer</option>
                                    <option value="card">Card Payment</option>
                                    <option value="upi">UPI</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Receipt Number</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={paymentForm.receiptNumber}
                                    onChange={(e) => setPaymentForm({...paymentForm, receiptNumber: e.target.value})}
                                    placeholder="Auto-generated if empty"
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Payment Date</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={paymentForm.paymentDate}
                                    onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Description</label>
                              <textarea
                                className="form-control"
                                rows="2"
                                value={paymentForm.description}
                                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                                placeholder="Optional description"
                              />
                            </div>
                            
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                              {loading ? 'Adding Payment...' : 'Add Payment'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                    
                    {selectedStudent && (
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-header">
                            <h6 className="mb-0">Student Fee Details</h6>
                          </div>
                          <div className="card-body">
                            <h6>{selectedStudent.firstName} {selectedStudent.lastName}</h6>
                            <p className="text-muted mb-2">
                              {selectedStudent.academic?.currentGrade}-{selectedStudent.academic?.section} | 
                              Roll: {selectedStudent.academic?.rollNumber}
                            </p>
                            
                            <div className="mb-2">
                              <strong>Total Fee:</strong> ₹{(selectedStudent.feeInfo?.totalFee || 0).toLocaleString()}
                            </div>
                            <div className="mb-2">
                              <strong>Paid Amount:</strong> ₹{(selectedStudent.feeInfo?.paidAmount || 0).toLocaleString()}
                            </div>
                            <div className="mb-2">
                              <strong>Pending Amount:</strong> ₹{((selectedStudent.feeInfo?.totalFee || 0) - (selectedStudent.feeInfo?.paidAmount || 0)).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'structure' && (
                  <div className="row">
                    <div className="col-md-8">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Set Fee Structure</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Select Student</label>
                            <select
                              className="form-select"
                              value={selectedStudent?._id || ''}
                              onChange={(e) => {
                                const student = students.find(s => s._id === e.target.value);
                                setSelectedStudent(student);
                              }}
                              required
                            >
                              <option value="">Choose a student...</option>
                              {students.map(student => (
                                <option key={student._id} value={student._id}>
                                  {student.firstName} {student.lastName} - {student.academic?.currentGrade}-{student.academic?.section} ({student.academic?.rollNumber})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Total Fee Amount</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={feeStructureForm.totalFee}
                                  onChange={(e) => setFeeStructureForm({...feeStructureForm, totalFee: e.target.value})}
                                  required
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Due Date</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={feeStructureForm.dueDate}
                                  onChange={(e) => setFeeStructureForm({...feeStructureForm, dueDate: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Tuition Fee</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={feeStructureForm.tuitionFee}
                                  onChange={(e) => setFeeStructureForm({...feeStructureForm, tuitionFee: e.target.value})}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Admission Fee</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={feeStructureForm.admissionFee}
                                  onChange={(e) => setFeeStructureForm({...feeStructureForm, admissionFee: e.target.value})}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="row">
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Exam Fee</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={feeStructureForm.examFee}
                                  onChange={(e) => setFeeStructureForm({...feeStructureForm, examFee: e.target.value})}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Library Fee</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={feeStructureForm.libraryFee}
                                  onChange={(e) => setFeeStructureForm({...feeStructureForm, libraryFee: e.target.value})}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label">Sports Fee</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={feeStructureForm.sportsFee}
                                  onChange={(e) => setFeeStructureForm({...feeStructureForm, sportsFee: e.target.value})}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">Other Fees</label>
                            <input
                              type="number"
                              className="form-control"
                              value={feeStructureForm.otherFees}
                              onChange={(e) => setFeeStructureForm({...feeStructureForm, otherFees: e.target.value})}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          
                          <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={() => selectedStudent && handleUpdateFeeStructure(selectedStudent._id)}
                            disabled={loading || !selectedStudent}
                          >
                            {loading ? 'Updating...' : 'Update Fee Structure'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {selectedStudent && (
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-header">
                            <h6 className="mb-0">Current Fee Structure</h6>
                          </div>
                          <div className="card-body">
                            <h6>{selectedStudent.firstName} {selectedStudent.lastName}</h6>
                            <p className="text-muted mb-2">
                              {selectedStudent.academic?.currentGrade}-{selectedStudent.academic?.section} | 
                              Roll: {selectedStudent.academic?.rollNumber}
                            </p>
                            
                            <div className="mb-2">
                              <strong>Current Total Fee:</strong> ₹{(selectedStudent.feeInfo?.totalFee || 0).toLocaleString()}
                            </div>
                            {selectedStudent.feeInfo?.tuitionFee > 0 && (
                              <div className="mb-1">Tuition: ₹{selectedStudent.feeInfo.tuitionFee.toLocaleString()}</div>
                            )}
                            {selectedStudent.feeInfo?.admissionFee > 0 && (
                              <div className="mb-1">Admission: ₹{selectedStudent.feeInfo.admissionFee.toLocaleString()}</div>
                            )}
                            {selectedStudent.feeInfo?.examFee > 0 && (
                              <div className="mb-1">Exam: ₹{selectedStudent.feeInfo.examFee.toLocaleString()}</div>
                            )}
                            {selectedStudent.feeInfo?.libraryFee > 0 && (
                              <div className="mb-1">Library: ₹{selectedStudent.feeInfo.libraryFee.toLocaleString()}</div>
                            )}
                            {selectedStudent.feeInfo?.sportsFee > 0 && (
                              <div className="mb-1">Sports: ₹{selectedStudent.feeInfo.sportsFee.toLocaleString()}</div>
                            )}
                            {selectedStudent.feeInfo?.otherFees > 0 && (
                              <div className="mb-1">Other: ₹{selectedStudent.feeInfo.otherFees.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeDepartmentDashboard;