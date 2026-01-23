import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import { AchievementSection } from '../../components/student';
import { ResultsSection, QuickLogin } from '../../components/shared';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
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
      navigate('/login');
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
      
      console.log('🔍 Fetching profile...');
      const response = await profileService.getMyProfile();
      console.log('✅ Profile fetched successfully:', response);
      
      setProfile(response.profile);
      setEditData(response.profile);
    } catch (err) {
      console.error('❌ Profile fetch error:', err);
      
      // More specific error handling
      let errorMessage = 'Failed to load profile';
      
      if (err.message === 'Token expired') {
        errorMessage = 'Your session has expired. Please login again.';
      } else if (err.message && err.message.includes('token')) {
        errorMessage = 'Authentication error: ' + err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData({ ...profile });
  };

  const handleSave = async () => {
    try {
      // Students can only update basic contact info
      const updates = {
        phone: editData.phone,
        address: editData.address
      };
      
      await profileService.updateProfile(profile._id, updates);
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...profile });
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderBasicInfo = () => (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-person-circle me-2"></i>
          Basic Information
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">Full Name:</label>
            <p className="mb-0">{profile.fullName}</p>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Date of Birth:</label>
            <p className="mb-0">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Gender:</label>
            <p className="mb-0 text-capitalize">{profile.gender}</p>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Blood Group:</label>
            <p className="mb-0">{profile.bloodGroup || 'Not specified'}</p>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Phone:</label>
            {editing ? (
              <input
                type="tel"
                className="form-control"
                value={editData.phone || ''}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
              />
            ) : (
              <p className="mb-0">{profile.phone || 'Not provided'}</p>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Email:</label>
            <p className="mb-0">{profile.userId?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="card mb-4">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="bi bi-mortarboard me-2"></i>
          Academic Information
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="fw-bold">Roll Number:</span>
              <span className="badge bg-primary fs-6">
                {profile.academic?.rollNumber || 'N/A'}
              </span>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="fw-bold">Class:</span>
              <span className="badge bg-info fs-6">
                {profile.currentClass || 'N/A'}
              </span>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="fw-bold">Admission Date:</span>
              <span>
                {profile.academic?.admissionDate ? 
                  new Date(profile.academic.admissionDate).toLocaleDateString() : 
                  'Not specified'
                }
              </span>
            </div>
          </div>
          {profile.academic?.previousSchool && (
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="fw-bold">Previous School:</span>
                <span>{profile.academic.previousSchool}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="card mb-4">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="bi bi-geo-alt me-2"></i>
          Address Information
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label fw-bold">Street Address:</label>
            {editing ? (
              <input
                type="text"
                className="form-control"
                value={editData.address?.street || ''}
                onChange={(e) => setEditData({
                  ...editData, 
                  address: {...editData.address, street: e.target.value}
                })}
              />
            ) : (
              <p className="mb-0">{profile.address?.street || 'Not provided'}</p>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold">City:</label>
            {editing ? (
              <input
                type="text"
                className="form-control"
                value={editData.address?.city || ''}
                onChange={(e) => setEditData({
                  ...editData, 
                  address: {...editData.address, city: e.target.value}
                })}
              />
            ) : (
              <p className="mb-0">{profile.address?.city || 'Not provided'}</p>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold">State:</label>
            <p className="mb-0">{profile.address?.state || 'Not provided'}</p>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold">ZIP Code:</label>
            <p className="mb-0">{profile.address?.zipCode || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderParentInfo = () => (
    <div className="card mb-4">
      <div className="card-header bg-warning text-dark">
        <h5 className="mb-0">
          <i className="bi bi-people me-2"></i>
          Parent/Guardian Information
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">Father's Name:</label>
            <p className="mb-0">{profile.parentInfo?.fatherName || 'Not provided'}</p>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Mother's Name:</label>
            <p className="mb-0">{profile.parentInfo?.motherName || 'Not provided'}</p>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Guardian's Name:</label>
            <p className="mb-0">{profile.parentInfo?.guardianName || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
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
        <QuickLogin onLoginSuccess={fetchProfile} />
        <TokenDebugger />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-fluid">
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          Your profile hasn't been created yet. Please contact the administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-person-badge me-2 text-primary"></i>
            My Profile
          </h2>
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
          <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-4">
          {/* Profile Picture Card */}
          <div className="card mb-4">
            <div className="card-body text-center py-4">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt="Profile"
                  className="rounded-circle mb-3"
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    objectFit: 'cover',
                    border: '4px solid #f0f0f0'
                  }}
                />
              ) : (
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
                  {getInitials(profile.fullName)}
                </div>
              )}
              <h4 className="mb-1">{profile.fullName}</h4>
              <p className="text-muted mb-2">{profile.userId?.email}</p>
              <span className="badge bg-success fs-6">Student</span>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h6 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Quick Stats
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Achievements:</span>
                <span className="badge bg-primary">{profile.achievements?.length || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Class:</span>
                <span className="badge bg-info">{profile.currentClass}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Roll Number:</span>
                <span className="badge bg-warning text-dark">{profile.academic?.rollNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {renderBasicInfo()}
          {renderAcademicInfo()}
          {renderAddressInfo()}
          {renderParentInfo()}
          
          {/* Achievements Section */}
          <div className="card mb-4">
            <div className="card-header bg-dark text-white">
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

          {/* Results Section */}
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                My Results
              </h5>
            </div>
            <div className="card-body">
              <ResultsSection studentId={profile?._id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;