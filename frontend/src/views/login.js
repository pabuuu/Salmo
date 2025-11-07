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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) return setMessage("Username or email is required");
    if (!password.trim()) return setMessage("Password is required");

    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: username, password }),
      });

      const data = await res.json();
      console.log("🔍 Login API response:", data);

      if (!data.success) {
        setMessage(data.message || "Login failed");
        return;
      }

      const user = data.user || {};
      const userId = user._id || user.id;

      // ✅ Check the normalized backend field
      const isTemporaryPassword =
        user.isTemporaryPassword === true || user.isTemporaryPassword === "true";

      console.log("🧠 isTemporaryPassword =", isTemporaryPassword);

      // Save session
      if (data.token) sessionStorage.setItem("token", data.token);
      if (user.role) sessionStorage.setItem("role", user.role);
      if (userId) sessionStorage.setItem("userId", userId);
      if (user.email) sessionStorage.setItem("email", user.email);
      // store as string so App guard (=== "true") works
      sessionStorage.setItem("isTemporaryPassword", isTemporaryPassword ? "true" : "false");

      if (setLoggedIn) setLoggedIn(true);
      if (setRole) setRole(user.role);
      if (setIsTemporaryPassword) setIsTemporaryPassword(isTemporaryPassword);

      // Navigate
      if (isTemporaryPassword) {
        console.log("➡️ Redirecting to /new-password");
        // pass email in state as extra safety
        navigate("/new-password", { replace: true, state: { email: user.email } });
      } else {
        console.log("➡️ Redirecting to /dashboard");
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setMessage("Error connecting to server");
    }
  };

  return (
    <div className="d-flex vh-100">
      <div className="row w-100 vh-100 m-0">
        <div className="col-12 col-md-8 p-0">
          <img
            src={login_image}
            className="h-100 w-100 img-fluid"
            style={{ objectFit: "contain" }}
            alt="Login"
          />
        </div>

        <div className="col-12 col-md-4 d-flex flex-column justify-content-center bg-white border rounded px-4 shadow">
          <div className="header mb-4 text-center">
            <img src={Logo} alt="Logo" width="210" className="img-fluid mb-2" />
            <h2 className="fw-bold m-0 p-0 primary-text">Welcome back!</h2>
            <span className="fs-6 text-muted">
              {isChoosing
                ? "Please select your login type."
                : "Log in to your account."}
            </span>
          </div>

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
          ) : (
            <>
              <form onSubmit={handleLogin} className="d-flex flex-column">
                <input
                  placeholder="Username or Email"
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

              <div className="text-center mt-3">
                <button
                  className="btn w-100 text-muted"
                  onClick={() => setIsChoosing(true)}
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
