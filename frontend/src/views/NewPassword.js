import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";
import login_image from "../assets/backgrounds/login_img.png";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function NewPassword({ setLoggedIn, setIsTemporaryPassword }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get email from login redirect or sessionStorage
  const adminEmail = location.state?.email || sessionStorage.getItem("email");

  useEffect(() => {
    if (!adminEmail) {
      console.warn("No email found. Redirecting to login.");
      navigate("/", { replace: true });
    }
  }, [adminEmail, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setMessage(
        "Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/auth/set-password-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, newPassword }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok && data.success) {
        // Safely update session storage (guard for missing data.user)
        if (data.token) sessionStorage.setItem("token", data.token);
        if (data.user?.role) sessionStorage.setItem("role", data.user.role);
        if (data.user?.id) sessionStorage.setItem("userId", data.user.id);
        // store as string to match App guard logic
        sessionStorage.setItem("isTemporaryPassword", "false");
        if (data.user?.email) sessionStorage.setItem("email", data.user.email);

        if (setLoggedIn) setLoggedIn(true);
        if (setIsTemporaryPassword) setIsTemporaryPassword(false);

        setMessage("Password updated successfully! Redirecting...");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      } else {
        setMessage(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Error setting new password:", err);
      setMessage("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
      <div className="row w-100">
        {/* Left image section */}
        <div className="col-12 col-md-8 p-0">
          <img
            src={login_image}
            className="h-100 w-100 img-fluid"
            style={{ objectFit: "contain" }}
            alt="New Password"
          />
        </div>

        {/* Right form section */}
        <div className="col-12 col-md-4 d-flex flex-column justify-content-center vh-100 bg-white border rounded shadow p-4">
          <div className="text-center mb-4">
            <img src={Logo} alt="Logo" width="210" className="img-fluid mb-3" />
            <h2 className="fw-bold primary-text mb-0">Set New Password</h2>
            <span className="fs-6 text-muted">
              Create your new password to continue
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
              {loading ? "Saving..." : "Set Password"}
            </button>
          </form>

          {message && (
            <p className="text-center text-danger mt-3 fw-semibold">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
