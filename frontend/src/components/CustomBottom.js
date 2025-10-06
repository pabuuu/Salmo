import React from "react";

export default function CustomButton({
  label,
  variant = "primary", // "primary" | "secondary"
  onClick,
  type = "button",
  disabled = false,
  style = {},
}) {
  const baseStyle = {
    minWidth: "120px",
    padding: "0.6rem 1.2rem",
    borderRadius: "0.4rem",
    fontWeight: "600",
    border: "2px solid black",
    transition: "all 0.2s ease",
    cursor: disabled ? "not-allowed" : "pointer",
    ...style,
  };

  const variantStyle =
    variant === "primary"
      ? {
          backgroundColor: "black",
          color: "white",
        }
      : {
          backgroundColor: "white",
          color: "black",
        };

  return (
    <button
      type={type}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyle }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.target.style.transform = "scale(1.05)";
        e.target.style.backgroundColor =
          variant === "primary" ? "#222" : "#f5f5f5";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.target.style.transform = "scale(1)";
        e.target.style.backgroundColor =
          variant === "primary" ? "black" : "white";
      }}
    >
      {label}
    </button>
  );
}
