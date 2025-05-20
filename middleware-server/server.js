const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors()); // ✅ Enable CORS
app.use(express.json());

const OTP_SERVER_URL = process.env.OTP_SERVER_URL || 'http://localhost:4000';
const BANK_SERVER_URL = process.env.BANK_SERVER_URL || 'http://localhost:5001';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://heartlinbenit:hearty22@cluster0.pzn6mpn.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

let dbClient;
let transactionsCollection;
let usersCollection;

// ✅ Initialize MongoDB
async function initDb() {
    dbClient = new MongoClient(MONGO_URI);
    await dbClient.connect();
    const db = dbClient.db();
    transactionsCollection = db.collection('transactions');
    usersCollection = db.collection('users');
    console.log('Connected to MongoDB in OTP server');
}
initDb().catch(console.error);

// ✅ /send-otp: Verify card and send OTP
// ✅ /send-otp: Verify card and send OTP

app.post('/send-otp', async (req, res) => {
    try {
        const { cardNumber, expiry, cvv, amount, phone } = req.body;
        if (!cardNumber || !expiry || !cvv || !amount || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Double check that phone matches card
        const user = await usersCollection.findOne({ cardNumber, expiry, cvv });
        if (!user || user.phone !== phone) {
            return res.status(404).json({ error: 'User not found or phone mismatch' });
        }

        const verifyResponse = await axios.post(`${BANK_SERVER_URL}/transaction`, {
            cardNumber, expiry, cvv, amount, verifyOnly: true
        });

        if (verifyResponse.data?.success) {
            await axios.post(`${OTP_SERVER_URL}/send_otp`, { phone });
            return res.json({ message: 'OTP sent successfully' });
        } else {
            return res.status(400).json({ error: 'Card verification failed' });
        }
    } catch (err) {
        console.error(err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || 'Error sending OTP';
        return res.status(400).json({ error: errorMsg });
    }
});
4

// ✅ /verify-otp: Verify OTP and process payment
app.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp, cardNumber, expiry, cvv, amount } = req.body;
        if (!phone || !otp || !cardNumber || !expiry || !cvv || !amount) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const otpResponse = await axios.post(`${OTP_SERVER_URL}/verify_otp`, { phone, otp });

        if (otpResponse.data?.message === 'OTP verified successfully') {
            const paymentResponse = await axios.post(`${BANK_SERVER_URL}/transaction`, {
                cardNumber, expiry, cvv, amount, verifyOnly: false
            });

            if (paymentResponse.data?.success) {
                const user = await usersCollection.findOne({ cardNumber, expiry, cvv });
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const transaction = {
                    accountNumber: user.accountNumber,
                    userName: user.userName || user.name || 'Unknown User',
                    cardNumber,
                    expiry,
                    amount,
                    timestamp: new Date(),
                    status: 'Success'
                };
                console.log(user);

                await transactionsCollection.insertOne(transaction);

                return res.json({ message: 'Payment successful' });
            } else {
                return res.status(400).json({ error: 'Payment failed' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (err) {
        console.error(err.response?.data || err.message);
        const errorMsg = err.response?.data?.error || 'Error verifying OTP or processing payment';
        return res.status(400).json({ error: errorMsg });
    }
});

// ✅ /get-transactions: Fetch all transactions
app.get('/get-transactions', async (req, res) => {
    try {
        const transactions = await transactionsCollection.find({}).toArray();
        res.json(transactions);
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// ✅ /user-phone: Dummy route to get phone of first user
app.get('/user-phone', async (req, res) => {
    try {
        const user = await usersCollection.findOne({});
        if (!user || !user.phone) {
            return res.status(404).json({ error: 'User or phone number not found' });
        }

        res.json({ phone: user.phone });
    } catch (err) {
        console.error('Error fetching phone:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Middleware Server running on port ${PORT}`);
});
