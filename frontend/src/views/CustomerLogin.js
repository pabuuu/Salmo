import React, { useState } from "react";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import login_image from "../assets/backgrounds/login_img.png";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  console.log("🟢 Login button clicked"); // ✅ Step 1

  if (!email.trim()) return setMessage("Email is required");
  if (!contactNumber.trim()) return setMessage("Contact number is required");
  if (!/^\d{11}$/.test(contactNumber))
    return setMessage("Contact number must be 11 digits (e.g., 09123456789)");

  setMessage("");
  setLoading(true);

  try {
    console.log("📡 Sending request to:", `${BASE_URL}/auth/customer-login`); // ✅ Step 2
    console.log("📨 Payload:", { email, contactNumber }); // ✅ Step 3

    const res = await fetch(`${BASE_URL}/auth/customer-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, contactNumber }),
    });

    console.log("📥 Raw response:", res);
    const data = await res.json();
    console.log("📦 Response JSON:", data); 

    if (data.success) {
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("role", "customer");
      sessionStorage.setItem("tenantId", data.tenant.id);
      sessionStorage.setItem("tenantEmail", data.tenant.email);
      sessionStorage.setItem("tenantContact", data.tenant.contactNumber);
      sessionStorage.setItem(
        "tenantName",
        `${data.tenant.firstName} ${data.tenant.lastName}`
      );
      sessionStorage.setItem("unitId", data.tenant.unitId);

      console.log("✅ Login success, redirecting to /customer");
      navigate("/customer");
    } else {
      console.warn("⚠️ Login failed:", data.message);
      setMessage(data.message || "Login failed");
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    setMessage("Error connecting to server");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
      <div className="row w-100">
        {/* Left Image Section */}
        <div className="col-12 col-md-8 p-0">
          <img
            src={login_image}
            className="h-100 w-100 img-fluid img"
            style={{ display: "flex", objectFit: "contain" }}
          />
        </div>

        {/* Right Form Section */}
        <div className="col-12 col-md-4 d-flex flex-column justify-content-center vh-100  bg-white border rounded shadow p-4">
          <div className="text-center mb-4">
            <img src={Logo} alt="Logo" width="210" className="img-fluid mb-3" />
            <h2 className="fw-bold primary-text mb-0">Welcome!</h2>
            <span className="fs-6 text-muted">Customer Login</span>
          </div>

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
              type="text"
              placeholder="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="custom-input my-1"
              maxLength={11}
              disabled={loading}
            />

            <button
              type="submit"
              className="custom-button mt-2"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>

          {message && (
            <p className="text-center text-danger mt-2 fw-semibold">
              {message}
            </p>
          )}

          <div className="text-center mt-3">
            {/* <p className="text-muted mb-2">Are you actually an Admin?</p> */}
            <button
              type="button"
              className="btn flex w-100"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              <i class="fa me-1 fa-solid fa-arrow-left"></i>
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
