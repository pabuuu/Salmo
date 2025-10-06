import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SidebarLayout({ children, role }) {
  const DESKTOP_WIDTH = 200;
  const MOBILE_WIDTH = 240;
  const BUBBLE_DIAMETER = 40; // smaller bubble
  const BUBBLE_LEFT_COLLAPSED = 4; // move a bit more to the left
  const BUBBLE_RIGHT_OVERLAP = BUBBLE_DIAMETER / 2;
  const GAP_WHEN_COLLAPSED = 16; // small right gap for main content

  const [collapsed, setCollapsed] = useState(false);
  const [isMedium, setIsMedium] = useState(window.innerWidth < 1024);
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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  }

  return (
    <div
      className="d-flex flex-row"
      style={{ height: "100vh", width: "100%", background: "#f1f5f9" }}
    >
      {/* === Overlay (mobile only) === */}
      <div
        onClick={() => setCollapsed(true)}
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          background: isMedium && !collapsed ? "rgba(0,0,0,0.45)" : "transparent",
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
        }}
      >
        <div className="px-2">
          <h5 className="text-center mb-3">Menu</h5>

          <SidebarLink to="/dashboard" label="Dashboard" icon="fa-chart-line" />
          <SidebarLink to="/tenants" label="Tenants" icon="fa-users" />
          <SidebarLink to="/units" label="Units" icon="fa-building-user" />
          <SidebarLink
            to="/maintenance"
            label="Maintenance"
            icon="fa-screwdriver-wrench"
          />

          {role === "admin" && (
            <>
              <SidebarLink to="/payments" label="Payments" icon="fa-coins" />
              <SidebarLink to="/expenses" label="Expenses" icon="fa-money-bill-wave" />
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="border-0 bg-transparent text-start w-100 px-3 py-2 fw-semibold d-flex align-items-center"
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
      </aside>

      {/* === Bubble Toggle (mobile) === */}
      {isMedium && (
        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-label={collapsed ? "Open menu" : "Close menu"}
          className="position-fixed border-0 p-0 bg-transparent d-flex align-items-center justify-content-center"
          style={{
            top: collapsed ? "16px" : "48px",
            left: `${bubbleLeft}px`,
            transform: collapsed ? "none" : "translateY(0)",
            width: `${BUBBLE_DIAMETER}px`,
            height: `${BUBBLE_DIAMETER}px`,
            zIndex: 11,
            transition:
              "left 0.35s cubic-bezier(.2,.9,.2,1), top 0.35s cubic-bezier(.2,.9,.2,1)",
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

function SidebarLink({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="d-flex align-items-center text-decoration-none px-3 py-2 fw-semibold"
      style={{
        color: "#1e293b",
        whiteSpace: "nowrap",
        transition: "background 0.18s ease, color 0.18s ease",
        gap: "10px",
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
      {label}
    </Link>
  );
}
