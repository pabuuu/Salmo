import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

function AdminPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "admin",
    contactNumber: "",
  });
  const [validId, setValidId] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [tempPassword, setTempPassword] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔹 FULL NAME VALIDATION (letters and spaces only)
    if (name === "fullName") {
      const cleaned = value.replace(/[^A-Za-z\s]/g, ""); 
      setFormData({ ...formData, fullName: cleaned });
      return;
    }

    // 🔹 CONTACT NUMBER VALIDATION (numbers only, max 11 digits)
    if (name === "contactNumber") {
      const cleaned = value.replace(/\D/g, "").slice(0, 11);
      setFormData({ ...formData, contactNumber: cleaned });
      return;
    }

    setFormData({ ...formData, [name]: value });
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

      setNotification({
        type: "success",
        message:
          res.data.message ||
          "Admin registered successfully. Temporary password has been sent.",
      });

      setTempPassword(res.data.tempPassword || "");

      setTimeout(() => navigate("/accounts/admins"), 5000);
    } catch (err) {
      console.error("Error registering admin:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to register admin.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Add Admin</h2>

      {notification.message && (
        <div
          className={`alert ${
            notification.type === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {notification.message}
        </div>
      )}

      {tempPassword && (
        <div className="alert alert-info">
          Temporary Password: <strong>{tempPassword}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* FULL NAME */}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="form-control my-2"
        />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-control my-2"
        />

        {/* CONTACT NUMBER */}
        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          required
          className="form-control my-2"
          maxLength={11} // not required but acts as a secondary limit
        />

        <label className="mt-3">Valid ID (optional)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(e, "validId")}
          className="form-control my-2"
        />

        <label>Resume (optional)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => handleFileChange(e, "resume")}
          className="form-control my-2"
        />

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Creating..." : "Add Admin"}
        </button>
      </form>
    </div>
  );
}

export default AdminPost;
