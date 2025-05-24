import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './SummaryCards';
import TransactionTable from './TransactionTable';
import '../styles/AdminDashboard.css';
import axios from 'axios';
import ProtectedRoute from './ProtectedRoute';
import DashboardDetails from './DashboardDetails';

function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [showDashboardContent, setShowDashboardContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn');
    if (isAdmin !== 'true') {
      navigate('/admin-login', { replace: true });
    } else {
      window.history.replaceState(null, '', window.location.pathname);
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

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/admin-login', { replace: true });
  };

  const handleShowDashboard = () => {
    setShowDashboardContent(true);
  };

  return (
    <div className="admin-dashboard">
     
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="nav-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>
       <DashboardDetails />
      <div className="dashboard-actions">
        <button className="nav-button" onClick={() => navigate('/user-management')}>
          User Management
        </button>
        <button className="nav-button" onClick={handleShowDashboard}>
          Show Dashboard
        </button>
      </div>
      

      {showDashboardContent && (
        <>
          <SummaryCards transactions={transactions} />
          <TransactionTable transactions={transactions} />
        </>
      )}
    </div>
  );
}

export default AdminDashboard;