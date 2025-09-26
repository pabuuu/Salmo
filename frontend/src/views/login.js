import React, { useState } from "react";
import Card from "../components/Card";
export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setMessage(data.message || "Registered!");
    } catch (err) {
      setMessage("Error registering user");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <Card>
          <div className="header border">
            <h2 className="text-warning fw-bol m-0 p-0">Welcome back!</h2>
            <span className="text-xs">Log in to your account.</span>
          </div>
          <form onSubmit={handleRegister} className="d-flex flex-column">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="custom-input my-1"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="custom-input my-1"
            />
            <button type="submit">Register</button>
          </form>
          <p>{message}</p>
        </Card>
    </div>
  );
}

// const handleLogin = async (e) => {
//   e.preventDefault();
//     try {
//       const res = await fetch("/api/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });
//       const data = await res.json();

//       if (data.success) {
//         localStorage.setItem("token", data.token);
//         setMessage("Login successful!");
//       } else {
//         setMessage(data.message || "Login failed");
//       }
//     } catch (err) {
//       setMessage("Error logging in");
//   }
// };