import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../assets/logo.png";
import login_image from "../assets/backgrounds/login_img.png";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function NewResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      return setMessage("Please fill in all fields.");
    }

    if (newPassword !== confirmPassword) {
      return setMessage("Passwords do not match.");
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return setMessage(
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character."
      );
    }

    try {
      setLoading(true);

      // ADMIN / STAFF RESET ENDPOINT
      const res = await fetch(`${BASE_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Password updated successfully! Redirecting...");
        setTimeout(() => navigate("/", { replace: true }), 2500);
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
        {/* LEFT IMAGE */}
        <div className="col-12 col-md-8 p-0">
          <img
            src={login_image}
            className="h-100 w-100 img-fluid"
            style={{ objectFit: "contain" }}
            alt="Reset Password"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="col-12 col-md-4 d-flex flex-column justify-content-center vh-100 bg-white border rounded shadow p-4">
          <div className="text-center mb-4">
            <img src={Logo} alt="Logo" width="210" className="img-fluid mb-3" />
            <h2 className="fw-bold primary-text mb-0">Reset Your Password</h2>
            <span className="fs-6 text-muted">
              Please enter your new password below
            </span>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column">
            <input
              type="password"
              placeholder="New Password"
              className="custom-input my-1"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="custom-input my-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

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
