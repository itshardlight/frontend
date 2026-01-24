import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * PaymentFailure Component
 * Handles failed payment callback from eSewa
 */
const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get failure reason from URL parameters if available
  const pid = searchParams.get('pid'); // Product ID
  const oid = searchParams.get('oid'); // Transaction UUID
  const reason = searchParams.get('reason') || 'Payment was cancelled or failed';

  const handleRetry = () => {
    // Navigate back to the payment page or fee management
    navigate('/fees');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-warning">
            <div className="card-body text-center p-5">
              <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
              <h4 className="text-warning mt-3">Payment Failed</h4>
              <p className="text-muted mb-4">
                {reason}
              </p>
              
              {oid && (
                <div className="alert alert-light">
                  <small>
                    <strong>Transaction ID:</strong> {oid}
                  </small>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-muted mb-3">
                  Don't worry! You can try again or contact support if you continue to experience issues.
                </p>
                
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={handleRetry}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Payment Again
                  </button>
                  
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handleGoToDashboard}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  If you continue to face issues, please contact our support team.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;