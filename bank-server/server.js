const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Error Connecting to DB: ', err));

mongoose.connection.once('open', () => {
  console.log('Connected to DB:', mongoose.connection.name);
});

// Schemas
const transactionSchema = new mongoose.Schema({
  accountNumber:String,
  cardNumber: String,
  expiry: String,
  amount: Number,
  timestamp: String,
  status: String
  
});

const Transaction = mongoose.model('Transaction', transactionSchema, 'transactions');

const userSchema = new mongoose.Schema({
  name: String,
  accountNumber: String,
  cardNumber: String,
  expiry: String,
  cvv: String,
  balance: Number
});

const User = mongoose.model('User', userSchema, 'users');

// Routes
app.post('/bank-process', async (req, res) => {
  const { cardNumber, expiry, cvv, amount } = req.body;
  const timestamp = req.body.timestamp || new Date().toISOString();

  if (!cardNumber || !expiry || !cvv || !amount) {
    return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
  }

  try {
    const user = await User.findOne({ cardNumber });

    if (!user || user.cvv !== cvv || user.expiry !== expiry) {
      // In /bank-process route of backend
await new Transaction({
  accountNumber: user.accountNumber,  // You can remove this if you don't need accountNumber
  cardNumber: user.cardNumber,        // Use cardNumber here instead of accountNumber
  expiry: user.expiry,
  amount,
  timestamp,
  status: 'Success',
  userName: user.name // Add this line
}).save();

      console.log("no")
      return res.status(403).json({ status: 'Failed', message: 'Invalid user or card details' });
    }

    if (user.balance < amount) {
      await new Transaction({ cardNumber, expiry, cvv, amount, timestamp, status: 'Failed' }).save();
      return res.json({ status: 'Failed', message: 'Insufficient balance' });
    }

    user.balance -= amount;
    await user.save();
   
    await new Transaction({
      accountNumber: user.accountNumber,
      cardNumber: user.cardNumber,
      expiry: user.expiry,
      amount,
      timestamp,
      status: 'Success',
      userName: user.name // Add this line
    }).save();
    res.json({ status: 'Success', message: 'Payment processed successfully' });
  } catch (error) {
    res.status(500).json({ status: 'Failed', error: error.message });
  }
});

app.get('/get-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 });
    res.json(transactions); // Let the middleware handle masking
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err.message });
  }
});

app.get('/get-users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

app.post('/add-user', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error adding user', error: err.message });
  }
});

app.put('/update-user/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
});

app.delete('/delete-user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting user', error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Bank server running on port 5000');
});
