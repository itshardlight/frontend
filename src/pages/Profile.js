import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showFeeSection, setShowFeeSection] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        fullName: parsedUser.fullName || "",
        username: parsedUser.username,
        email: parsedUser.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Fetch detailed profile information
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
      // Don't show error for missing profile - it's optional
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username || !formData.email) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/profile/${user.id}`,
        {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All password fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/change-password/${user.id}`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      );

      if (response.data.success) {
        setSuccess("Password changed successfully!");
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin": return "bg-danger";
      case "teacher": return "bg-primary";
      case "student": return "bg-success";
      case "parent": return "bg-info";
      case "fee_department": return "bg-warning";
      default: return "bg-secondary";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">Student Management System</span>
          <button 
            className="btn btn-outline-light btn-sm" 
            onClick={() => navigate("/dashboard")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Profile Container */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Profile Header */}
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center py-4">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.username}
                    className="rounded-circle mb-3"
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      objectFit: 'cover',
                      border: '4px solid #f0f0f0'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="profile-avatar mb-3"
                  style={{ 
                    display: user.profilePicture ? 'none' : 'flex',
                    width: '120px',
                    height: '120px',
                    margin: '0 auto',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '50%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(user.username)}
                </div>
                <h3 className="mb-1">{user.username}</h3>
                <p className="text-muted mb-2">{user.email}</p>
                <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Alert Messages */}
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Profile Information Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Profile Information</h5>
                {!isEditing && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit Profile
                  </button>
                )}
              </div>
              <div className="card-body">
                {!isEditing ? (
                  <div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Username:</strong>
                      </div>
                      <div className="col-md-8">
                        {user.username}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Email:</strong>
                      </div>
                      <div className="col-md-8">
                        {user.email}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Role:</strong>
                      </div>
                      <div className="col-md-8">
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <strong>User ID:</strong>
                      </div>
                      <div className="col-md-8">
                        <code>{user.id}</code>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        className="form-control"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            ...formData,
                            username: user.username,
                            email: user.email
                          });
                          setError("");
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Change Password Card - Collapsible */}
            <div className="card shadow-sm mb-4">
              <div 
                className="card-header bg-white d-flex justify-content-between align-items-center" 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                <h5 className="mb-0">Change Password</h5>
                <i className={`bi bi-chevron-${showPasswordSection ? 'up' : 'down'}`}></i>
              </div>
              {showPasswordSection && (
                <div className="card-body">
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        className="form-control"
                        placeholder="Enter current password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        className="form-control"
                        placeholder="Enter new password (min 6 characters)"
                        value={formData.newPassword}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Re-enter new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-warning"
                      disabled={loading}
                    >
                      {loading ? "Changing..." : "Change Password"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Fee Information Card - For Students and Parents */}
            {profile && (user.role === 'student' || user.role === 'parent') && profile.feeInfo && (
              <div className="card shadow-sm mb-4">
                <div 
                  className="card-header bg-white d-flex justify-content-between align-items-center" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowFeeSection(!showFeeSection)}
                >
                  <h5 className="mb-0">
                    <i className="bi bi-cash-stack me-2"></i>
                    Fee Information
                    {(profile.firstName && profile.lastName) ? (
                      <small className="text-muted ms-2">
                        - {profile.firstName} {profile.lastName}
                      </small>
                    ) : user.fullName ? (
                      <small className="text-muted ms-2">
                        - {user.fullName}
                      </small>
                    ) : (
                      <small className="text-muted ms-2">
                        - {user.username}
                      </small>
                    )}
                  </h5>
                  <i className={`bi bi-chevron-${showFeeSection ? 'up' : 'down'}`}></i>
                </div>
                {showFeeSection && (
                  <div className="card-body">
                    {/* Student Info Header */}
                    <div className="alert alert-info mb-3">
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Student:</strong> {
                            (profile.firstName && profile.lastName) 
                              ? `${profile.firstName} ${profile.lastName}`
                              : user.fullName || user.username
                          }
                        </div>
                        <div className="col-md-6">
                          {profile.academic && (
                            <>
                              <strong>Class:</strong> {profile.academic.currentGrade}-{profile.academic.section}
                              {profile.academic.rollNumber && (
                                <span className="ms-2">
                                  <strong>Roll:</strong> {profile.academic.rollNumber}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card bg-light mb-3">
                          <div className="card-body">
                            <h6 className="card-title text-primary">
                              <i className="bi bi-currency-rupee me-1"></i>
                              Fee Summary
                            </h6>
                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>Total Fee:</strong>
                              </div>
                              <div className="col-6 text-end">
                                ₹{(profile.feeInfo.totalFee || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>Paid Amount:</strong>
                              </div>
                              <div className="col-6 text-end text-success">
                                ₹{(profile.feeInfo.paidAmount || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>Pending Amount:</strong>
                              </div>
                              <div className="col-6 text-end text-danger">
                                ₹{(profile.feeInfo.pendingAmount || 0).toLocaleString()}
                              </div>
                            </div>
                            <hr />
                            <div className="row">
                              <div className="col-6">
                                <strong>Payment Status:</strong>
                              </div>
                              <div className="col-6 text-end">
                                {(() => {
                                  const pending = profile.feeInfo.pendingAmount || 0;
                                  const paid = profile.feeInfo.paidAmount || 0;
                                  const total = profile.feeInfo.totalFee || 0;
                                  
                                  if (pending <= 0 && total > 0) {
                                    return <span className="badge bg-success">Fully Paid</span>;
                                  } else if (paid > 0 && pending > 0) {
                                    return <span className="badge bg-warning">Partially Paid</span>;
                                  } else if (paid === 0 && total > 0) {
                                    return <span className="badge bg-danger">Pending</span>;
                                  } else {
                                    return <span className="badge bg-secondary">No Fee Set</span>;
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="card bg-light mb-3">
                          <div className="card-body">
                            <h6 className="card-title text-info">
                              <i className="bi bi-pie-chart me-1"></i>
                              Fee Breakdown
                            </h6>
                            {profile.feeInfo.tuitionFee > 0 && (
                              <div className="row mb-1">
                                <div className="col-8">Tuition Fee:</div>
                                <div className="col-4 text-end">₹{profile.feeInfo.tuitionFee.toLocaleString()}</div>
                              </div>
                            )}
                            {profile.feeInfo.admissionFee > 0 && (
                              <div className="row mb-1">
                                <div className="col-8">Admission Fee:</div>
                                <div className="col-4 text-end">₹{profile.feeInfo.admissionFee.toLocaleString()}</div>
                              </div>
                            )}
                            {profile.feeInfo.examFee > 0 && (
                              <div className="row mb-1">
                                <div className="col-8">Exam Fee:</div>
                                <div className="col-4 text-end">₹{profile.feeInfo.examFee.toLocaleString()}</div>
                              </div>
                            )}
                            {profile.feeInfo.libraryFee > 0 && (
                              <div className="row mb-1">
                                <div className="col-8">Library Fee:</div>
                                <div className="col-4 text-end">₹{profile.feeInfo.libraryFee.toLocaleString()}</div>
                              </div>
                            )}
                            {profile.feeInfo.sportsFee > 0 && (
                              <div className="row mb-1">
                                <div className="col-8">Sports Fee:</div>
                                <div className="col-4 text-end">₹{profile.feeInfo.sportsFee.toLocaleString()}</div>
                              </div>
                            )}
                            {profile.feeInfo.otherFees > 0 && (
                              <div className="row mb-1">
                                <div className="col-8">Other Fees:</div>
                                <div className="col-4 text-end">₹{profile.feeInfo.otherFees.toLocaleString()}</div>
                              </div>
                            )}
                            {profile.feeInfo.dueDate && (
                              <div className="row mt-2 pt-2 border-top">
                                <div className="col-8">
                                  <strong>Due Date:</strong>
                                </div>
                                <div className="col-4 text-end">
                                  <strong>{new Date(profile.feeInfo.dueDate).toLocaleDateString()}</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment History */}
                    {profile.feeInfo.feeHistory && profile.feeInfo.feeHistory.length > 0 && (
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title text-success">
                            <i className="bi bi-clock-history me-1"></i>
                            Payment History
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
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
                                {profile.feeInfo.feeHistory.slice(-5).reverse().map((payment, index) => (
                                  <tr key={index}>
                                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                    <td className="text-success">₹{payment.amount.toLocaleString()}</td>
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
                          {profile.feeInfo.feeHistory.length > 5 && (
                            <small className="text-muted">
                              Showing last 5 payments. Total payments: {profile.feeInfo.feeHistory.length}
                            </small>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Academic Information Card - For Students */}
            {profile && user.role === 'student' && profile.academic && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-mortarboard me-2"></i>
                    Academic Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Class:</strong> {profile.academic.currentGrade || 'Not Set'}
                      </div>
                      <div className="mb-3">
                        <strong>Section:</strong> {profile.academic.section || 'Not Set'}
                      </div>
                      <div className="mb-3">
                        <strong>Roll Number:</strong> {profile.academic.rollNumber || 'Not Assigned'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      {profile.academic.admissionDate && (
                        <div className="mb-3">
                          <strong>Admission Date:</strong> {new Date(profile.academic.admissionDate).toLocaleDateString()}
                        </div>
                      )}
                      {profile.academic.previousSchool && (
                        <div className="mb-3">
                          <strong>Previous School:</strong> {profile.academic.previousSchool}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Card */}
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="mb-3">Account Actions</h5>
                <button 
                  className="btn btn-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
