import React, { useState } from 'react';
import { generateEsewaSignature, getEsewaEndpoint, submitEsewaForm } from '../../utils/esewaUtils';

/**
 * EsewaPaymentButton Component
 * A reusable React component for eSewa payment integration
 */
const EsewaPaymentButton = ({
  // Required props
  amount,
  taxAmount = 0,
  totalAmount,
  transactionUuid,
  productCode = 'EPAYTEST', // Default to test product code
  successUrl,
  failureUrl,
  
  // Optional props
  productServiceCharge = 0,
  productDeliveryCharge = 0,
  secretKey, // Should be passed from environment or API
  isProduction = false,
  buttonText = 'Pay with eSewa',
  buttonClassName = 'btn btn-primary',
  disabled = false,
  
  // Callback functions
  onPaymentStart,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle payment button click
   */
  const handlePayment = async (e) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      
      // Validate required props
      if (!amount || !totalAmount || !transactionUuid || !successUrl || !failureUrl) {
        throw new Error('Missing required payment parameters');
      }
      
      if (!secretKey) {
        throw new Error('Secret key is required for signature generation');
      }

      // Call onPaymentStart callback if provided
      if (onPaymentStart) {
        onPaymentStart();
      }

      // Generate signature
      const signature = generateEsewaSignature(
        totalAmount.toString(),
        transactionUuid,
        productCode,
        secretKey
      );

      // Prepare form data
      const paymentData = {
        amount: amount.toString(),
        tax_amount: taxAmount.toString(),
        total_amount: totalAmount.toString(),
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: productServiceCharge.toString(),
        product_delivery_charge: productDeliveryCharge.toString(),
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature,
        endpoint: getEsewaEndpoint(isProduction)
      };

      // Submit form to eSewa
      submitEsewaForm(paymentData);
      
    } catch (error) {
      console.error('eSewa payment error:', error);
      
      if (onError) {
        onError(error);
      } else {
        alert(`Payment Error: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handlePayment}
      disabled={disabled || isProcessing}
    >
      {isProcessing ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Processing...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default EsewaPaymentButton;