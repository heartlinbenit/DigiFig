import React from "react";
function SummaryCards({ transactions, theme = "light" }) {
  const total = transactions.length;
  const totalAmount = transactions.reduce((acc, txn) => acc + Number(txn.amount), 0);
  const successCount = transactions.filter((txn) => txn.status === "Approved").length;
  const failCount = transactions.filter((txn) => txn.status === "Failed").length;

  const successPercentage = ((successCount / total) * 100).toFixed(2);
  const failPercentage = ((failCount / total) * 100).toFixed(2);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Define static colors based on theme prop
  const colors = {
    light: {
      cardBg: "#f8f8f8",
      cardText: "#5C4033",
      successBg: "#d4edda",
      successBorder: "#28a745",
      successText: "#155724",
      failBg: "#f8d7da",
      failBorder: "#dc3545",
      failText: "#721c24",
    },
    dark: {
      cardBg: "#2d2d2d",
      cardText: "#e0c097",
      successBg: "#155724",
      successBorder: "#28a745",
      successText: "#d4edda",
      failBg: "#721c24",
      failBorder: "#dc3545",
      failText: "#f8d7da",
    },
  };

  const themeColors = colors[theme] || colors.light;

  return (
    <div className="summary-cards">
      <div
  className="card"
  style={{
    backgroundColor: themeColors.cardBg,
    color: themeColors.cardText,
    padding: "0.5rem 1rem",
    margin: "0.5rem",
    fontSize: "0.9rem",
    width: "200px"
  }}
>
        <h3>Total Transactions</h3>
        <p>{total} Transactions</p>
      </div>

      <div
        className="card"
        style={{
           backgroundColor: themeColors.cardBg,
    color: themeColors.cardText,
    padding: "0.5rem 1rem",
    margin: "0.5rem",
    fontSize: "0.9rem",
    width: "200px"
        }}
      >
        <h3>Total Amount Processed</h3>
        <p>{formatCurrency(totalAmount)}</p>
      </div>

      <div
        className="card success"
        style={{
          backgroundColor: themeColors.cardBg,
    color: themeColors.cardText,
    padding: "0.5rem 1rem",
    margin: "0.5rem",
    fontSize: "0.9rem",
    width: "200px"
        }}
      >
        <h3>Successful Transactions</h3>
        <p>
          {successCount} ({successPercentage}%)
        </p>
      </div>

      <div
        className="card fail"
        style={{
          backgroundColor: themeColors.cardBg,
    color: themeColors.cardText,
    padding: "0.5rem 1rem",
    margin: "0.5rem",
    fontSize: "0.9rem",
    width: "200px"
        }}
      >
        <h3>Failed Transactions</h3>
        <p>
          {failCount} ({failPercentage}%)
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;