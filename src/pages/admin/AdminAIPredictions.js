import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIPredictionDashboard } from '../../components/admin';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminAIPredictions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 h1">🤖 AI Performance Predictions</span>
          <button 
            className="btn btn-outline-light btn-sm" 
            onClick={() => navigate("/admin-panel")}
          >
            Back to Admin Panel
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <AIPredictionDashboard />
    </div>
  );
};

export default AdminAIPredictions;