import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OTPModal from './OTPModal';
import '../styles/PaymentForm.css'; // Assuming styles are in PaymentForm.css

function PaymentForm() {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchPhone = async () => {
            try {
                const res = await axios.get('http://localhost:5000/user-phone');
                setPhone(res.data.phone);
            } catch (err) {
                console.error('Failed to fetch phone number', err);
            }
        };

        fetchPhone();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:5000/send-otp', {
                cardNumber,
                expiry,
                cvv,
                amount: parseFloat(amount),
                phone 
            });
            setShowModal(true);
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Error sending OTP';
            setError(errMsg);
        }
    };

    const handleOtpClose = () => {
        setShowModal(false);
    };

    const handlePaymentSuccess = () => {
        setShowModal(false);
        setSuccess('Payment processed successfully!');
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setAmount('');
    };

    return (
        <div className="form-container">
            <h1>Payment Form</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    required
                />
                <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="Expiry (MM/YY)"
                    required
                />
                <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="CVV"
                    required
                />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    required
                />
                <button type="submit">Pay</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {showModal && (
                <OTPModal
                    phone={phone}
                    cardNumber={cardNumber}
                    expiry={expiry}
                    cvv={cvv}
                    amount={parseFloat(amount)}
                    onSuccess={handlePaymentSuccess}
                    onClose={handleOtpClose}
                />
            )}
        </div>
    );
}

export default PaymentForm;
