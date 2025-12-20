import React, { useState } from 'react';
import axios from 'axios';
import './PasswordChangeModal.css';

const PasswordChangeModal = ({ isFirstLogin, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!isFirstLogin && !formData.currentPassword) {
      setError('Current password is required');
      return false;
    }

    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onSuccess && onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <div className="modal-header">
          <h2>
            {isFirstLogin ? 'Set Your Password' : 'Change Password'}
          </h2>
          {!isFirstLogin && (
            <button onClick={onCancel} className="btn-close">×</button>
          )}
        </div>

        <div className="modal-content">
          {isFirstLogin && (
            <div className="first-login-message">
              <p>Welcome! For security reasons, you must change your password before continuing.</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isFirstLogin && (
              <div className="form-field">
                <label>Current Password:</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            )}

            <div className="form-field">
              <label>New Password:</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                required
                minLength="6"
                autoComplete="new-password"
              />
              <small>Password must be at least 6 characters long</small>
            </div>

            <div className="form-field">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>

            <div className="form-actions">
              {!isFirstLogin && (
                <button type="button" onClick={onCancel} className="btn-cancel">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Changing...' : (isFirstLogin ? 'Set Password' : 'Change Password')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;