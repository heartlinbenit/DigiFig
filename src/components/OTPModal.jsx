import React, { useState } from 'react';
import axios from 'axios';
 // Optional: for styling the modal

function OTPModal({ phone, cardNumber, expiry, cvv, amount, onClose, onSuccess }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/verify-otp', {
        phone,
        otp,
        cardNumber,
        expiry,
        cvv,
        amount: parseFloat(amount)
      });

      if (response.data.message === 'Payment successful') {
        onSuccess();  // Notify parent of success
      } else {
       onFailure(); // callback from parent

      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'OTP verification failed';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <h2>Enter OTP</h2>
        <p>An OTP has been sent to your phone number {phone}</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          autoFocus
        />
        {error && <p className="error">{error}</p>}
        <div className="buttons">
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={handleVerify} disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPModal;
