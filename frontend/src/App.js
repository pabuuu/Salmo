import React, { useState } from "react";
import Login from "./LoginRegister/login";   // ✅ correct path
import Dashboard from "./Dashboard";         // ✅ make sure Dashboard.js exists

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return loggedIn ? (
    <Dashboard />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}

export default App;
