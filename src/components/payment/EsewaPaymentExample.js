import React, { useState } from 'react';
import { EsewaPaymentButton, EsewaPaymentForm } from './index';

/**
 * EsewaPaymentExample Component
 * Example usage of eSewa payment components
 */
const EsewaPaymentExample = () => {
  const [paymentMethod, setPaymentMethod] = useState('form'); // 'button' or 'form'

  // Example payment data
  const paymentData = {
    amount: 1000,
    taxAmount: 100,
    totalAmount: 1100,
    transactionUuid: `TXN-${Date.now()}`, // Generate unique transaction ID
    productCode: 'EPAYTEST', // Use 'EPAY' for production
    successUrl: `${window.location.origin}/payment/success`,
    failureUrl: `${window.location.origin}/payment/failure`,
    secretKey: '8gBm/:&EnhH.1/q', // This should come from environment or API
    isProduction: false
  };

  const handlePaymentStart = () => {
    console.log('Payment process started');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert(`Payment Error: ${error.message}`);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h3 className="mb-4">eSewa Payment Integration Example</h3>
          
          {/* Payment Method Selector */}
          <div className="card mb-4">
            <div className="card-body">
              <h5>Choose Payment Component:</h5>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="buttonMethod"
                  value="button"
                  checked={paymentMethod === 'button'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="buttonMethod">
                  Simple Button Component
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="formMethod"
                  value="form"
                  checked={paymentMethod === 'form'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="formMethod">
                  Complete Form Component
                </label>
              </div>
            </div>
          </div>

          {/* Simple Button Example */}
          {paymentMethod === 'button' && (
            <div className="card">
              <div className="card-header">
                <h5>Simple eSewa Payment Button</h5>
              </div>
              <div className="card-body">
                <p>This is a simple button component that handles the payment directly:</p>
                
                <div className="mb-3">
                  <strong>Payment Details:</strong>
                  <ul>
                    <li>Amount: Rs. {paymentData.amount}</li>
                    <li>Tax: Rs. {paymentData.taxAmount}</li>
                    <li>Total: Rs. {paymentData.totalAmount}</li>
                    <li>Transaction ID: {paymentData.transactionUuid}</li>
                  </ul>
                </div>

                <EsewaPaymentButton
                  amount={paymentData.amount}
                  taxAmount={paymentData.taxAmount}
                  totalAmount={paymentData.totalAmount}
                  transactionUuid={paymentData.transactionUuid}
                  productCode={paymentData.productCode}
                  successUrl={paymentData.successUrl}
                  failureUrl={paymentData.failureUrl}
                  secretKey={paymentData.secretKey}
                  isProduction={paymentData.isProduction}
                  buttonText="Pay Rs. 1,100 with eSewa"
                  buttonClassName="btn btn-success btn-lg"
                  onPaymentStart={handlePaymentStart}
                  onError={handlePaymentError}
                />
                
                <div className="mt-3">
                  <small className="text-muted">
                    <strong>Note:</strong> This will redirect you to eSewa's test environment.
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Complete Form Example */}
          {paymentMethod === 'form' && (
            <div className="card">
              <div className="card-header">
                <h5>Complete eSewa Payment Form</h5>
              </div>
              <div className="card-body">
                <p>This component handles backend integration for secret key and transaction management:</p>
                
                <EsewaPaymentForm
                  studentId="STU001"
                  feeType="tuition"
                  amount={1000}
                  taxAmount={100}
                  description="Tuition Fee Payment"
                  successUrl={paymentData.successUrl}
                  failureUrl={paymentData.failureUrl}
                  isProduction={false}
                  onPaymentSuccess={(details) => console.log('Payment successful:', details)}
                  onPaymentFailure={(error) => console.log('Payment failed:', error)}
                  onPaymentError={handlePaymentError}
                />
                
                <div className="mt-3">
                  <small className="text-muted">
                    <strong>Note:</strong> This component requires backend API endpoints for initialization and verification.
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Integration Notes */}
          <div className="card mt-4">
            <div className="card-header">
              <h6>Integration Notes</h6>
            </div>
            <div className="card-body">
              <h6>Required Backend Endpoints:</h6>
              <ul>
                <li><code>POST /api/payment/esewa/initialize</code> - Initialize payment and get secret key</li>
                <li><code>POST /api/payment/esewa/verify</code> - Verify payment after callback</li>
              </ul>
              
              <h6>Environment Variables:</h6>
              <ul>
                <li><code>ESEWA_SECRET_KEY</code> - Your eSewa secret key</li>
                <li><code>ESEWA_MERCHANT_CODE</code> - Your merchant/product code</li>
                <li><code>ESEWA_ENVIRONMENT</code> - 'development' or 'production'</li>
              </ul>
              
              <h6>URL Routes to Add:</h6>
              <ul>
                <li><code>/payment/success</code> - Success callback page</li>
                <li><code>/payment/failure</code> - Failure callback page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EsewaPaymentExample;