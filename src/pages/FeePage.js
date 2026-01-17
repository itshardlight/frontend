import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeeManagement from '../components/FeeManagement';

const FeePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Redirect fee department users to their dedicated dashboard
    if (user.role === 'fee_department') {
      navigate('/fee-department');
      return;
    }

    // Check if user has permission to access fee management (admin and fee_department)
    if (!['admin', 'fee_department'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container-fluid">
          <a className="navbar-brand" href="/dashboard">
            <i className="bi bi-cash-stack me-2"></i>
            School Management System
          </a>
          <div className="navbar-nav ms-auto">
            <button
              className="btn btn-outline-light btn-sm me-2"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-house me-1"></i>
              Dashboard
            </button>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
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
        <FeeManagement />
      </div>
    </div>
  );
};

export default FeePage;