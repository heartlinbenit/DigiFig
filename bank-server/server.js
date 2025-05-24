const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(express.json());

app.use(cors()); // <-- This allows all origins. For production, configure it securely.

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'your-mongo-uri-here';
const client = new MongoClient(MONGO_URI);

let usersCollection;

async function initDb() {
    await client.connect();
    const db = client.db(); // Connect to default DB from URI
    usersCollection = db.collection('users');
    console.log("Connected to MongoDB in bank-server");
}
initDb().catch(console.error);

// 1) GET /users — list everyone
app.get('/users', async (req, res) => {
  try {
    const users = await usersCollection.find({}, { projection: { _id: 0, name: 1, accountNumber: 1, balance: 1, phone: 1 } }).toArray();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// 2) POST /add-user — create a new user
app.post('/add-user', async (req, res) => {
  const { name, accountNumber, cardNumber, expiry, cvv, balance, phone } = req.body;
  if (!name || !accountNumber || !cardNumber || !expiry || !cvv || balance == null || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    await usersCollection.insertOne({ name, accountNumber, cardNumber, expiry, cvv, balance, phone });
    res.json({ message: 'User added' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Could not add user' });
  }
});

// POST /transaction - verify or process transaction
app.post('/transaction', async (req, res) => {
    try {
        const { cardNumber, expiry, cvv, amount, verifyOnly } = req.body;

        if (!cardNumber || !expiry || !cvv) {
            return res.status(400).json({ error: 'Card details are required' });
        }

        const user = await usersCollection.findOne({
            cardNumber,
            expiry,
            cvv
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid card details' });
        }

        if (verifyOnly) {
            return res.json({ success: true, message: 'Card is valid' });
        }

        if (amount == null) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Deduct amount and update balance
        const newBalance = user.balance - amount;
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { balance: newBalance } }
        );

        return res.json({ success: true, message: 'Payment processed', balance: newBalance });

    } catch (err) {
        console.error('Transaction error:', err.message);
        return res.status(500).json({ error: 'Server error during transaction' });
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Bank server is running on port ${PORT}`);
});
