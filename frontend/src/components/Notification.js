// frontend/src/components/Notification.js
import React, { useEffect } from "react";

export default function Notification({ type = "info", message, onClose }) {
  // Auto-hide after 3s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColors = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-primary text-white",
  };

  return (
    <div
      className={`notification position-fixed top-0 end-0 m-3 p-3 rounded shadow ${bgColors[type]}`}
      style={{ zIndex: 9999, minWidth: "250px" }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <span>{message}</span>
        <button
          className="btn-close btn-close-white ms-2"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
}
