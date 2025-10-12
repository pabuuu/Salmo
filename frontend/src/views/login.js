import React, { useState } from "react";
import Card from "../components/Card";
import Logo from '../assets/logo.png'
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);


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
      // call API
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await res.json();
      
      if (data.success) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role);
        window.location.href = "/dashboard";
        // redirect later
      } else {
        setMessage(data.message || "login failed");
      }
    } catch (err) {
      setMessage("Error connecting to server");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <Card>
          <div className="header mb-4 ">
            <div className="d-flex justify-content-center">
              <img src={Logo} alt="Logo" width="210" className="img-fluid" />
            </div>
            <h2 className="fw-bold m-0 p-0 primary-text">Welcome back!</h2>
            <span className="fs-6 text-muted ">Log in to your account.</span>
          </div>
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
                {showPassword ? <i class="fa fa-solid fa-eye"></i> : <i class="fa fa-regular fa-eye-slash"></i>}
              </span>
            </div>
            <button type="submit" className="custom-button">Login</button>
          </form>
          <p className="warning-msg">{message}</p>
        </Card>
    </div>
  );
}
