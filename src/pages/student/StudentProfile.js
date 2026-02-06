import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../../components/shared/ProfileCard';
import { QuickLogin } from '../../components/shared';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    setLoading(false);
  }, [navigate]);

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
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <QuickLogin onLoginSuccess={() => window.location.reload()} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          Please login to view your profile.
        </div>
        <QuickLogin onLoginSuccess={() => window.location.reload()} />
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
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>

      {/* Use ProfileCard component - same as admin view */}
      <ProfileCard currentUser={currentUser} />
    </div>
  );
};

export default StudentProfile;
