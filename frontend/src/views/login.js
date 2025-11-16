import React, { useState } from "react";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import login_image from "../assets/backgrounds/login_img.png";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function Login({ setLoggedIn, setRole, setIsTemporaryPassword }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChoosing, setIsChoosing] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) return setMessage("Username or email is required");
    if (!password.trim()) return setMessage("Password is required");
    setMessage("");

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Login failed");
        return;
      }

      const user = data.user || {};
      const userId = user._id || user.id;
      const isTemporaryPassword =
        user.isTemporaryPassword === true || user.isTemporaryPassword === "true";


      if (data.token) sessionStorage.setItem("token", data.token);
      if (user.role) sessionStorage.setItem("role", user.role);
      if (userId) sessionStorage.setItem("userId", userId);
      if (user.email) sessionStorage.setItem("email", user.email);
      sessionStorage.setItem(
        "isTemporaryPassword",
        isTemporaryPassword ? "true" : "false"
      );

      if (setLoggedIn) setLoggedIn(true);
      if (setRole) setRole(user.role);
      if (setIsTemporaryPassword) setIsTemporaryPassword(isTemporaryPassword);

      if (isTemporaryPassword) {
        navigate("/new-password", { replace: true, state: { email: user.email } });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setMessage("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail.trim()) return setResetMessage("Please enter your email.");
    setResetMessage("Sending reset link...");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (data.success) {
        setResetMessage("✅ Reset link sent to your email!");
        setTimeout(() => {
          setIsForgot(false);
          setResetEmail("");
          setResetMessage("");
        }, 2500);
      } else {
        setResetMessage(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      console.error("❌ Forgot password error:", err);
      setResetMessage("Server error. Please try again later.");
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
            alt="Login background"
          />
        </div>
        <div className="col-12 col-md-4 d-flex flex-column justify-content-center vh-100 bg-white border rounded shadow p-4">
          <div className="text-center mb-4">
            <img src={Logo} alt="Logo" width="210" className="img-fluid mb-3" />
            <h2 className="fw-bold primary-text mb-0">
              {isChoosing
                ? "Welcome!"
                : isForgot
                ? "Forgot Password"
                : "Welcome back!"}
            </h2>
            <span className="fs-6 text-muted">
              {isChoosing
                ? "Please select your login type."
                : isForgot
                ? "Enter your email to reset password."
                : "Log in to your account."}
            </span>
          </div>

          {!isForgot && message && (
            <p className="text-center text-danger mt-2 fw-semibold">{message}</p>
          )}
          {isForgot && resetMessage && (
            <p className="text-center text-danger mt-2 fw-semibold">{resetMessage}</p>
          )}

          {/* =============================
              LOGIN TYPE SELECTION
          ============================= */}
          {isChoosing ? (
            <div className="text-center">
              <div className="d-flex flex-column justify-content-center gap-3">
                <button
                  className="btn btn-dark py-2"
                  onClick={() => navigate("/customer-login")}
                >
                  Tenant
                </button>
                <button
                  className="btn btn-light py-2 border"
                  onClick={() => setIsChoosing(false)}
                >
                  Offices
                </button>
              </div>
            </div>
          ) : isForgot ? (
            <form onSubmit={handleForgotPassword} className="d-flex flex-column">
              <input
                type="email"
                placeholder="Email Address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="custom-input my-1"
                disabled={loading}
              />

              <button
                type="submit"
                className="custom-button mt-3"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                className="btn flex w-100 mt-3 text-muted"
                onClick={() => setIsForgot(false)}
              >
                <i className="fa me-1 fa-solid fa-arrow-left"></i>
                Back to login
              </button>
            </form>
          ) : (
            // =============================
            // 🔹 NORMAL LOGIN FORM
            // =============================
            <>
              <form onSubmit={handleLogin} className="d-flex flex-column">
                <input
                  placeholder="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="custom-input my-1"
                  disabled={loading}
                />

                <div className="position-relative my-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="custom-input w-100 pe-5"
                    disabled={loading}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#888",
                    }}
                  >
                    {showPassword ? (
                      <i className="fa fa-solid fa-eye"></i>
                    ) : (
                      <i className="fa fa-regular fa-eye-slash"></i>
                    )}
                  </span>
                </div>

                <button
                  type="submit"
                  className="custom-button mt-3"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                {/* 🔹 Forgot password link */}
                <span
                  onClick={() => setIsForgot(true)}
                  className="text-decoration-none ms-auto mt-2 text-muted"
                  style={{ cursor: "pointer" }}
                >
                  Forgot password?
                </span>
              </form>

              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn flex w-100"
                  onClick={() => setIsChoosing(true)}
                  disabled={loading}
                >
                  <i className="fa me-1 fa-solid fa-arrow-left"></i>
                  Go back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
