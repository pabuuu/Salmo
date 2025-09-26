import React from "react";
import "../styles/Components.css"
function Card({ children }) {
  return (
    <div className="card d-flex flex-column py-2 px-3">
      {children}
    </div>
  );
}

export default Card;