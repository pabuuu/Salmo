import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../assets/logo.png";
import login_image from "../assets/backgrounds/login_img.png";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function TenantNewPass() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim() || !confirmPassword.trim())
      return setMessage("Please fill in all fields.");
    if (newPassword !== confirmPassword)
      return setMessage("Passwords do not match.");

    // Password validation (same as backend)
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return setMessage(
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character."
      );
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Password updated successfully! Redirecting...");
        setTimeout(() => navigate("/customer-login"), 2500);
      } else {
        setMessage(data.message || "Password reset failed.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
      <div className="row w-100">
        <div className="col-12 col-md-8 p-0">
          <img
            src={login_image}
            className="h-100 w-100 img-fluid"
            style={{ objectFit: "contain" }}
            alt="Reset Password"
          />
        </div>

        <div className="col-12 col-md-4 d-flex flex-column justify-content-center vh-100 bg-white border rounded shadow p-4">
          <div className="text-center mb-4">
            <img src={Logo} alt="Logo" width="210" className="img-fluid mb-3" />
            <h2 className="fw-bold primary-text mb-0">Reset Your Password</h2>
            <span className="fs-6 text-muted">
              Please enter your new password below
            </span>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column">
            <div className="position-relative my-1">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                className="custom-input w-100 pe-5"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                {showNewPassword ? (
                  <i className="fa fa-solid fa-eye"></i>
                ) : (
                  <i className="fa fa-regular fa-eye-slash"></i>
                )}
              </span>
            </div>
            <div className="position-relative my-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="custom-input w-100 pe-5"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                {showConfirmPassword ? (
                  <i className="fa fa-solid fa-eye"></i>
                ) : (
                  <i className="fa fa-regular fa-eye-slash"></i>
                )}
              </span>
            </div>

            <button
              type="submit"
              className="custom-button mt-2"
              disabled={loading}
            >
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>

          {message && (
            <p className="text-center text-danger mt-3 fw-semibold">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
