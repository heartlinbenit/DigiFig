const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Proxy Routes
app.post('/process-payment', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5000/bank-process', req.body);
    res.json({
      status: response.data.status,
      message: response.data.message || "Processed by bank"
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      error: error.message,
      message: 'Bank server error'
    });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/get-transactions');
    const transactions = response.data;

    const usersResponse = await axios.get('http://localhost:5000/get-users');
    const users = usersResponse.data;

    // Create a map of cardNumber to user name
    const userMap = {};
    users.forEach(user => {
      if (user.cardNumber) {
        // Store both original and normalized versions to handle any formatting
        userMap[user.cardNumber] = user.name;
        userMap[user.cardNumber.trim()] = user.name;
        userMap[user.cardNumber.replace(/\s+/g, '')] = user.name;
      }
    });
   
    const updatedTransactions = transactions.map(txn => {
      // Try to find the user by different variations of the card number
      const userName = txn.cardNumber 
        ? (userMap[txn.cardNumber] || 
           userMap[txn.cardNumber.trim()] || 
           userMap[txn.cardNumber.replace(/\s+/g, '')] || 
           'Unknown User')
        : 'No Card Number';
        console.log('Users:', users.map(u => ({ name: u.name, card: u.cardNumber })));
        console.log('Transactions:', transactions.map(t => t.cardNumber));
      return {
        ...txn,
        userName
      };
    });

    res.json(updatedTransactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err.message });
  }
});
app.get('/users', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/get-users');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

app.post('/add-user', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5000/add-user', req.body);
    res.json(response.data);
  } catch (err) {
    res.status(400).json({ message: 'Error adding user', error: err.message });
  }
});

app.put('/update-user/:id', async (req, res) => {
  try {
    const response = await axios.put(`http://localhost:5000/update-user/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
});

app.delete('/delete-user/:id', async (req, res) => {
  try {
    const response = await axios.delete(`http://localhost:5000/delete-user/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(400).json({ message: 'Error deleting user', error: err.message });
  }
});

app.listen(6001, () => {
  console.log('Middleware server running on port 6001');
});
