import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

function StaffPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "staff",
    contactNumber: "",
  });

  const [validId, setValidId] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [tempPassword, setTempPassword] = useState("");

  // ⬇️ UPDATED handleChange with validation (same as AdminPost)
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔹 FULL NAME: letters + spaces only
    if (name === "fullName") {
      const cleaned = value.replace(/[^A-Za-z\s]/g, "");
      setFormData({ ...formData, fullName: cleaned });
      return;
    }

    // 🔹 CONTACT NUMBER: digits only + max 11
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
        message: "Staff registered successfully.",
      });

      setTempPassword(res.data.tempPassword || "");

      setTimeout(() => navigate("/accounts/staff"), 5000);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to register staff.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Add Staff</h2>

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
          placeholder="Email Address"
          value={formData.email}
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
          maxLength={11}
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
          {loading ? "Creating..." : "Add Staff"}
        </button>
      </form>
    </div>
  );
}

export default StaffPost;
