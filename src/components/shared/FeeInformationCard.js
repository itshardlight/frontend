import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeeInformationCard = ({ studentId }) => {
  const [feeInfo, setFeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeeInfo();
  }, [studentId]);

  const fetchFeeInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Admin users should be able to access fee information
      if (user.role === 'admin') {
        // For admin, we can directly call the fee API
        const response = await axios.get(`http://localhost:5000/api/fees/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // Find the specific student in the response
          const student = response.data.data.find(s => s._id === studentId);
          if (student) {
            setFeeInfo(student.feeInfo);
          } else {
            setFeeInfo({
              totalFee: 0,
              paidAmount: 0,
              pendingAmount: 0,
              paymentStatus: 'pending',
              feeHistory: []
            });
          }
        }
      } else {
        // For non-admin users, show limited access message
        setError('Fee information access restricted to administrators');
      }
    } catch (err) {
      console.error('Error fetching fee info:', err);
      
      if (err.response?.status === 403) {
        setError('Access denied. Fee information requires admin privileges.');
      } else {
        setError('Failed to load fee information');
      }
      
      // Set default fee info on error
      setFeeInfo({
        totalFee: 0,
        paidAmount: 0,
        pendingAmount: 0,
        paymentStatus: 'pending',
        feeHistory: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status, pending, total) => {
    if (pending <= 0 && total > 0) {
      return <span className="badge bg-success fs-6">Fully Paid</span>;
    } else if (pending > 0 && pending < total) {
      return <span className="badge bg-warning fs-6">Partially Paid</span>;
    } else if (total > 0) {
      return <span className="badge bg-danger fs-6">Pending</span>;
    } else {
      return <span className="badge bg-secondary fs-6">No Fee Set</span>;
    }
  };

  const handleManageFees = () => {
    // Navigate to fee department dashboard with this student pre-selected
    window.open('/fee-department', '_blank');
  };

  if (loading) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-cash-stack me-2"></i>
            Fee Information
          </h5>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-cash-stack me-2"></i>
            Fee Information
          </h5>
        </div>
        <div className="card-body">
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button 
              className="btn btn-outline-warning btn-sm ms-3" 
              onClick={fetchFeeInfo}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-cash-stack me-2"></i>
          Fee Information
        </h5>
        <button 
          className="btn btn-light btn-sm"
          onClick={handleManageFees}
          title="Manage fees in Fee Department"
        >
          <i className="bi bi-gear me-1"></i>
          Manage
        </button>
      </div>
      <div className="card-body">
        {feeInfo ? (
          <div className="row g-3">
            {/* Fee Summary */}
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title text-primary">
                    <i className="bi bi-currency-rupee me-1"></i>
                    Fee Summary
                  </h6>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Total Fee:</span>
                    <span className="badge bg-info fs-6">
                      ₹{(feeInfo.totalFee || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Paid Amount:</span>
                    <span className="badge bg-success fs-6">
                      ₹{(feeInfo.paidAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold">Pending Amount:</span>
                    <span className="badge bg-danger fs-6">
                      ₹{(feeInfo.pendingAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Payment Status:</span>
                    {getPaymentStatusBadge(
                      feeInfo.paymentStatus, 
                      feeInfo.pendingAmount || 0, 
                      feeInfo.totalFee || 0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title text-info">
                    <i className="bi bi-pie-chart me-1"></i>
                    Fee Breakdown
                  </h6>
                  
                  {feeInfo.totalFee > 0 ? (
                    <>
                      {feeInfo.tuitionFee > 0 && (
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>Tuition Fee:</span>
                          <span>₹{feeInfo.tuitionFee.toLocaleString()}</span>
                        </div>
                      )}
                      {feeInfo.admissionFee > 0 && (
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>Admission Fee:</span>
                          <span>₹{feeInfo.admissionFee.toLocaleString()}</span>
                        </div>
                      )}
                      {feeInfo.examFee > 0 && (
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>Exam Fee:</span>
                          <span>₹{feeInfo.examFee.toLocaleString()}</span>
                        </div>
                      )}
                      {feeInfo.libraryFee > 0 && (
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>Library Fee:</span>
                          <span>₹{feeInfo.libraryFee.toLocaleString()}</span>
                        </div>
                      )}
                      {feeInfo.sportsFee > 0 && (
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>Sports Fee:</span>
                          <span>₹{feeInfo.sportsFee.toLocaleString()}</span>
                        </div>
                      )}
                      {feeInfo.otherFees > 0 && (
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>Other Fees:</span>
                          <span>₹{feeInfo.otherFees.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {feeInfo.dueDate && (
                        <div className="mt-2 pt-2 border-top">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Due Date:</span>
                            <span className="badge bg-warning text-dark">
                              {new Date(feeInfo.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="bi bi-info-circle me-2"></i>
                      No fee structure set
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment History */}
            {feeInfo.feeHistory && feeInfo.feeHistory.length > 0 && (
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-success">
                      <i className="bi bi-clock-history me-1"></i>
                      Recent Payment History
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-hover">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Receipt</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feeInfo.feeHistory.slice(-3).reverse().map((payment, index) => (
                            <tr key={index}>
                              <td>
                                <small>{new Date(payment.paymentDate).toLocaleDateString()}</small>
                              </td>
                              <td>
                                <span className="badge bg-success">
                                  ₹{payment.amount.toLocaleString()}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {payment.paymentMethod.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">{payment.receiptNumber}</small>
                              </td>
                              <td>
                                <small>{payment.description || '-'}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {feeInfo.feeHistory.length > 3 && (
                      <small className="text-muted">
                        Showing last 3 payments. Total payments: {feeInfo.feeHistory.length}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            )}

         
          </div>
        ) : (
          <div className="text-center text-muted">
            <i className="bi bi-info-circle me-2"></i>
            No fee information available
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeInformationCard;