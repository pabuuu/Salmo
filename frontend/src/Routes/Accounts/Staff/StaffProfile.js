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

// Simple PDF icon
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

export default function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
    actions: null,
  });

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/users/${id}`);
      setStaff(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setNotification({
        type: "error",
        message: "Failed to fetch staff details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.patch(`${BASE_URL}/users/${id}/verify`);
      if (res.data.success) {
        setStaff((prev) => ({ ...prev, isVerified: true }));
        setNotification({
          type: "success",
          message: "Staff verified successfully!",
        });
      } else {
        setNotification({ type: "error", message: "Failed to verify staff." });
      }
    } catch (err) {
      console.error("Error verifying staff:", err);
      setNotification({
        type: "error",
        message: "Failed to verify staff.",
      });
    }
  };

  const renderFile = (url) => {
    if (!url) return <span className="text-muted">Not uploaded</span>;

    const isPDF = url.endsWith(".pdf");
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "5px",
        }}
      >
        {isPDF ? (
          <PDFIcon />
        ) : (
          <img
            src={url}
            alt="file"
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
              borderRadius: 6,
            }}
          />
        )}

        <a href={url} target="_blank" rel="noopener noreferrer">
          {url.split("/").pop()}
        </a>
      </div>
    );
  };

  if (loading) return <LoadingScreen />;

  if (!staff)
    return (
      <div className="text-center py-5">
        <h3>Staff not found.</h3>
        <CustomButton
          label="Back"
          variant="secondary"
          onClick={() => navigate(-1)}
        />
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
        onClose={() =>
          setNotification({ type: "", message: "", actions: null })
        }
      />

      <Card
        width="100%"
        height="auto"
        style={{
          maxWidth: "800px",
          width: "100%",
          flexGrow: 1,
          borderRadius: "16px",
        }}
      >
        <div className="p-4">
          <h1 className="mb-1">Staff Profile</h1>
          <span className="text-muted">
            View staff details and uploaded requirements
          </span>

          <div className="mt-4">
            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label fw-bold">Full Name</label>
              <input
                className="form-control"
                value={staff.fullName || "N/A"}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                className="form-control"
                value={staff.email || "N/A"}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Role */}
            <div className="mb-3">
              <label className="form-label fw-bold">Role</label>
              <input
                className="form-control"
                value={staff.role || "N/A"}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Contact Number */}
            <div className="mb-3">
              <label className="form-label fw-bold">Contact Number</label>
              <input
                className="form-control"
                value={staff.contactNumber || "N/A"}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Verified */}
            <div className="mb-3">
              <label className="form-label fw-bold">Verified</label>
              <input
                className="form-control"
                value={staff.isVerified ? "Yes" : "No"}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Valid ID */}
            <div className="mb-3">
              <label className="form-label fw-bold">Valid ID</label>
              {renderFile(staff.validId)}
            </div>

            {/* Resume */}
            <div className="mb-3">
              <label className="form-label fw-bold">Resume</label>
              {renderFile(staff.resume)}
            </div>

            <div className="d-flex flex-wrap gap-3 mt-4">
              {!staff.isVerified && (
                <CustomButton
                  label="Verify Staff"
                  variant="success"
                  onClick={handleVerify}
                />
              )}
              <CustomButton
                label="Back"
                variant="secondary"
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
