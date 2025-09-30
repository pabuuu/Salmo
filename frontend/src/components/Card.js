import React from "react";
import "../styles/Components.css"
function Card({ children,width,height }) {
  return (
    <div className="card d-flex flex-column py-2 px-3" style={{width,height}}>
      {children}
    </div>
  );
}

export default Card;