import React, { useState, useEffect } from 'react';
import axios from 'axios';
import crypto from 'crypto-js';

/**
 * Simple eSewa Payment Form - Matches eSewa's exact format
 */
const EsewaPaymentForm = ({
  studentId,
  feeType,
  amount,
  taxAmount = 0,
  description = 'Fee Payment',
  successUrl = `${window.location.origin}/payment/success`,
  failureUrl = `${window.location.origin}/payment/failure`,
  isProduction = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Calculate total amount (keep as simple numbers, not paisa)
  const totalAmount = amount + taxAmount;

  /**
   * Generate eSewa signature
   */
  const generateSignature = (totalAmount, transactionUuid, productCode, secretKey) => {
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hash = crypto.HmacSHA256(message, secretKey);
    return crypto.enc.Base64.stringify(hash);
  };

  /**
   * Initialize payment data from backend
   */
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to make payment');
        }

        if (!studentId || !amount || amount <= 0) {
          throw new Error('Invalid payment parameters');
        }

        console.log('Initializing payment:', { studentId, feeType, amount, taxAmount });
        
        // Get payment configuration from backend
        const response = await axios.post('http://localhost:5000/api/payment/esewa/initialize', {
          studentId: String(studentId),
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

        const { secretKey, transactionUuid, productCode } = response.data;
        
        // Generate signature
        const signature = generateSignature(totalAmount, transactionUuid, productCode, secretKey);
        
        // Prepare form data exactly like eSewa format
        const formData = {
          amount: amount.toString(),
          tax_amount: taxAmount.toString(),
          total_amount: totalAmount.toString(),
          transaction_uuid: transactionUuid,
          product_code: productCode,
          product_service_charge: '0',
          product_delivery_charge: '0',
          success_url: successUrl,
          failure_url: failureUrl,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature: signature
        };

        setPaymentData(formData);
        setError(null);
        
      } catch (err) {
        console.error('Payment initialization failed:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && feeType && amount) {
      initializePayment();
    } else {
      setError('Missing required payment information');
      setLoading(false);
    }
  }, [studentId, feeType, amount, taxAmount, totalAmount, successUrl, failureUrl, description]);

  /**
   * Handle retry
   */
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setPaymentData(null);
    // This will trigger useEffect to re-initialize
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h6>Payment Error</h6>
        <p>{error}</p>
        <button className="btn btn-outline-danger btn-sm" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  // Payment form - exactly like eSewa format
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
            <div className="col-sm-6"><strong>Description:</strong></div>
            <div className="col-sm-6">{description}</div>
          </div>
          
          <div className="row mb-3">
            <div className="col-sm-6"><strong>Amount:</strong></div>
            <div className="col-sm-6">Rs. {amount.toFixed(2)}</div>
          </div>
          
          {taxAmount > 0 && (
            <div className="row mb-3">
              <div className="col-sm-6"><strong>Tax:</strong></div>
              <div className="col-sm-6">Rs. {taxAmount.toFixed(2)}</div>
            </div>
          )}
          
          <div className="row mb-4">
            <div className="col-sm-6"><strong>Total Amount:</strong></div>
            <div className="col-sm-6"><strong>Rs. {totalAmount.toFixed(2)}</strong></div>
          </div>

          {/* eSewa Payment Form - Exact Format */}
          <form 
            action={isProduction ? "https://epay.esewa.com.np/api/epay/main/v2/form" : "https://rc-epay.esewa.com.np/api/epay/main/v2/form"} 
            method="POST"
          >
            <input type="hidden" name="amount" value={paymentData.amount} />
            <input type="hidden" name="tax_amount" value={paymentData.tax_amount} />
            <input type="hidden" name="total_amount" value={paymentData.total_amount} />
            <input type="hidden" name="transaction_uuid" value={paymentData.transaction_uuid} />
            <input type="hidden" name="product_code" value={paymentData.product_code} />
            <input type="hidden" name="product_service_charge" value={paymentData.product_service_charge} />
            <input type="hidden" name="product_delivery_charge" value={paymentData.product_delivery_charge} />
            <input type="hidden" name="success_url" value={paymentData.success_url} />
            <input type="hidden" name="failure_url" value={paymentData.failure_url} />
            <input type="hidden" name="signed_field_names" value={paymentData.signed_field_names} />
            <input type="hidden" name="signature" value={paymentData.signature} />
            
            <div className="d-grid">
              <button type="submit" className="btn btn-success btn-lg">
                <i className="bi bi-credit-card me-2"></i>
                Pay with eSewa
              </button>
            </div>
          </form>
          
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