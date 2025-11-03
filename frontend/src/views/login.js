import React, { useState } from "react";
import Card from "../components/Card";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import login_image from "../assets/backgrounds/login_img.png";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChoosing, setIsChoosing] = useState(true); // 👈 login type selection
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage("Username is required");
      return;
    }

    if (!password.trim()) {
      setMessage("Password is required");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }

    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role);
        window.location.href = "/dashboard";
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Error connecting to server");
    }
  };

  return (
    <div className="d-flex vh-100">
      <div className="row w-100 m-3">
        {/* Left Image */}
        <div className="col-12 col-md-8">
          <img
            src={login_image}
            className="h-100 w-100 img-fluid img"
            style={{ display: "flex", objectFit: "contain" }}
          />
        </div>

        {/* Right Form Section */}
        <div className="col-12 col-md-4 border d-flex flex-column h-100 justify-content-center bg-white border rounded px-4 shadow">
          <div className="header mb-4 text-center">
            <img src={Logo} alt="Logo" width="210" className="img-fluid mb-2" />
            <h2 className="fw-bold m-0 p-0 primary-text">Welcome back!</h2>
            <span className="fs-6 text-muted">
              {isChoosing
                ? "Please select your login type."
                : "Log in to your account."}
            </span>
          </div>

          {/* Step 1: Ask login type */}
          {isChoosing ? (
            <div className="text-center">
              <p className="mb-3 fw-semibold">Are you a paying customer?</p>
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-dark"
                  onClick={() => navigate("/customer-login")}
                >
                  Yes
                </button>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => setIsChoosing(false)}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 2: Admin login form */}
              <form onSubmit={handleLogin} className="d-flex flex-column">
                <input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="custom-input my-1"
                />
                <div className="position-relative my-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="custom-input w-100 pe-5"
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
                      fontSize: "0.9rem",
                      userSelect: "none",
                    }}
                  >
                    {showPassword ? (
                      <i className="fa fa-solid fa-eye"></i>
                    ) : (
                      <i className="fa fa-regular fa-eye-slash"></i>
                    )}
                  </span>
                </div>
                <button type="submit" className="custom-button">
                  Login
                </button>
              </form>

              <p className="warning-msg text-center mt-3">{message}</p>

              {/* 👇 NEW: Redirect for customers who chose "No" by mistake */}
              <div className="text-center mt-3">
                <p className="text-muted mb-2">
                  Are you actually a paying customer?
                </p>
                <button
                  className="btn btn-outline-dark w-100"
                  onClick={() => navigate("/customer-login")}
                >
                  Go to Customer Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
