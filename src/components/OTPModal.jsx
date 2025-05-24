import React, { useState } from 'react';
import axios from 'axios';

function OTPModal({ phone, cardNumber, expiry, cvv, amount, onClose, onSuccess, onFailure }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:4000/verify_otp', {
        phone,
        otp,
        cardNumber,
        expiry,
        cvv,
        amount,
      });
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
      onFailure && onFailure();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h3>Enter OTP sent to {phone}</h3>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleVerify} disabled={loading || otp.length !== 6}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
      <button onClick={onClose} disabled={loading}>
        Cancel
      </button>
    </div>
  );
}

export default OTPModal;
