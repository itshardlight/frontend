import React, { useState } from 'react';
import axios from 'axios';

const QuickLogin = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleQuickLogin = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/login`,
        {
          username: 'manish',
          password: 'manish@11A891'
        }
      );

      if (response.data.success) {
        // Store new token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setMessage('✅ Login successful! Token refreshed.');
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Reload the page to refresh all components
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage('❌ Login failed: ' + response.data.message);
      }
    } catch (error) {
      setMessage('❌ Login error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-3">
      <div className="card-header bg-info text-white">
        <h6 className="mb-0">🔑 Quick Login Fix</h6>
      </div>
      <div className="card-body">
        <p className="mb-3">If you're seeing token expired errors, click below to get a fresh token:</p>
        
        <button 
          className="btn btn-success"
          onClick={handleQuickLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Logging in...
            </>
          ) : (
            <>
              🔄 Refresh Login (manish)
            </>
          )}
        </button>
        
        {message && (
          <div className={`alert mt-3 ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickLogin;