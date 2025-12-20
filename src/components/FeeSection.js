import React, { useState } from 'react';
import profileService from '../services/profileService';

const FeeSection = ({ profile, currentUser, editing, editData, setEditData }) => {
  const [addingPayment, setAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    paymentMethod: '',
    receiptNumber: '',
    description: ''
  });

  const canView = ['admin', 'fee_department', 'parent'].includes(currentUser.role);
  const canEdit = ['admin', 'fee_department'].includes(currentUser.role);

  if (!canView) return null;

  const handleFeeChange = (field, value) => {
    setEditData({
      ...editData,
      feeInfo: {
        ...editData.feeInfo,
        [field]: value
      }
    });
  };

  const handleAddPayment = async () => {
    try {
      const payment = {
        ...newPayment,
        amount: parseFloat(newPayment.amount),
        paymentDate: new Date()
      };

      const updatedFeeInfo = {
        ...profile.feeInfo,
        paidAmount: (profile.feeInfo.paidAmount || 0) + payment.amount,
        pendingAmount: (profile.feeInfo.totalFee || 0) - ((profile.feeInfo.paidAmount || 0) + payment.amount),
        feeHistory: [...(profile.feeInfo.feeHistory || []), payment]
      };

      await profileService.updateFeeInfo(profile._id, updatedFeeInfo);
      
      setAddingPayment(false);
      setNewPayment({
        amount: '',
        paymentMethod: '',
        receiptNumber: '',
        description: ''
      });
      
      // Refresh profile data
      window.location.reload();
    } catch (error) {
      console.error('Failed to add payment:', error);
    }
  };

  const renderFeeOverview = () => (
    <div className="fee-overview">
      <div className="fee-stats">
        <div className="fee-stat">
          <label>Total Fee:</label>
          {editing && canEdit ? (
            <input
              type="number"
              value={editData.feeInfo?.totalFee || ''}
              onChange={(e) => handleFeeChange('totalFee', parseFloat(e.target.value))}
            />
          ) : (
            <span className="amount">₹{profile.feeInfo?.totalFee || 0}</span>
          )}
        </div>
        <div className="fee-stat paid">
          <label>Paid Amount:</label>
          <span className="amount">₹{profile.feeInfo?.paidAmount || 0}</span>
        </div>
        <div className="fee-stat pending">
          <label>Pending Amount:</label>
          <span className="amount">₹{profile.feeInfo?.pendingAmount || 0}</span>
        </div>
      </div>
      
      {canEdit && (
        <div className="fee-actions">
          <button 
            onClick={() => setAddingPayment(true)}
            className="btn-add-payment"
          >
            Add Payment
          </button>
        </div>
      )}
    </div>
  );

  const renderPaymentHistory = () => {
    if (!profile.feeInfo?.feeHistory || profile.feeInfo.feeHistory.length === 0) {
      return <p>No payment history available.</p>;
    }

    return (
      <div className="payment-history">
        <h4>Payment History</h4>
        <div className="payment-list">
          {profile.feeInfo.feeHistory.map((payment, index) => (
            <div key={index} className="payment-record">
              <div className="payment-info">
                <div className="payment-amount">₹{payment.amount}</div>
                <div className="payment-details">
                  <p><strong>Date:</strong> {new Date(payment.paymentDate).toLocaleDateString()}</p>
                  <p><strong>Method:</strong> {payment.paymentMethod}</p>
                  {payment.receiptNumber && (
                    <p><strong>Receipt:</strong> {payment.receiptNumber}</p>
                  )}
                  {payment.description && (
                    <p><strong>Description:</strong> {payment.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAddPaymentForm = () => (
    <div className="add-payment-form">
      <h4>Add New Payment</h4>
      <div className="form-grid">
        <div className="form-field">
          <label>Amount:</label>
          <input
            type="number"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
            placeholder="Enter amount"
          />
        </div>
        <div className="form-field">
          <label>Payment Method:</label>
          <select
            value={newPayment.paymentMethod}
            onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}
          >
            <option value="">Select Method</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online Transfer</option>
            <option value="card">Card Payment</option>
          </select>
        </div>
        <div className="form-field">
          <label>Receipt Number:</label>
          <input
            type="text"
            value={newPayment.receiptNumber}
            onChange={(e) => setNewPayment({...newPayment, receiptNumber: e.target.value})}
            placeholder="Receipt number"
          />
        </div>
        <div className="form-field full-width">
          <label>Description:</label>
          <input
            type="text"
            value={newPayment.description}
            onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
            placeholder="Payment description"
          />
        </div>
      </div>
      <div className="form-actions">
        <button onClick={handleAddPayment} className="btn-save">
          Add Payment
        </button>
        <button onClick={() => setAddingPayment(false)} className="btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="profile-section fee-section">
      <h3>Fee Information</h3>
      
      {renderFeeOverview()}
      
      {addingPayment && renderAddPaymentForm()}
      
      {renderPaymentHistory()}
    </div>
  );
};

export default FeeSection;