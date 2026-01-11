import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsManagement from '../components/ResultsManagement';

const ResultsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user has permission to access results
    if (!['admin', 'teacher'].includes(userRole)) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/dashboard">
            <i className="bi bi-mortarboard-fill me-2"></i>
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
        <ResultsManagement />
      </div>
    </div>
  );
};

export default ResultsPage;