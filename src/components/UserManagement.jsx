import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    balance: ""
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:6001/users");
    setUsers(response.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    const { name, accountNumber, cardNumber, expiry, cvv, balance } = formData;

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!/^\d{10,18}$/.test(accountNumber)) newErrors.accountNumber = "Account Number should be 10-18 digits.";
    if (!/^\d{16}$/.test(cardNumber)) newErrors.cardNumber = "Card Number must be 16 digits.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) newErrors.expiry = "Expiry must be in MM/YY format.";
    if (!/^\d{3}$/.test(cvv)) newErrors.cvv = "CVV must be 3 digits.";
    if (!/^\d+(\.\d{1,2})?$/.test(balance)) newErrors.balance = "Balance must be a valid number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validate()) return;

    try {
      await axios.post("http://localhost:6001/add-user", formData);
      setFormData({
        name: "",
        accountNumber: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
        balance: ""
      });
      setErrors({});
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <button style={{ backgroundColor: "#8B4513" }} onClick={() => setShowModal(true)}>Add User</button>

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Account Number</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.name}</td>
              <td>{u.accountNumber}</td>
              <td>{u.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
            <h3 style={{ color: "#5C4033" }}>Add New User</h3>

            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} /><br />
            {errors.name && <small style={{ color: "red" }}>{errors.name}</small>}<br />

            <input name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleChange} /><br />
            {errors.accountNumber && <small style={{ color: "red" }}>{errors.accountNumber}</small>}<br />

            <input name="cardNumber" placeholder="Card Number" value={formData.cardNumber} onChange={handleChange} /><br />
            {errors.cardNumber && <small style={{ color: "red" }}>{errors.cardNumber}</small>}<br />

            <input name="expiry" placeholder="Expiry (MM/YY)" value={formData.expiry} onChange={handleChange} /><br />
            {errors.expiry && <small style={{ color: "red" }}>{errors.expiry}</small>}<br />

            <input name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleChange} /><br />
            {errors.cvv && <small style={{ color: "red" }}>{errors.cvv}</small>}<br />

            <input name="balance" placeholder="Balance" value={formData.balance} onChange={handleChange} /><br />
            {errors.balance && <small style={{ color: "red" }}>{errors.balance}</small>}<br />

            <br />
            <button onClick={handleAddUser} style={{ margin: "10px" }}>Submit</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
