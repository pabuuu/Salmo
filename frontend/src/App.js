import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// 🔑 Auth Pages (using your current folder names)
import Login from "./views/login";

// 🏠 Dashboard
import Dashboard from "./Dashboard";

// 📂 Main Pages
import Units from "./Routes/Units";
import Payments from "./Routes/Payments";
import OverduePayments from "./Routes/OverduePayments";
import Maintenance from "./Routes/Maintenance";
import Expenses from "./Routes/Expenses";
import Reports from "./Routes/Reports";
import Tenants from "./Routes/Tenants/Tenants.js";
import TenantsPost from "./Routes/Tenants/TenantsPost.js";

function App() {
  // states
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const role = localStorage.getItem("role")

  return (
    <Router>
      {/* show navigation only when logged in */}
      {loggedIn && (
        <nav style={{ padding: "1rem", background: "#eee" }}>
          <Link to="/dashboard">Dashboard</Link> |{" "}
          <Link to="/tenants">Tenants</Link> |{" "}
          <Link to="/units">Units</Link> |{" "}
          <Link to="/maintenance">Maintenance</Link> |{" "}
            {role == "admin" && (
              <>
                <Link to="/reports">Reports</Link>
                <Link to="/payments">Payments</Link> |{" "}
                <Link to="/overdue">Overdue</Link> |{" "}
                <Link to="/expenses">Expenses</Link> |{" "}
              </>
            )}
        </nav>
      )}

      <Routes>
        {/* auth? */}
        <Route
          path="/"
          element={<Login />}
        />
        {/* general (lahat may access) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/units" element={<Units />} />
        <Route path="/maintenance" element={<Maintenance/>} />
        <Route path="/reports" element={<Reports />} />
        {/* admin only */}
        <Route path="/payments" element={<Payments />} />
        <Route path="/overdue" element={<OverduePayments />} />
        <Route path="/expenses" element={<Expenses />} />

        {/* tenants navigation */}
          <Route path="/tenants/create" element={<TenantsPost />} />
      </Routes>
    </Router>
  );
}

export default App;
