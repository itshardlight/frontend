import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TokenDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTokenStatus();
  }, []);

  const checkTokenStatus = async () => {
    try {
      setLoading(true);
      
      // Get token and user from localStorage
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      const info = {
        hasToken: !!token,
        hasUserData: !!userData,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 50) + '...' : 'No token',
        userData: userData ? JSON.parse(userData) : null,
        timestamp: new Date().toLocaleString()
      };

      // Try to decode token
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            info.tokenPayload = {
              userId: payload.userId,
              issuedAt: new Date(payload.iat * 1000).toLocaleString(),
              expiresAt: new Date(payload.exp * 1000).toLocaleString(),
              isExpired: payload.exp < (Date.now() / 1000)
            };
          }
        } catch (e) {
          info.tokenDecodeError = e.message;
        }
      }

      // Test API call
      if (token) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/profiles/me/profile`,
            { 
              headers: { 
                'Authorization': `Bearer ${token}` 
              } 
            }
          );
          info.apiTest = {
            success: true,
            profileName: response.data.profile?.fullName || 'Unknown'
          };
        } catch (error) {
          info.apiTest = {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status
          };
        }
      }

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      // Try to login again to get a fresh token
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/login`,
        {
          username: 'manish',
          password: 'manish@11A891'
        }
      );

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('Token refreshed successfully!');
        checkTokenStatus();
      }
    } catch (error) {
      alert('Failed to refresh token: ' + (error.response?.data?.message || error.message));
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Storage cleared!');
    checkTokenStatus();
  };

  if (loading) {
    return <div className="alert alert-info">Checking token status...</div>;
  }

  return (
    <div className="card mt-3">
      <div className="card-header bg-warning">
        <h5 className="mb-0">🔍 Token Debug Information</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6>Storage Status:</h6>
            <ul className="list-unstyled">
              <li>Has Token: <span className={debugInfo.hasToken ? 'text-success' : 'text-danger'}>{debugInfo.hasToken ? '✅' : '❌'}</span></li>
              <li>Has User Data: <span className={debugInfo.hasUserData ? 'text-success' : 'text-danger'}>{debugInfo.hasUserData ? '✅' : '❌'}</span></li>
              <li>Token Length: {debugInfo.tokenLength}</li>
            </ul>
            
            {debugInfo.userData && (
              <>
                <h6>User Data:</h6>
                <ul className="list-unstyled">
                  <li>Username: {debugInfo.userData.username}</li>
                  <li>Role: {debugInfo.userData.role}</li>
                  <li>Email: {debugInfo.userData.email}</li>
                </ul>
              </>
            )}
          </div>
          
          <div className="col-md-6">
            {debugInfo.tokenPayload && (
              <>
                <h6>Token Info:</h6>
                <ul className="list-unstyled">
                  <li>User ID: {debugInfo.tokenPayload.userId}</li>
                  <li>Issued: {debugInfo.tokenPayload.issuedAt}</li>
                  <li>Expires: {debugInfo.tokenPayload.expiresAt}</li>
                  <li>Is Expired: <span className={debugInfo.tokenPayload.isExpired ? 'text-danger' : 'text-success'}>
                    {debugInfo.tokenPayload.isExpired ? '❌ YES' : '✅ NO'}
                  </span></li>
                </ul>
              </>
            )}
            
            {debugInfo.apiTest && (
              <>
                <h6>API Test:</h6>
                <ul className="list-unstyled">
                  <li>Success: <span className={debugInfo.apiTest.success ? 'text-success' : 'text-danger'}>
                    {debugInfo.apiTest.success ? '✅' : '❌'}
                  </span></li>
                  {debugInfo.apiTest.success ? (
                    <li>Profile: {debugInfo.apiTest.profileName}</li>
                  ) : (
                    <>
                      <li>Error: {debugInfo.apiTest.error}</li>
                      <li>Status: {debugInfo.apiTest.status}</li>
                    </>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <button className="btn btn-primary me-2" onClick={checkTokenStatus}>
            🔄 Refresh Check
          </button>
          <button className="btn btn-success me-2" onClick={refreshToken}>
            🔑 Get Fresh Token
          </button>
          <button className="btn btn-danger" onClick={clearStorage}>
            🗑️ Clear Storage
          </button>
        </div>
        
        <div className="mt-3">
          <small className="text-muted">Last checked: {debugInfo.timestamp}</small>
        </div>
      </div>
    </div>
  );
};

export default TokenDebugger;