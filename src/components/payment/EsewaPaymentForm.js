import React, { useState, useEffect } from 'react';
import EsewaPaymentButton from './EsewaPaymentButton';
import axios from 'axios';

/**
 * EsewaPaymentForm Component
 * A complete payment form that handles secret key retrieval from backend
 */
const EsewaPaymentForm = ({
  // Payment details
  studentId,
  feeType,
  amount,
  taxAmount = 0,
  description = 'Fee Payment',
  
  // URLs
  successUrl = `${window.location.origin}/payment/success`,
  failureUrl = `${window.location.origin}/payment/failure`,
  
  // Configuration
  isProduction = false,
  
  // Callbacks
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentError
}) => {
  const [secretKey, setSecretKey] = useState(null);
  const [transactionUuid, setTransactionUuid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Calculate total amount
  const totalAmount = amount + taxAmount;

  /**
   * Initialize payment data from backend
   */
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found. Please login again.');
        }

        // Validate required parameters
        if (!studentId) {
          throw new Error('Student ID is required for payment initialization');
        }
        
        if (!amount || amount <= 0) {
          throw new Error('Valid payment amount is required');
        }

        console.log('Initializing payment with:', {
          studentId,
          feeType,
          amount,
          taxAmount,
          description
        });
        
        // Call your backend API to get payment configuration
        const response = await axios.post('http://localhost:5000/api/payment/esewa/initialize', {
          studentId: String(studentId), // Ensure studentId is a string
          feeType,
          amount: Number(amount),
          taxAmount: Number(taxAmount || 0),
          description
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Payment initialization response:', response.data);

        const { secretKey, transactionUuid } = response.data;
        
        setSecretKey(secretKey);
        setTransactionUuid(transactionUuid);
        setError(null);
        
      } catch (err) {
        console.error('Failed to initialize payment:', err);
        
        // More detailed error handling
        if (err.response) {
          // Server responded with error status
          console.error('Server error response:', err.response.data);
          const errorMessage = err.response.data?.message || 'Server error occurred';
          setError(`Payment initialization failed: ${errorMessage}`);
        } else if (err.request) {
          // Request was made but no response received
          console.error('No response received:', err.request);
          setError('Unable to connect to payment server. Please check your internet connection and try again.');
        } else {
          // Something else happened
          console.error('Request setup error:', err.message);
          setError(`Payment initialization error: ${err.message}`);
        }

        // Auto-retry for specific errors
        if (err.response?.data?.shouldRetry && retryCount < maxRetries) {
          console.log(`Auto-retrying payment initialization (attempt ${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            // This will trigger useEffect again
            setError(null);
            setLoading(true);
          }, 1000);
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    if (studentId && feeType && amount) {
      console.log('Payment form parameters:', {
        studentId,
        feeType,
        amount,
        taxAmount,
        description,
        hasToken: !!localStorage.getItem('token')
      });
      initializePayment();
    } else {
      console.error('Missing required payment parameters:', { 
        studentId: !!studentId, 
        feeType: !!feeType, 
        amount: !!amount,
        actualValues: { studentId, feeType, amount }
      });
      setError('Missing required payment information. Please refresh the page and try again.');
      setLoading(false);
    }
  }, [studentId, feeType, amount, taxAmount, description, retryCount]);

  /**
   * Handle payment start
   */
  const handlePaymentStart = () => {
    console.log('Payment started for transaction:', transactionUuid);
  };

  /**
   * Handle manual retry
   */
  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    setSecretKey(null);
    setTransactionUuid(null);
    
    try {
      const token = localStorage.getItem('token');
      if (token && studentId) {
        // Clean up old pending transactions first
        console.log('Cleaning up old transactions before retry...');
        await axios.delete(`http://localhost:5000/api/payment/cleanup/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Cleanup completed, retrying payment initialization...');
      }
    } catch (cleanupError) {
      console.warn('Cleanup failed, but continuing with retry:', cleanupError.message);
    }
    
    // Force re-initialization after cleanup
    setTimeout(() => {
      // Trigger useEffect by updating a dependency
      setRetryCount(prev => prev + 1);
    }, 500);
  };

  /**
   * Handle payment error
   */
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h6>Payment Initialization Error</h6>
        <p>{error}</p>
        <button 
          className="btn btn-outline-danger btn-sm me-2"
          onClick={handleRetry}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Retry
        </button>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="esewa-payment-form">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-credit-card me-2"></i>
            Payment Details
          </h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-sm-6">
              <strong>Description:</strong>
            </div>
            <div className="col-sm-6">
              {description}
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-sm-6">
              <strong>Amount:</strong>
            </div>
            <div className="col-sm-6">
              Rs. {amount.toFixed(2)}
            </div>
          </div>
          
          {taxAmount > 0 && (
            <div className="row mb-3">
              <div className="col-sm-6">
                <strong>Tax:</strong>
              </div>
              <div className="col-sm-6">
                Rs. {taxAmount.toFixed(2)}
              </div>
            </div>
          )}
          
          <div className="row mb-4">
            <div className="col-sm-6">
              <strong>Total Amount:</strong>
            </div>
            <div className="col-sm-6">
              <strong>Rs. {totalAmount.toFixed(2)}</strong>
            </div>
          </div>

          <div className="d-grid">
            <EsewaPaymentButton
              amount={amount}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
              transactionUuid={transactionUuid}
              productCode={isProduction ? 'EPAY' : 'EPAYTEST'}
              successUrl={successUrl}
              failureUrl={failureUrl}
              secretKey={secretKey}
              isProduction={isProduction}
              buttonText="Pay with eSewa"
              buttonClassName="btn btn-success btn-lg"
              onPaymentStart={handlePaymentStart}
              onError={handlePaymentError}
            />
          </div>
          
          <div className="mt-3 text-center">
            <small className="text-muted">
              You will be redirected to eSewa for secure payment processing
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EsewaPaymentForm;