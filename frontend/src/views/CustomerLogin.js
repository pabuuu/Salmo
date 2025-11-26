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
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (timer === null) return;
  
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [timer]);
  
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
        
        if (data.remainingSeconds || data.lockUntil) {
          const seconds = data.remainingSeconds
            ? data.remainingSeconds
            : Math.ceil((data.lockUntil - Date.now()) / 1000);
      
          setTimer(seconds);
        }
      
        setMessage(
          data.remainingSeconds
            ? `Too many attempts.`
            : data.message || "Login failed"
        );
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
          {timer > 0 && (
            <p className="text-center text-danger fw-bold fs-5">
              Try again in {timer} second{timer !== 1 ? "s" : ""}...
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
                disabled={loading || timer > 0}
              />  
              <div className="position-relative my-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="custom-input w-100 pe-5"
                  disabled={loading || timer > 0}
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
                className="custom-button mt-3 m-0"
                disabled={loading || timer > 0}
              >
                {loading ? "Verifying..." : "Login"}
              </button>
              <Link className="text-decoration-none ms-auto my-3" to='/forgot-password'> 
                {/* forgot password page */}
                <span className="m-0 p-0 text-muted">Forgot password?</span>
              </Link>
              <a
                className="text-center text-decoration-none"
                style={{ cursor: "pointer" }}
                onClick={() => setShowModal(true)}
              >
                Terms and Conditions
              </a>
              {showModal && (
                <div
                  className="modal fade show"
                  style={{
                    display: "block",
                    background: "rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                      <div className="modal-header">
                        <h5 className="modal-title">Terms and Conditions</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                        ></button>
                      </div>

                      <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        <h2 className="fw-bold mb-3">Privacy Policy</h2>
                        <p><strong>R. Angeles Property Leasing</strong></p>
                        <p><strong>Last Updated:</strong> November 2025</p>

                        <p>
                          R. Angeles Property Leasing (“we,” “our,” “us”) operates the website 
                          <strong> rangeles.online</strong>, which provides property leasing management 
                          and monitoring services. This Privacy Policy explains how we collect, use, 
                          store, and protect your personal information when you use our system—whether 
                          you are a tenant or an authorized staff/admin.
                        </p>

                        <h5 className="mt-3">1. Information We Collect</h5>
                        <strong>For Tenants:</strong>
                        <ul>
                          <li>Full name</li>
                          <li>Contact number and email address</li>
                          <li>ID or proof of identity</li>
                          <li>Unit and lease information</li>
                          <li>Payment records and transaction details</li>
                        </ul>
                        <strong>For Admins/Staff:</strong>
                        <ul>
                          <li>Full name</li>
                          <li>Contact number and email address</li>
                          <li>Account credentials (username, password)</li>
                          <li>Logs of actions performed within the system</li>
                        </ul>

                        <h5 className="mt-3">2. How We Use Your Information</h5>
                        <p>We use your information only for legitimate business purposes, such as:</p>
                        <ul>
                          <li>Managing tenant records and lease information</li>
                          <li>Processing and recording payments</li>
                          <li>Generating financial or maintenance reports</li>
                          <li>Communicating with tenants regarding updates, billing, or maintenance</li>
                          <li>Ensuring system security and administrative control</li>
                        </ul>
                        <p>We <strong>do not sell, rent, or trade</strong> your personal data to any third party.</p>

                        <h5 className="mt-3">3. Data Access and Security</h5>
                        <ul>
                          <li>Only verified admins and authorized staff can access the administrative side of the system.</li>
                          <li>Tenants can access only their personal and payment information.</li>
                          <li>All accounts are secured with passwords and limited permissions.</li>
                          <li>Sensitive data is stored in secure databases protected by authentication and encryption methods.</li>
                        </ul>

                        <h5 className="mt-3">4. Data Retention</h5>
                        <p>
                          We retain your personal and transaction data as long as your account or lease remains active. 
                          After termination, records may be kept for legal or accounting reasons but are securely 
                          archived or deleted when no longer necessary.
                        </p>

                        <h5 className="mt-3">5. Data Sharing and Disclosure</h5>
                        <p>Your personal information may only be disclosed:</p>
                        <ul>
                          <li>When required by law or government authorities; or</li>
                          <li>To authorized personnel within R. Angeles Property Leasing for operational purposes.</li>
                        </ul>
                        <p>We will <strong>never</strong> disclose your data to unauthorized individuals or external organizations.</p>

                        <h5 className="mt-3">6. Your Rights</h5>
                        <p>You have the right to:</p>
                        <ul>
                          <li>Access your personal data</li>
                          <li>Request corrections or updates to inaccurate information</li>
                          <li>Request deletion or restriction of processing (subject to legal requirements)</li>
                        </ul>
                        <p>For any privacy-related requests, please contact us using the details below.</p>

                        <h5 className="mt-3">7. Cookies and Tracking</h5>
                        <p>
                          Our website may use cookies to enhance functionality and improve user experience. 
                          These cookies do not collect personally identifiable information and may be disabled 
                          in your browser settings.
                        </p>

                        <h5 className="mt-3">8. Updates to This Policy</h5>
                        <p>
                          We may update this Privacy Policy as needed. Any changes will be reflected on this 
                          page with an updated “Last Updated” date. Continued use of our website means you 
                          accept any revised terms.
                        </p>

                        <h5 className="mt-3">9. Contact Information</h5>
                        <p>
                          For inquiries or concerns regarding data privacy, you may contact us at:
                        </p>
                        <ul>
                          <li><strong>Email:</strong> ra.propertyleasing@gmail.com</li>
                          <li><strong>Phone:</strong> 09474820503 (Viber available)</li>
                          <li><strong>Website:</strong> <a href="https://rangeles.online">rangeles.online</a></li>
                        </ul>

                        <p>
                          By continuing to use this website, you acknowledge that you have read, understood, 
                          and agreed to this Privacy Policy.
                        </p>
                      </div>
                      <div className="modal-footer">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowModal(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
