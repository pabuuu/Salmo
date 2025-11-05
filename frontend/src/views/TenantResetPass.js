import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import login_image from "../assets/backgrounds/login_img.png";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function TenantResetPass() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email.trim()) return setMessage("Email is required");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Password reset instructions sent to your email.");
      } else {
        setMessage(data.message || "Failed to send reset email.");
      }
    } catch (err) {
      console.error("Reset error:", err);
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
            alt="Reset Password Background"
          />
        </div>

        <div className="col-12 col-md-4 d-flex flex-column justify-content-center vh-100 bg-white border rounded shadow p-4">
          <div className="text-center mb-4">
            <img src={Logo} alt="Logo" width="210" className="img-fluid mb-3" />
            <h2 className="fw-bold primary-text mb-0">Forgot Password?</h2>
            <span className="fs-6 text-muted">We'll help you reset it</span>
          </div>

          <form onSubmit={handleReset} className="d-flex flex-column">
            <input
              type="email"
              placeholder="Enter your email"
              className="custom-input my-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="custom-button mt-2"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && (
            <p className="text-center text-danger mt-3 fw-semibold">
              {message}
            </p>
          )}

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn flex w-100 text-decoration-none"
              onClick={() => navigate("/customer-login")}
              disabled={loading}
            >
              <i className="fa me-1 fa-solid fa-arrow-left"></i>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
