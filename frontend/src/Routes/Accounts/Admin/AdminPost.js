import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

function AdminPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "admin",
    contactNumber: "",
  });
  const [validId, setValidId] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    if (type === "validId") setValidId(e.target.files[0]);
    if (type === "resume") setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      for (const key in formData) data.append(key, formData[key]);
      if (validId) data.append("validId", validId);
      if (resume) data.append("resume", resume);

      const res = await axios.post(`${BASE_URL}/users/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotification({ type: "success", message: res.data.message });
      setTimeout(() => navigate("/accounts/admins"), 1500);
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to register admin",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Add Admin</h2>

      {notification.message && (
        <div
          className={`alert ${
            notification.type === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="form-control my-2"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-control my-2"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-control my-2"
        />

        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          required
          className="form-control my-2"
        />

        <label>Valid ID (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "validId")}
          className="form-control my-2"
        />

        <label>Resume (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "resume")}
          className="form-control my-2"
        />

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Add Admin"}
        </button>
      </form>
    </div>
  );
}

export default AdminPost;
