import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import CustomButton from "../../components/CustomBottom";
import Notification from "../../components/Notification";
import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

const PDFIcon = () => (
  <div
    style={{
      width: "80px",
      height: "80px",
      backgroundColor: "#e74c3c",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      fontWeight: "bold",
    }}
  >
    PDF
  </div>
);

export default function Requirements() {
  const [validIdFile, setValidIdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [existingValidId, setExistingValidId] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
    actions: null,
  });

  // Fetch current user info
  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;
        setIsVerified(Boolean(user.isVerified)); // <-- make sure it's boolean
        setExistingValidId(user.validId || null);
        setExistingResume(user.resume || null);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isVerified) return; // Prevent submit if verified

    if (!validIdFile || !resumeFile) {
      setNotification({
        type: "error",
        message: "Please upload both Valid ID and Resume.",
        actions: null,
      });
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setNotification({
        type: "error",
        message: "You must be logged in to upload requirements.",
        actions: null,
      });
      return;
    }

    const formData = new FormData();
    formData.append("validId", validIdFile);
    formData.append("resume", resumeFile);

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/users/upload-requirements`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setNotification({ type: "success", message: res.data.message, actions: null });
      setValidIdFile(null);
      setResumeFile(null);
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to submit requirements.",
        actions: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFilePreview = (file) => {
    if (!file) return null;

    let url;
    let isPDF;

    if (typeof file === "string") {
      url = file;
      isPDF = file.endsWith(".pdf");
    } else {
      url = URL.createObjectURL(file);
      isPDF = file.type === "application/pdf";
    }

    return (
      <div style={{ marginTop: "10px", cursor: "pointer" }} onClick={() => window.open(url)}>
        {isPDF ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <PDFIcon />
            <span>{typeof file === "string" ? url.split("/").pop() : file.name}</span>
          </div>
        ) : (
          <img
            src={url}
            alt={typeof file === "string" ? "uploaded file" : file.name}
            style={{ width: "250px", maxHeight: "250px", objectFit: "contain", borderRadius: "8px" }}
          />
        )}
      </div>
    );
  };

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

      <Card width="100%" height="auto" style={{ maxWidth: "500px", width: "100%", borderRadius: "16px" }}>
        <div className="p-4">
          <h1 className="mb-1">Upload Requirements</h1>
          <span className="text-muted">Provide your Valid ID and Resume</span>

          {isVerified && (
            <div className="alert alert-info mt-3" style={{ fontWeight: "bold", textAlign: "center" }}>
              You are already verified. You cannot change or upload requirements anymore.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
              <label className="form-label fw-bold">Valid ID</label>
              <input
                type="file"
                className="form-control"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setValidIdFile(e.target.files[0])}
                disabled={isVerified} // <-- disabled if verified
                required={!isVerified}
              />
              {renderFilePreview(isVerified ? existingValidId : validIdFile)}
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Resume</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                disabled={isVerified} // <-- disabled if verified
                required={!isVerified}
              />
              {renderFilePreview(isVerified ? existingResume : resumeFile)}
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <CustomButton
                label="Back"
                variant="secondary"
                onClick={() => window.history.back()}
              />
              <CustomButton
                label={loading ? "Submitting..." : "Submit Requirements"}
                variant="primary"
                type="submit"
                disabled={loading || isVerified} // <-- disabled if verified
              />
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
