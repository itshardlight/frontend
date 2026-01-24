import React, { useState } from 'react';
import EsewaPaymentForm from './EsewaPaymentForm';

/**
 * Simple test component for payment functionality
 */
const PaymentTest = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [testUser, setTestUser] = useState(null);

  // Simulate getting user from localStorage
  const loadTestUser = () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const user = JSON.parse(userData);
      setTestUser(user);
      console.log('Test user loaded:', user);
    } else {
      alert('Please login first to test payment');
    }
  };

  const handlePaymentSuccess = () => {
    alert('Payment successful!');
    setShowPayment(false);
  };

  const handlePaymentError = (error) => {
    alert(`Payment error: ${error.message}`);
    console.error('Payment error:', error);
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h4>Payment Test Component</h4>
        </div>
        <div className="card-body">
          {!testUser ? (
            <div>
              <p>Load user data to test payment:</p>
              <button className="btn btn-primary" onClick={loadTestUser}>
                Load User Data
              </button>
            </div>
          ) : (
            <div>
              <div className="alert alert-info">
                <strong>Test User:</strong> {testUser.username || testUser.fullName}
                <br />
                <strong>User ID:</strong> {testUser._id || testUser.id}
                <br />
                <strong>Role:</strong> {testUser.role}
              </div>
              
              {!showPayment ? (
                <button 
                  className="btn btn-success"
                  onClick={() => setShowPayment(true)}
                >
                  Test Payment (Rs. 1000)
                </button>
              ) : (
                <div>
                  <button 
                    className="btn btn-secondary mb-3"
                    onClick={() => setShowPayment(false)}
                  >
                    ← Back
                  </button>
                  
                  <EsewaPaymentForm
                    studentId={testUser._id || testUser.id}
                    feeType="tuition"
                    amount={1000}
                    taxAmount={0}
                    description={`Test Payment - ${testUser.username || testUser.fullName}`}
                    successUrl={`${window.location.origin}/payment/success`}
                    failureUrl={`${window.location.origin}/payment/failure`}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    isProduction={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;