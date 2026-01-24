import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * PaymentSuccess Component
 * Handles successful payment callback from eSewa
 */
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get parameters from URL
        const oid = searchParams.get('oid'); // Transaction UUID
        const amt = searchParams.get('amt'); // Amount
        const refId = searchParams.get('refId'); // eSewa reference ID

        if (!oid || !amt || !refId) {
          throw new Error('Missing payment verification parameters');
        }

        // Verify payment with your backend
        const response = await axios.post('/api/payment/esewa/verify', {
          transactionUuid: oid,
          amount: amt,
          referenceId: refId
        });

        if (response.data.success) {
          setPaymentDetails(response.data.payment);
          setVerificationStatus('success');
        } else {
          throw new Error(response.data.message || 'Payment verification failed');
        }

      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.message);
        setVerificationStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    // Navigate back to dashboard or appropriate page
    navigate('/dashboard');
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center p-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Verifying Payment</h5>
                <p className="text-muted">Please wait while we verify your payment...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-body text-center p-5">
                <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
                <h4 className="text-danger mt-3">Payment Verification Failed</h4>
                <p className="text-muted">{error}</p>
                <div className="mt-4">
                  <button 
                    className="btn btn-outline-primary me-2"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                  >
                    Retry Verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-success">
            <div className="card-body text-center p-5">
              <i className="bi bi-check-circle text-success" style={{ fontSize: '4rem' }}></i>
              <h4 className="text-success mt-3">Payment Successful!</h4>
              <p className="text-muted">Your payment has been processed successfully.</p>
              
              {paymentDetails && (
                <div className="mt-4">
                  <div className="row text-start">
                    <div className="col-6"><strong>Transaction ID:</strong></div>
                    <div className="col-6">{paymentDetails.transactionUuid}</div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6"><strong>Amount:</strong></div>
                    <div className="col-6">Rs. {paymentDetails.amount}</div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6"><strong>Reference ID:</strong></div>
                    <div className="col-6">{paymentDetails.referenceId}</div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6"><strong>Date:</strong></div>
                    <div className="col-6">
                      {new Date(paymentDetails.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={handleContinue}
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;