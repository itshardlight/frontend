import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import EsewaPaymentForm from "../../components/payment/EsewaPaymentForm";

const StudentFees = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProfile(token);
    }
  }, [navigate]);

  const fetchProfile = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/profiles/me/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch fee information");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (feeInfo) => {
    if (!feeInfo) return <span className="badge bg-secondary">No Fee Set</span>;
    
    const pending = feeInfo.pendingAmount || 0;
    const paid = feeInfo.paidAmount || 0;
    const total = feeInfo.totalFee || 0;
    
    if (pending <= 0 && total > 0) {
      return <span className="badge bg-success">Fully Paid</span>;
    } else if (paid > 0 && pending > 0) {
      return <span className="badge bg-warning">Partially Paid</span>;
    } else if (paid === 0 && total > 0) {
      return <span className="badge bg-danger">Pending</span>;
    } else {
      return <span className="badge bg-secondary">No Fee Set</span>;
    }
  };

  const handlePayNow = (amount = null) => {
    const pendingAmount = profile?.feeInfo?.pendingAmount || 0;
    
    if (pendingAmount <= 0) {
      setError('No pending amount to pay.');
      return;
    }
    
    let amountToPay = amount || pendingAmount;
    
    // Validate amount doesn't exceed pending
    if (amountToPay > pendingAmount) {
      setError(`Payment amount (Rs.${amountToPay}) cannot exceed pending amount (Rs.${pendingAmount})`);
      return;
    }
    
    // Ensure we have a valid user ID
    const userId = user._id || user.id;
    if (!userId) {
      setError('User ID not found. Please login again.');
      return;
    }
    
    console.log('Payment initiated:', {
      user: user,
      userId: userId,
      amount: amountToPay,
      pendingAmount: pendingAmount,
      profile: profile
    });
    
    setPaymentAmount(amountToPay);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    // Refresh profile data to show updated payment status
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile(token);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(`Payment failed: ${error.message}`);
  };

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">My Fees</span>
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-light btn-sm me-2"
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
            <button 
              className="btn btn-outline-info btn-sm" 
              onClick={() => navigate("/profile")}
            >
              <i className="bi bi-person-circle me-1"></i>
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading fee information...</p>
          </div>
        ) : profile?.feeInfo ? (
          <>
            {/* Student Info Header */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h4 className="mb-1">
                      {profile.firstName && profile.lastName 
                        ? `${profile.firstName} ${profile.lastName}`
                        : user.fullName || user.username}
                    </h4>
                    {profile.academic && (
                      <p className="text-muted mb-0">
                        Class: {profile.academic.currentGrade}-{profile.academic.section}
                        {profile.academic.rollNumber && (
                          <span className="ms-3">Roll Number: {profile.academic.rollNumber}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="col-md-4 text-end">
                    {getPaymentStatusBadge(profile.feeInfo)}
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card bg-primary bg-opacity-10 border-primary">
                  <div className="card-body text-center">
                    <i className="bi bi-currency-rupee text-primary" style={{ fontSize: '2rem' }}></i>
                    <h4 className="mt-2 mb-0 text-primary">
                      Rs.{(profile.feeInfo.totalFee || 0).toLocaleString()}
                    </h4>
                    <small className="text-muted">Total Fee</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success bg-opacity-10 border-success">
                  <div className="card-body text-center">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                    <h4 className="mt-2 mb-0 text-success">
                      Rs.{(profile.feeInfo.paidAmount || 0).toLocaleString()}
                    </h4>
                    <small className="text-muted">Paid Amount</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-danger bg-opacity-10 border-danger">
                  <div className="card-body text-center">
                    <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '2rem' }}></i>
                    <h4 className="mt-2 mb-0 text-danger">
                      Rs.{(profile.feeInfo.pendingAmount || 0).toLocaleString()}
                    </h4>
                    <small className="text-muted">Pending Amount</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info bg-opacity-10 border-info">
                  <div className="card-body text-center">
                    <i className="bi bi-calendar-event text-info" style={{ fontSize: '2rem' }}></i>
                    <h4 className="mt-2 mb-0 text-info">
                      {profile.feeInfo.dueDate 
                        ? new Date(profile.feeInfo.dueDate).toLocaleDateString()
                        : 'N/A'}
                    </h4>
                    <small className="text-muted">Due Date</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-pie-chart me-2"></i>
                      Fee Breakdown
                    </h5>
                  </div>
                  <div className="card-body">
                    {profile.feeInfo.tuitionFee > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tuition Fee:</span>
                        <strong>Rs.{profile.feeInfo.tuitionFee.toLocaleString()}</strong>
                      </div>
                    )}
                    {profile.feeInfo.admissionFee > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Admission Fee:</span>
                        <strong>Rs.{profile.feeInfo.admissionFee.toLocaleString()}</strong>
                      </div>
                    )}
                    {profile.feeInfo.examFee > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Exam Fee:</span>
                        <strong>Rs.{profile.feeInfo.examFee.toLocaleString()}</strong>
                      </div>
                    )}
                    {profile.feeInfo.libraryFee > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Library Fee:</span>
                        <strong>Rs.{profile.feeInfo.libraryFee.toLocaleString()}</strong>
                      </div>
                    )}
                    {profile.feeInfo.sportsFee > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Sports Fee:</span>
                        <strong>Rs.{profile.feeInfo.sportsFee.toLocaleString()}</strong>
                      </div>
                    )}
                    {profile.feeInfo.otherFees > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span>Other Fees:</span>
                        <strong>Rs.{profile.feeInfo.otherFees.toLocaleString()}</strong>
                      </div>
                    )}
                    <hr />
                    <div className="d-flex justify-content-between">
                      <strong>Total:</strong>
                      <strong className="text-primary">Rs.{(profile.feeInfo.totalFee || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Payment Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Payment Status:</strong>
                      <div className="mt-1">
                        {getPaymentStatusBadge(profile.feeInfo)}
                      </div>
                    </div>
                    
                    {profile.feeInfo.dueDate && (
                      <div className="mb-3">
                        <strong>Due Date:</strong>
                        <div className="mt-1">
                          <span className={`badge ${
                            new Date(profile.feeInfo.dueDate) < new Date() ? 'bg-danger' : 'bg-info'
                          }`}>
                            {new Date(profile.feeInfo.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {profile.feeInfo.lastPaymentDate && (
                      <div className="mb-3">
                        <strong>Last Payment:</strong>
                        <div className="mt-1">
                          {new Date(profile.feeInfo.lastPaymentDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <div className="progress mb-2">
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{ 
                          width: `${((profile.feeInfo.paidAmount || 0) / (profile.feeInfo.totalFee || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      {Math.round(((profile.feeInfo.paidAmount || 0) / (profile.feeInfo.totalFee || 1)) * 100)}% paid
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            {profile.feeInfo.pendingAmount > 0 ? (
              <div className="card shadow-sm mb-4 border-primary">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-credit-card me-2"></i>
                    Make Payment
                  </h5>
                </div>
                <div className="card-body">
                  {!showPaymentForm ? (
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h6 className="text-danger mb-2">
                          Outstanding Amount: Rs.{profile.feeInfo.pendingAmount.toLocaleString()}
                        </h6>
                        <p className="text-muted mb-0">
                          Pay your fees securely using eSewa. You can pay the full amount or make a partial payment.
                        </p>
                        {profile.feeInfo.dueDate && new Date(profile.feeInfo.dueDate) < new Date() && (
                          <div className="alert alert-warning mt-2 mb-0">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            <strong>Overdue:</strong> Payment was due on {new Date(profile.feeInfo.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-success btn-lg"
                            onClick={() => handlePayNow()}
                          >
                            <i className="bi bi-credit-card me-2"></i>
                            Pay Full Amount
                          </button>
                          <div className="input-group">
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder="Custom amount"
                              min="1"
                              max={profile.feeInfo.pendingAmount}
                              step="0.01"
                              id="customAmount"
                              onInput={(e) => {
                                const value = parseFloat(e.target.value);
                                const maxAmount = profile.feeInfo.pendingAmount;
                                if (value > maxAmount) {
                                  e.target.value = maxAmount;
                                }
                              }}
                            />
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => {
                                const customAmount = parseFloat(document.getElementById('customAmount').value);
                                const maxAmount = profile.feeInfo.pendingAmount;
                                if (customAmount && customAmount > 0) {
                                  if (customAmount > maxAmount) {
                                    setError(`Amount cannot exceed pending amount of Rs.${maxAmount}`);
                                  } else {
                                    setError('');
                                    handlePayNow(customAmount);
                                  }
                                } else {
                                  setError('Please enter a valid amount');
                                }
                              }}
                            >
                              Pay Custom
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Payment Amount: Rs.{paymentAmount.toLocaleString()}</h6>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setShowPaymentForm(false)}
                        >
                          <i className="bi bi-arrow-left me-1"></i>
                          Back
                        </button>
                      </div>
                      <EsewaPaymentForm
                        studentId={user._id || user.id}
                        feeType="tuition"
                        amount={paymentAmount}
                        description={`Fee Payment - ${profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : user.fullName || user.username}`}
                        successUrl={`${window.location.origin}/payment/success`}
                        failureUrl={`${window.location.origin}/payment/failure`}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        isProduction={false} // Set to true for production
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : profile.feeInfo.totalFee > 0 && (
              <div className="card shadow-sm mb-4 border-success">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    Payment Status
                  </h5>
                </div>
                <div className="card-body text-center">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                  <h4 className="text-success mt-2">All Fees Paid!</h4>
                  <p className="text-muted">
                    Congratulations! You have successfully paid all your fees for this term.
                  </p>
                  {profile.feeInfo.lastPaymentDate && (
                    <small className="text-muted">
                      Last payment made on: {new Date(profile.feeInfo.lastPaymentDate).toLocaleDateString()}
                    </small>
                  )}
                </div>
              </div>
            )}

            {/* Payment History */}
            {profile.feeInfo.feeHistory && profile.feeInfo.feeHistory.length > 0 && (
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Payment History
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Receipt Number</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.feeInfo.feeHistory.reverse().map((payment, index) => (
                          <tr key={index}>
                            <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                            <td className="text-success fw-bold">
                              Rs.{payment.amount.toLocaleString()}
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {payment.paymentMethod.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <code>{payment.receiptNumber}</code>
                            </td>
                            <td>{payment.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted py-5">
            <i className="bi bi-cash-stack" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3">No Fee Information</h4>
            <p>Fee information is not available yet. Please contact the administration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFees;