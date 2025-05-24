import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/UserManagement.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
 useEffect(() => {
 const isAdmin = sessionStorage.getItem('isAdminLoggedIn');
  if (isAdmin !== 'true') {
    navigate('/admin-login', { replace: true });
  } else {
    // Force reload page on first load to avoid stale cache
    window.history.replaceState(null, '', window.location.pathname);
  }
}, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/users");
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) =>
      user.name.toLowerCase().includes(keyword) ||
      String(user.phone || "").includes(keyword)
    );
  }, [search, users]);

  return (
    <div className="admin-dashboard">
      <button className="nav-button" onClick={() => navigate(-1)}>←</button>
      <h1>User Management</h1>

      <input
        className="search-input"
        type="text"
        placeholder="🔍 Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Account Number</th>
              <th>Balance</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u, i) => (
                <tr key={i} className={parseFloat(u.balance) < 500 ? "low-balance" : ""}>
                  <td data-label="Name">{u.name}</td>
                  <td data-label="Account Number">{u.accountNumber}</td>
                  <td data-label="Balance">₹{parseFloat(u.balance).toLocaleString("en-IN")}</td>
                  <td data-label="Phone">{u.phone || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-users">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
