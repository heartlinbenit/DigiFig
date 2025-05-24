import React from "react";
import "../styles/TransactionTable.css";

function TransactionTable({ transactions }) {
  return (
    <div className="transaction-table-container">
      <h2>Transaction History</h2>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions && transactions.length > 0 ? (
            transactions.map((txn, index) => (
              <tr key={index}>
                <td data-label="User Name">{txn.userName || "No user found"}</td>
                <td
                  data-label="Status"
                  className={txn.status === "Success" ? "approved" : "failed"}
                >
                  {txn.status}
                </td>
                <td data-label="Amount">{txn.amount}</td>
                <td data-label="Date">{new Date(txn.timestamp).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No transactions available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
