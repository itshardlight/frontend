import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
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
    if (!userData) {
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
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.fullName || !formData.username || !formData.email) {
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
      case "admin": return "badge-admin";
      case "teacher": return "badge-teacher";
      case "student": return "badge-student";
      case "parent": return "badge-parent";
      case "fee_department": return "badge-fee-department";
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
