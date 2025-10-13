import React from "react";
import "../styles/Components.css";

function Card({ children, width, height, className, outline ,border,id }) {
  return (
    <div
      className={`card d-flex flex-column py-2 px-3 ${className || ""}`}
      style={{ width, height , outline, border}}
      id={`${id}`}
    >
      {children}
    </div>
  );
}

export default Card;
