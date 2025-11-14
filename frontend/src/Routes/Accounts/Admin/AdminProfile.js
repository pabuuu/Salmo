import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../../components/Card";
import CustomButton from "../../../components/CustomBottom";
import Notification from "../../../components/Notification";
import LoadingScreen from "../../../views/Loading";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

// Simple PDF icon for display
const PDFIcon = () => (
  <div
    style={{
      width: "60px",
      height: "60px",
      backgroundColor: "#e74c3c",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
      fontWeight: "bold",
    }}
  >
    PDF
  </div>
);

export default function AdminProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
    actions: null,
  });

  useEffect(() => {
    fetchAdmin();
  }, [id]);

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/users/${id}`);
      setAdmin(res.data);
    } catch (err) {
      console.error("Error fetching admin:", err);
      setNotification({ type: "error", message: "Failed to fetch admin details." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.patch(`${BASE_URL}/users/${id}/verify`);
      if (res.data.success) {
        setAdmin((prev) => ({ ...prev, isVerified: true }));
        setNotification({ type: "success", message: "Admin verified successfully!" });
      } else {
        setNotification({ type: "error", message: "Failed to verify admin." });
      }
    } catch (err) {
      console.error("Error verifying admin:", err);
      setNotification({ type: "error", message: "Failed to verify admin." });
    }
  };

  const renderFile = (url) => {
    if (!url) return <span className="text-muted">Not uploaded</span>;

    const isPDF = url.endsWith(".pdf");
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
        {isPDF ? <PDFIcon /> : <img src={url} alt="file" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 6 }} />}
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url.split("/").pop()}
        </a>
      </div>
    );
  };

  if (loading) return <LoadingScreen />;

  if (!admin)
    return (
      <div className="text-center py-5">
        <h3>Admin not found.</h3>
        <CustomButton label="Back" variant="secondary" onClick={() => navigate(-1)} />
      </div>
    );

  return (
    <div
      className="d-flex justify-content-center align-items-start w-100 h-100 p-3"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <Notification
        type={notification.type}
        message={notification.message}
        actions={notification.actions}
        onClose={() => setNotification({ type: "", message: "", actions: null })}
      />

      <Card
        width="100%"
        height="auto"
        style={{ maxWidth: "800px", width: "100%", flexGrow: 1, borderRadius: "16px" }}
      >
        <div className="p-4">
          <h1 className="mb-1">Admin Profile</h1>
          <span className="text-muted">View admin details and uploaded requirements</span>

          <div className="mt-4">
            <div className="mb-3">
              <label className="form-label fw-bold">Full Name</label>
              <input className="form-control" value={admin.fullName || "N/A"} readOnly style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input className="form-control" value={admin.email || "N/A"} readOnly style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Role</label>
              <input className="form-control" value={admin.role || "N/A"} readOnly style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Contact Number</label>
              <input className="form-control" value={admin.contactNumber || "N/A"} readOnly style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Verified</label>
              <input className="form-control" value={admin.isVerified ? "Yes" : "No"} readOnly style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }} />
            </div>

            {/* Display Valid ID */}
            <div className="mb-3">
              <label className="form-label fw-bold">Valid ID</label>
              {renderFile(admin.validId)}
            </div>

            {/* Display Resume */}
            <div className="mb-3">
              <label className="form-label fw-bold">Resume</label>
              {renderFile(admin.resume)}
            </div>

            <div className="d-flex flex-wrap gap-3 mt-4">
              {!admin.isVerified && (
                <CustomButton label="Verify Admin" variant="success" onClick={handleVerify} />
              )}
              <CustomButton label="Back" variant="secondary" onClick={() => navigate(-1)} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
