import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Notification({ type = "info", message, onClose, actions, icon }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) setVisible(true);

    if (message && (!actions || actions.length === 0)) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose && onClose(), 300); // Wait for fade-out
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, actions]);

  if (!message) return null;

  const bgColors = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-primary text-white",
  };

  const fadeStyle = {
    transition: "opacity 0.3s ease",
    opacity: visible ? 1 : 0,
  };

  // Confirmation modal
  if (actions && actions.length > 0) {
    return createPortal(
      <>
        {/* Overlay */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9998,
            ...fadeStyle,
          }}
        ></div>

        {/* Modal */}
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            minWidth: "350px",
            maxWidth: "90%",
            zIndex: 9999,
            borderRadius: "8px",
            padding: "1.5rem",
            color: "#333",
            boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            ...fadeStyle,
          }}
        >
          <div className="d-flex flex-column gap-3">
            <div className="d-flex flex-column gap-2">
              {icon && <span style={{ fontSize: "1.5rem" }}>{icon}</span>}
              <span className="fw-semibold">{message}</span>
            </div>
            <div className="d-flex gap-3 justify-content-center mt-3">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  className={`btn ${
                    action.type === "primary"
                      ? "btn-warning text-dark fw-bold"
                      : action.type === "danger"
                      ? "btn-danger fw-bold"
                      : "btn-secondary"
                  }`}
                  onClick={() => {
                    setVisible(false);
                    setTimeout(() => action.onClick(), 300);
                  }}
                  style={{ minWidth: "100px", padding: "0.6rem 1.2rem", borderRadius: "0.4rem" }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  }

  // Top-center notifications
  return createPortal(
    <div
      className={`notification position-fixed top-0 start-50 translate-middle-x mt-3 p-3 rounded shadow-lg ${bgColors[type]}`}
      style={{ zIndex: 9999, minWidth: "300px", borderLeft: type === "warning" ? "5px solid #f0ad4e" : "none", ...fadeStyle }}
    >
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center gap-2">
          {icon && <span style={{ fontSize: "1.5rem" }}>{icon}</span>}
          <span className="flex-grow-1">{message}</span>
          <button
            className="btn-close btn-close-white ms-2"
            onClick={() => {
              setVisible(false);
              setTimeout(() => onClose && onClose(), 300);
            }}
          ></button>
        </div>
      </div>
    </div>,
    document.body
  );
}
