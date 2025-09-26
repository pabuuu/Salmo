import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// 🔑 Auth Pages (using your current folder names)
import Login from "./views/login";
import Register from "./views/register";

// 🏠 Dashboard
import Dashboard from "./Dashboard";

// 📂 Main Pages
import Tenants from "./Routes/Tenants";
import Units from "./Routes/Units";
import Payments from "./Routes/Payments";
import OverduePayments from "./Routes/OverduePayments";
import Maintenance from "./Routes/Maintenance";
import Expenses from "./Routes/Expenses";
import Reports from "./Routes/Reports";

function App() {
  // ✅ Track login state based on token in localStorage
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      {/* ✅ Show navigation only when logged in */}
      {loggedIn && (
        <nav style={{ padding: "1rem", background: "#eee" }}>
          <Link to="/dashboard">Dashboard</Link> |{" "}
          <Link to="/tenants">Tenants</Link> |{" "}
          <Link to="/units">Units</Link> |{" "}
          <Link to="/payments">Payments</Link> |{" "}
          <Link to="/overdue">Overdue</Link> |{" "}
          <Link to="/maintenance">Maintenance</Link> |{" "}
          <Link to="/expenses">Expenses</Link> |{" "}
          <Link to="/reports">Reports</Link>
        </nav>
      )}

      <Routes>
        {/* 🔑 Auth Routes */}
        <Route
          path="/"
          element={<Login onLogin={() => setLoggedIn(true)} />}
        />
        <Route path="/register" element={<Register />} />

        {/* 🏠 Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 📂 Main Pages */}
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/units" element={<Units />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/overdue" element={<OverduePayments />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
