import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "../../../views/Loading";
import Notification from "../../../components/Notification";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

function StaffAccounts() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/users`);
      const data = res.data || [];
      const filteredStaff = data.filter((u) => u.role === "staff");
      setStaff(filteredStaff);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setNotification({ type: "error", message: "Failed to fetch staff." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (type) => {
    const sorted = [...staff];
    if (type === "az") sorted.sort((a, b) => a.username.localeCompare(b.username));
    if (type === "za") sorted.sort((a, b) => b.username.localeCompare(a.username));
    setStaff(sorted);
  };

  if (loading)
    return (
      <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
        <LoadingScreen />
      </div>
    );

  return (
    <div className="container-fluid">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <div className="mb-4">
        <h1>Staff Accounts</h1>
        <span>{filteredStaff.length} Staff found</span>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
        <Link
          to="/accounts/staff/create"
          style={{
            backgroundColor: "#198754",
            color: "white",
            padding: "6px 16px",
            borderRadius: "6px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "all 0.2s ease",
            display: "inline-block",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#146c43")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#198754")}
        >
          + Add Staff
        </Link>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="dropdown">
            <button
              className="btn btn-outline-dark dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              Sort by
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={() => handleSort("az")}>
                  Alphabetical ↑
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => handleSort("za")}>
                  Alphabetical ↓
                </button>
              </li>
            </ul>
          </div>

          <input
            placeholder="Search Username"
            className="custom-input my-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredStaff.length > 0 ? (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((user) => (
              <tr
                key={user._id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/accounts/profile/${user._id}`)}
              >
                <td>{user.username}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-4 text-muted">
          No staff accounts found.
        </div>
      )}
    </div>
  );
}

export default StaffAccounts;
