
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './SummaryCards';
import TransactionTable from './TransactionTable';
import '../styles/AdminDashboard.css';
import axios from 'axios';

function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn');
    if (isAdmin !== 'true') {
      navigate('/admin-login', { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-transactions');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-actions">
        <button className="nav-button" onClick={() => navigate('/user-management')}>
          User Management
        </button>
      </div>

      <SummaryCards transactions={transactions} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}

export default AdminDashboard;
