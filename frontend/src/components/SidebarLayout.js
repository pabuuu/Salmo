import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/Notification.js";
import Logo from "../assets/logo.png";

export default function SidebarLayout({ children, role, setLoggedIn }) {
  const DESKTOP_WIDTH = 240;
  const MOBILE_WIDTH = 220;
  const BUBBLE_DIAMETER = 40;
  const BUBBLE_LEFT_COLLAPSED = 4;
  const BUBBLE_RIGHT_OVERLAP = BUBBLE_DIAMETER / 2;
  const GAP_WHEN_COLLAPSED = 16;

  const [collapsed, setCollapsed] = useState(false);
  const [isMedium, setIsMedium] = useState(window.innerWidth < 1024);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    function handleResize() {
      setIsMedium(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setCollapsed(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMedium ? MOBILE_WIDTH : DESKTOP_WIDTH;
  const bubbleLeft = collapsed
    ? BUBBLE_LEFT_COLLAPSED
    : sidebarWidth - BUBBLE_RIGHT_OVERLAP;

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("verificationShown"); // reset modal flag
    setLoggedIn(false);
    navigate("/", { replace: true });
  }

  return (
    <div
      className="d-flex flex-row"
      style={{ height: "100vh", width: "100%", background: "#f1f5f9" }}
    >
      {/* === Overlay for mobile === */}
      <div
        onClick={() => setCollapsed(true)}
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background:
            isMedium && !collapsed ? "rgba(0,0,0,0.45)" : "transparent",
          opacity: isMedium && !collapsed ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: isMedium && !collapsed ? "auto" : "none",
          zIndex: 9,
        }}
      />

      {/* === Sidebar === */}
      <aside
        className={`d-flex flex-column justify-content-between bg-white shadow ${
          isMedium ? "position-fixed" : "position-relative"
        }`}
        style={{
          width: `${sidebarWidth}px`,
          height: "100%",
          top: 0,
          left: 0,
          paddingTop: 20,
          transform: isMedium && collapsed ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.35s cubic-bezier(.2,.9,.2,1)",
          zIndex: 10,
          overflowY: "auto",
          wordBreak: "break-word",
        }}
      >
        <div className="px-2">
          {/* === Logo and Role === */}
          <div className="d-flex justify-content-center flex-column mb-3 text-center">
            <img
              src={Logo}
              alt="Logo"
              width="180"
              className="img-fluid mx-auto mb-2"
              style={{ maxWidth: "80%" }}
            />
            <span
              className="text-uppercase fw-bold text-truncate px-2"
              style={{ fontSize: "14px" }}
            >
              {role || ""}
            </span>
          </div>

          <span className="text-start text-muted fw-bold px-3 d-block mb-2">
            Menu
          </span>

          {/* === Main Links === */}
          <SidebarLink to="/dashboard" label="Dashboard" icon="fa-chart-line" />
          <SidebarLink to="/tenants" label="Tenants" icon="fa-users" />
          <SidebarLink to="/units" label="Units" icon="fa-building-user" />

          {/* ✅ Requirements accessible to both Admin and Staff */}
          {(role === "admin" || role === "staff" || role === "superadmin") && (
            <SidebarLink
              to="/requirements"
              label="Requirements"
              icon="fa-folder-open"
            />
          )}

          {/* === Accounts (Super Admin only) === */}
          {role === "superadmin" && (
            <>
              <button
                onClick={() => setShowAccounts((prev) => !prev)}
                className="d-flex align-items-center justify-content-between text-decoration-none px-3 py-2 fw-semibold border-0 bg-transparent w-100"
                style={{
                  color: "#1e293b",
                  transition: "background 0.18s ease, color 0.18s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.color = "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1e293b";
                }}
              >
                <span className="d-flex align-items-center gap-2 text-truncate">
                  <i className="fa-solid fa-user-shield"></i>
                  Accounts
                </span>
                <i
                  className={`fa-solid fa-chevron-${
                    showAccounts ? "up" : "down"
                  }`}
                  style={{ fontSize: "12px" }}
                ></i>
              </button>

              <div
                className="ms-4 overflow-hidden"
                style={{
                  maxHeight: showAccounts ? "200px" : "0px",
                  opacity: showAccounts ? 1 : 0,
                  transition: "all 0.3s ease",
                }}
              >
                <SidebarLink
                  to="/accounts/admins"
                  label="Admins"
                  icon="fa-user-tie"
                />
                <SidebarLink
                  to="/accounts/staff"
                  label="Staff"
                  icon="fa-user"
                />
              </div>
            </>
          )}

          {/* === Reports Section === */}
          <button
            onClick={() => setShowReports((prev) => !prev)}
            className="d-flex align-items-center justify-content-between text-decoration-none px-3 py-2 fw-semibold border-0 bg-transparent w-100"
            style={{
              color: "#1e293b",
              transition: "background 0.18s ease, color 0.18s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#1e293b";
            }}
          >
            <span className="d-flex align-items-center gap-2 text-truncate">
              <i className="fa-solid fa-file-lines"></i>
              Reports
            </span>
            <i
              className={`fa-solid fa-chevron-${
                showReports ? "up" : "down"
              }`}
              style={{ fontSize: "12px" }}
            ></i>
          </button>

          <div
            className="ms-4 overflow-hidden"
            style={{
              maxHeight: showReports ? "200px" : "0px",
              opacity: showReports ? 1 : 0,
              transition: "all 0.3s ease",
            }}
          >
            <SidebarLink
              to="/maintenance"
              label="Maintenance"
              icon="fa-screwdriver-wrench"
            />

            {role !== "staff" && (
              <>
                <SidebarLink
                  to="/expenses"
                  label="Expenses"
                  icon="fa-money-bill-wave"
                />
                <SidebarLink
                  to="/payments"
                  label="Payments"
                  icon="fa-coins"
                />
              </>
            )}
          </div>
        </div>

        {/* === Logout === */}
        <button
          onClick={() => setShowConfirm(true)}
          className="border-0 bg-transparent text-start w-100 px-3 py-2 fw-semibold d-flex align-items-center mb-3"
          style={{ color: "#1e293b", gap: "10px" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#1e293b";
          }}
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>

        {showConfirm && (
          <Notification
            type="warning"
            message="Are you sure you want to log out?"
            actions={[
              {
                label: "Yes",
                onClick: () => {
                  handleLogout();
                  setShowConfirm(false);
                },
              },
              { label: "Cancel", onClick: () => setShowConfirm(false) },
            ]}
            onClose={() => setShowConfirm(false)}
            icon="⚠️"
          />
        )}
      </aside>

      {/* === Bubble Toggle (Mobile) === */}
      {isMedium && (
        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-label={collapsed ? "Open menu" : "Close menu"}
          className="position-fixed border-0 p-0 bg-transparent d-flex align-items-center justify-content-center"
          style={{
            top: collapsed ? "16px" : "48px",
            left: `${bubbleLeft}px`,
            width: `${BUBBLE_DIAMETER}px`,
            height: `${BUBBLE_DIAMETER}px`,
            zIndex: 11,
          }}
        >
          <div
            className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#f1f5f9",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: `${BUBBLE_DIAMETER - 12}px`,
                height: `${BUBBLE_DIAMETER - 12}px`,
                backgroundColor: "#1e293b",
                fontSize: 14,
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              }}
            >
              {collapsed ? "☰" : "<"}
            </div>
          </div>
        </button>
      )}

      {/* === Main Content === */}
      <main
        className="flex-grow-1 p-3"
        style={{
          background: "#f1f5f9",
          height: "100vh",
          overflowY: "auto",
          transition: "all 0.35s ease",
          marginLeft: isMedium && collapsed ? `${GAP_WHEN_COLLAPSED}px` : "0",
          filter: isMedium && !collapsed ? "brightness(0.6)" : "brightness(1)",
        }}
      >
        {children}
      </main>
    </div>
  );
}

/* --- Reusable Link Component --- */
function SidebarLink({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="d-flex align-items-center text-decoration-none px-3 py-2 fw-semibold"
      style={{
        color: "#1e293b",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "background 0.18s ease, color 0.18s ease",
        gap: "10px",
        fontSize: "14px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f1f5f9";
        e.currentTarget.style.color = "#0f172a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#1e293b";
      }}
    >
      <i className={`fa-solid ${icon}`}></i>
      <span className="flex-grow-1 text-truncate">{label}</span>
    </Link>
  );
}
