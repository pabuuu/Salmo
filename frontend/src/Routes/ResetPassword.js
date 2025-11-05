import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api/users"
    : "https://rangeles.online/api/users";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(3); // seconds before redirect

  useEffect(() => {
    let timer;
    if (message) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [message, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setCountdown(3);

    // Basic validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/reset-password/${token}`, { newPassword });
      setMessage(response.data.message);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to reset password. Try again.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "450px", marginTop: "60px" }}>
      <div className="card shadow-sm p-4">
        <h2 className="mb-3 text-center" style={{ color: "#1e40af" }}>Reset Password</h2>

        {message && (
          <div className="alert alert-success">
            {message} Redirecting to login in {countdown} second{countdown !== 1 ? "s" : ""}.
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label className="form-check-label" htmlFor="showPassword">
              Show Password
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            {message
              ? "You will be redirected automatically."
              : "Please enter your new password."}
          </small>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
