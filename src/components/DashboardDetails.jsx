import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import "../styles/AdminDashboard.css";

function DashboardDetails() {
  const [transactions, setTransactions] = useState([]);
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/get-transactions")
      .then(res => {
        setTransactions(res.data);
        const monthlyData = aggregateByMonth(res.data);
        setLineData(monthlyData);
      })
      .catch(err => {
        console.error("Error fetching transactions:", err.message);
      });
  }, []);

  const aggregateByMonth = (transactions) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const summary = {};

    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const month = months[date.getMonth()];
      summary[month] = (summary[month] || 0) + parseFloat(tx.amount);
    });

    return months.map(month => ({
      name: month,
      amount: summary[month] || 0
    }));
  };

  return (
    <div>
      <div className="charts-section">
        <div className="line-chart">
          <h3>Transaction Graph</h3>
          <LineChart width={500} height={250} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>

      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <ul>
          {transactions.slice(-5).reverse().map((tx, idx) => (
            <li key={idx} className="transaction-item">
              <p>{tx.userName}</p>
              <p>{tx.accountNumber}</p>
              <p>{new Date(tx.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DashboardDetails;
