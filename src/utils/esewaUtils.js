import CryptoJS from 'crypto-js';

/**
 * Generate HMAC SHA256 signature for eSewa payment
 * @param {string} totalAmount - Total amount for the transaction
 * @param {string} transactionUuid - Unique transaction identifier
 * @param {string} productCode - Product code (e.g., 'EPAYTEST' for UAT)
 * @param {string} secretKey - Secret key provided by eSewa
 * @returns {string} Base64 encoded signature
 */
export const generateEsewaSignature = (totalAmount, transactionUuid, productCode, secretKey) => {
  // Create the message string in the exact order required by eSewa
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  
  // Generate HMAC SHA256 hash
  const hash = CryptoJS.HmacSHA256(message, secretKey);
  
  // Convert to Base64
  const signature = CryptoJS.enc.Base64.stringify(hash);
  
  return signature;
};

/**
 * Get eSewa API endpoint based on environment
 * @param {boolean} isProduction - Whether to use production endpoint
 * @returns {string} eSewa API endpoint URL
 */
export const getEsewaEndpoint = (isProduction = false) => {
  return isProduction 
    ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
    : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
};

/**
 * Create and submit a form to eSewa payment gateway
 * @param {Object} paymentData - Payment form data
 */
export const submitEsewaForm = (paymentData) => {
  // Create form element
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentData.endpoint;
  form.style.display = 'none';

  // Add all form fields as hidden inputs
  Object.keys(paymentData).forEach(key => {
    if (key !== 'endpoint') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    }
  });

  // Append form to body and submit
  document.body.appendChild(form);
  form.submit();
  
  // Clean up - remove form after submission
  document.body.removeChild(form);
};