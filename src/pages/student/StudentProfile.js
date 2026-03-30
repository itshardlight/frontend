import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AchievementSection } from '../../components/student';
import { ResultsSection, FeeInformationCard } from '../../components/shared';
import profileService from '../../services/profileService';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setError('Please login to view your profile');
      setLoading(false);
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    // Only allow students to access this page
    if (user.role !== 'student') {
      navigate('/dashboard');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileService.getMyProfile();
      setProfile(response.profile);
      setEditData(response.profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      // Students can only edit limited fields
      const updates = {
        phone: editData.phone,
        address: editData.address
      };
      
      await profileService.updateProfile(profile._id, updates);
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...profile });
  };

  const handleInputChange = (field, value) => {
    if (field === 'address' && typeof editData.address === 'object' && editData.address !== null) {
      // If address is currently an object, convert the string value back to object format
      // For simplicity, we'll store it as a string when editing
      setEditData({ ...editData, [field]: value });
    } else {
      setEditData({ ...editData, [field]: value });
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName) return "S";
    const initials = `${firstName[0]}${lastName ? lastName[0] : ''}`;
    return initials.toUpperCase();
  };

  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [address.street, address.city, address.state, address.country].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Not provided';
    }
    return 'Not provided';
  };

  const getAddressForEdit = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [address.street, address.city, address.state, address.country].filter(Boolean);
      return parts.join(', ');
    }
    return '';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3" 
            onClick={fetchProfile}
          >
            Retry
          </button>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          Profile not found
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-person-badge me-2"></i>
            My Profile
          </span>
          <button 
            className="btn btn-outline-light btn-sm" 
            onClick={() => navigate('/dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5">
        {/* Header with Actions */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">My Profile</h2>
            <p className="text-muted mb-0">View and manage your personal information</p>
          </div>
          <div className="d-flex gap-2">
            {!editing ? (
              <button className="btn btn-primary" onClick={handleEdit}>
                <i className="bi bi-pencil me-2"></i>
                Edit Profile
              </button>
            ) : (
              <>
                <button className="btn btn-success" onClick={handleSave}>
                  <i className="bi bi-check-lg me-2"></i>
                  Save Changes
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="row">
          {/* Left Column - Profile Card */}
          <div className="col-lg-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center py-4">
                <div 
                  className="rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(profile.firstName, profile.lastName)}
                </div>
                <h4 className="mb-1">{profile.firstName} {profile.lastName}</h4>
                <p className="text-muted mb-2">{profile.userId?.email}</p>
                <span className="badge bg-success fs-6">Student</span>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-secondary text-white px-3 py-2">
                <h6 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Quick Information
                </h6>
              </div>
              <div className="card-body py-2 px-3">
                {/* Roll Number */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted me-2">Roll Number:</span>
                  <span className="badge bg-primary px-3 py-1 fs-6">
                    {profile.academic?.rollNumber || 'N/A'}
                  </span>
                </div>

                {/* Class */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted me-2">Class:</span>
                  <span className="badge bg-info px-3 py-1 fs-6">
                    {profile.academic?.currentGrade || 'N/A'}
                  </span>
                </div>

                {/* Section */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted me-2">Section:</span>
                  <span className="badge bg-warning text-dark px-3 py-1 fs-6">
                    {profile.academic?.section || 'N/A'}
                  </span>
                </div>

                {/* Admission Date */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted me-2">Admission Date:</span>
                  <span className="fw-bold">
                    {profile.academic?.admissionDate
                      ? new Date(profile.academic.admissionDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="col-lg-8">
            {/* Basic Information */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Basic Information
                </h5>
              </div>
              <div className="card-body p-2">
                <div className="row g-1">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-0 fw-medium" style={{minWidth: '85px'}}>First Name:</span>
                      <span className="fw-bold">{profile.firstName}</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-0 fw-medium" style={{minWidth: '85px'}}>Last Name:</span>
                      <span className="fw-bold">{profile.lastName}</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-0 fw-medium" style={{minWidth: '85px'}}>Date of Birth:</span>
                      <span className="fw-bold">
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-0 fw-medium" style={{minWidth: '85px'}}>Gender:</span>
                      <span className="fw-bold text-capitalize">{profile.gender || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-0 fw-medium" style={{minWidth: '85px'}}>Blood Group:</span>
                      <span className="fw-bold">{profile.bloodGroup || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-success text-white py-2 px-3">
                <h5 className="mb-0 d-flex align-items-center">
                  <i className="bi bi-telephone me-2"></i>
                  Contact Information
                </h5>
              </div>

              <div className="card-body p-2">
                <div className="row g-1">
                  {/* Email */}
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span className="text-muted me-0 fw-medium" style={{ minWidth: '55px' }}>
                        Email:
                      </span>
                      <span className="fw-bold text-truncate">
                        {profile.userId?.email || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-md-6">
                    {editing ? (
                      <div>
                        <label className="form-label fw-bold mb-0 ps-1" htmlFor="phone">Phone</label>
                        <input
                          id="phone"
                          type="tel"
                          className="form-control form-control-sm mt-0"
                          value={editData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="d-flex align-items-center">
                        <span className="text-muted me-0 fw-medium" style={{ minWidth: '55px' }}>
                          Phone:
                        </span>
                        <span className="fw-bold text-truncate">
                          {profile.phone || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="col-12">
                    {editing ? (
                      <div>
                        <label className="form-label fw-bold mb-0 ps-1" htmlFor="address">Address</label>
                        <textarea
                          id="address"
                          className="form-control form-control-sm mt-0"
                          rows="2"
                          value={getAddressForEdit(editData.address)}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="text-muted me-0 fw-medium" style={{ minWidth: '55px', display: 'inline-block' }}>
                          Address:
                        </span>
                        <span className="fw-bold d-block mt-0">
                          {formatAddress(profile.address)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Information */}
            {profile.feeInfo ? (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-cash-stack me-2"></i>
                    Fee Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {/* Fee Summary */}
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-primary">
                            Fee Summary
                          </h6>
                          
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold">Total Fee:</span>
                            <span className="badge bg-info fs-6">
                              Rs {(profile.feeInfo.totalFee || 0).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold">Paid Amount:</span>
                            <span className="badge bg-success fs-6">
                              Rs {(profile.feeInfo.paidAmount || 0).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-bold">Pending Amount:</span>
                            <span className="badge bg-danger fs-6">
                              Rs {(profile.feeInfo.pendingAmount || 0).toLocaleString()}
                            </span>
                          </div>
                          
                          <hr />
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Payment Status:</span>
                            <span className={`badge fs-6 ${
                              profile.feeInfo.pendingAmount <= 0 && profile.feeInfo.totalFee > 0 ? 'bg-success' :
                              profile.feeInfo.paidAmount > 0 && profile.feeInfo.pendingAmount > 0 ? 'bg-warning' :
                              profile.feeInfo.totalFee > 0 ? 'bg-danger' : 'bg-secondary'
                            }`}>
                              {profile.feeInfo.pendingAmount <= 0 && profile.feeInfo.totalFee > 0 ? 'Fully Paid' :
                               profile.feeInfo.paidAmount > 0 && profile.feeInfo.pendingAmount > 0 ? 'Partially Paid' :
                               profile.feeInfo.totalFee > 0 ? 'Pending' : 'No Fee Set'}
                            </span>
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
                          
                          {profile.feeInfo.totalFee > 0 ? (
                            <>
                              {profile.feeInfo.tuitionFee > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span>Tuition Fee:</span>
                                  <span>Rs {profile.feeInfo.tuitionFee.toLocaleString()}</span>
                                </div>
                              )}
                              {profile.feeInfo.admissionFee > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span>Admission Fee:</span>
                                  <span>Rs {profile.feeInfo.admissionFee.toLocaleString()}</span>
                                </div>
                              )}
                              {profile.feeInfo.examFee > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span>Exam Fee:</span>
                                  <span>Rs {profile.feeInfo.examFee.toLocaleString()}</span>
                                </div>
                              )}
                              {profile.feeInfo.libraryFee > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span>Library Fee:</span>
                                  <span>Rs {profile.feeInfo.libraryFee.toLocaleString()}</span>
                                </div>
                              )}
                              {profile.feeInfo.sportsFee > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span>Sports Fee:</span>
                                  <span>Rs {profile.feeInfo.sportsFee.toLocaleString()}</span>
                                </div>
                              )}
                              {profile.feeInfo.otherFees > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span>Other Fees:</span>
                                  <span>Rs {profile.feeInfo.otherFees.toLocaleString()}</span>
                                </div>
                              )}
                              
                              {profile.feeInfo.dueDate && (
                                <div className="mt-2 pt-2 border-top">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Due Date:</span>
                                    <span className="badge bg-warning text-dark">
                                      {new Date(profile.feeInfo.dueDate).toLocaleDateString()}
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
                    {profile.feeInfo.feeHistory && profile.feeInfo.feeHistory.length > 0 && (
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
                                  {profile.feeInfo.feeHistory.slice(-3).reverse().map((payment, index) => (
                                    <tr key={index}>
                                      <td>
                                        <small>{new Date(payment.paymentDate).toLocaleDateString()}</small>
                                      </td>
                                      <td>
                                        <span className="badge bg-success">
                                          Rs {payment.amount.toLocaleString()}
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
                            {profile.feeInfo.feeHistory.length > 3 && (
                              <small className="text-muted">
                                Showing last 3 payments. Total payments: {profile.feeInfo.feeHistory.length}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-cash-stack me-2"></i>
                    Fee Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="text-center text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    No fee information available
                  </div>
                </div>
              </div>
            )}

            {/* Student Achievements */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-trophy me-2"></i>
                  My Achievements
                </h5>
              </div>
              <div className="card-body">
                <AchievementSection
                  profile={profile}
                  currentUser={currentUser}
                  onUpdate={fetchProfile}
                />
              </div>
            </div>

            {/* Past Results */}
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-graph-up me-2"></i>
                  My Results
                </h5>
              </div>
              <div className="card-body">
                <ResultsSection studentId={profile._id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;