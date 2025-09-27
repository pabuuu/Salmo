import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function SidebarLayout({ children, role }) {
  // === Layout Constants ===
  const DESKTOP_WIDTH = 120;    // width on large screens (≥1024px)
  const MOBILE_WIDTH = 240;     // width on medium/mobile (<1024px)
  const BUBBLE_DIAMETER = 50;   // px
  const BUBBLE_LEFT_COLLAPSED = 10; // px from left of viewport when collapsed
  const BUBBLE_RIGHT_OVERLAP = BUBBLE_DIAMETER / 2; // overlap amount

  const [collapsed, setCollapsed] = useState(false);
  const [isMedium, setIsMedium] = useState(window.innerWidth < 1024);

  // 🔄 Handle window resize
  useEffect(() => {
    function handleResize() {
      setIsMedium(window.innerWidth < 1024);
      // If we switch back to desktop, always show sidebar
      if (window.innerWidth >= 1024) setCollapsed(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pick correct sidebar width
  const sidebarWidth = isMedium ? MOBILE_WIDTH : DESKTOP_WIDTH;

  // Bubble horizontal position
  const bubbleLeft = collapsed
    ? BUBBLE_LEFT_COLLAPSED
    : sidebarWidth - BUBBLE_RIGHT_OVERLAP;

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
      }}
    >
      {/* === Overlay when sidebar is open === */}
      <div
        onClick={() => setCollapsed(true)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: isMedium && !collapsed ? "rgba(0,0,0,0.45)" : "transparent",
          opacity: isMedium && !collapsed ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: isMedium && !collapsed ? "auto" : "none",
          zIndex: 9,
        }}
      />

      {/* === Sidebar Drawer === */}
      <aside
        style={{
          position: isMedium ? "fixed" : "relative",
          top: 0,
          left: 0,
          height: "100%",
          width: `${sidebarWidth}px`,
          background: "#ffffff",
          color: "#1e293b",
          paddingTop: 20,
          transform: isMedium && collapsed ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.35s cubic-bezier(.2,.9,.2,1)",
          zIndex: 10,
          boxShadow: isMedium && !collapsed ? "4px 0 12px rgba(0,0,0,0.18)" : "none",
          overflowY: "auto",
        }}
        aria-hidden={isMedium && collapsed}
      >
        {/* Sidebar inner content */}
        <div
          style={{
            paddingBottom: 40,
            opacity: isMedium && collapsed ? 0 : 1,
            transform: isMedium && collapsed ? "translateX(-12px)" : "translateX(0)",
            transition: "opacity 0.28s ease, transform 0.28s ease",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 20, color: "#1e293b" }}>
            Menu
          </h2>

          <SidebarLink to="/dashboard" label="Dashboard" />
          <SidebarLink to="/tenants" label="Tenants" />
          <SidebarLink to="/units" label="Units" />
          <SidebarLink to="/maintenance" label="Maintenance" />
          <SidebarLink to="/reports" label="Reports" />

          {role === "admin" && (
            <>
              <SidebarLink to="/payments" label="Payments" />
              <SidebarLink to="/overdue" label="Overdue" />
              <SidebarLink to="/expenses" label="Expenses" />
            </>
          )}
        </div>
      </aside>

      {/* === Bubble Toggle Button === */}
      {isMedium && (
        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-label={collapsed ? "Open menu" : "Close menu"}
          style={{
            position: "fixed",
            top: "50%",
            left: `${bubbleLeft}px`,
            transform: "translateY(-50%)",
            width: `${BUBBLE_DIAMETER}px`,
            height: `${BUBBLE_DIAMETER}px`,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            zIndex: 11,
            transition: "left 0.35s cubic-bezier(.2,.9,.2,1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
        >
          {/* Outer bubble (white) */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
            }}
          >
            {/* Inner dark circle */}
            <div
              style={{
                width: `${BUBBLE_DIAMETER - 14}px`,
                height: `${BUBBLE_DIAMETER - 14}px`,
                borderRadius: "50%",
                background: "#1e293b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {collapsed ? "☰" : "<"}
            </div>
          </div>
        </button>
      )}

      {/* === Main Content === */}
      <main
        style={{
          flex: 1,
          padding: 20,
          background: "#f1f5f9",
          height: "100vh",
          overflowY: "auto",
          transition: "filter 0.35s ease, margin-left 0.35s ease",
          filter: isMedium && !collapsed ? "brightness(0.6)" : "brightness(1)",
          // push content right on desktop when sidebar is visible
          marginLeft: !isMedium ? `${sidebarWidth}px` : 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}

// === Sidebar Link Component ===
function SidebarLink({ to, label }) {
  return (
    <Link
      to={to}
      style={{
        color: "#1e293b",
        textDecoration: "none",
        padding: "12px 20px",
        display: "block",
        whiteSpace: "nowrap",
        transition: "background 0.18s ease, color 0.18s ease",
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
      {label}
    </Link>
  );
}
