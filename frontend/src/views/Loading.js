import React from "react";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center">
        <div className="spinner-border text-dark" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="mt-3 text-muted">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
