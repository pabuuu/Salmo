import React, { useState, useEffect } from "react";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import login_image from "../assets/backgrounds/login_img.png";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tenantId, setTenantId] = useState(null);
  const [hasPassword, setHasPassword] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    if (token && role === "customer") {
      navigate("/customer"); 
    }
  }, [navigate]);

  useEffect(() => {
    const checkPasswordField = async () => {
      if (!email.trim()) return;
      setMessage("Checking account...");

      try {
        const res = await fetch(`${BASE_URL}/auth/check-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (data.success) {
          setTenantId(data.tenantId);
          setHasPassword(!data.isNullPassword);
          if (data.isNullPassword)
            setMessage("Your account has no password. Please set one.");
          else setMessage("");
        } else {
          setMessage("Account not found.");
        }
      } catch (err) {
        console.error("Error checking password:", err);
        setMessage("Error connecting to server.");
      }
    };

    const delay = setTimeout(checkPasswordField, 600);
    return () => clearTimeout(delay);
  }, [email]);

  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim())
      return setMessage("Please fill in all password fields.");

    // at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return setMessage(
        "Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character."
      );
    }

    if (newPassword !== confirmPassword)
      return setMessage("Passwords do not match.");

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Password created successfully! You can now log in.");
        setHasPassword(true);
      } else {
        setMessage(data.message || "Failed to set password.");
      }
    } catch (err) {
      console.error("Set password error:", err);
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };


  // ✅ Handle normal login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) return setMessage("Email is required");
    if (!password.trim()) return setMessage("Password is required");

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/customer-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", "customer");
        sessionStorage.setItem("tenantId", data.tenant.id);
        sessionStorage.setItem("tenantEmail", data.tenant.email);
        sessionStorage.setItem(
          "tenantName",
          `${data.tenant.firstName} ${data.tenant.lastName}`
        );
        sessionStorage.setItem("unitId", data.tenant.unitId);

        navigate("/customer");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Error connecting to server");
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
              {hasPassword ? "Welcome!" : "Set Your Password"}
            </h2>
            <span className="fs-6 text-muted">
              {hasPassword ? "Tenant Login" : "Complete your account setup"}
            </span>
          </div>
          {message && (
            <p className="text-center text-danger mt-3 fw-semibold">
              {message}
            </p>
          )}
          {!hasPassword ? (
            <form onSubmit={handleSetPassword} className="d-flex flex-column">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="custom-input my-1"
                disabled={loading}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="custom-input my-1"
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
          ) : (
            <form onSubmit={handleLogin} className="d-flex flex-column">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="custom-input my-1"
                disabled={loading}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="custom-input my-1"
                disabled={loading}
              />

              <button
                type="submit"
                className="custom-button mt-3 m-0"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Login"}
              </button>
              <Link className="text-decoration-none ms-auto" to='/forgot-password'> 
                {/* forgot password page */}
                <span className="m-0 p-0 text-muted">Forgot password?</span>
              </Link>
            </form>
          )}

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn flex w-100"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              <i className="fa me-1 fa-solid fa-arrow-left"></i>
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
