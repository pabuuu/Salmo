import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 🔑 Auth Pages (using your current folder names)
import Login from "./views/login";

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

// ✅ NEW: Sidebar Layout
import SidebarLayout from "./components/SidebarLayout";

function App() {
  // ✅ Check login state once (keep simple)
  const [loggedIn] = useState(!!localStorage.getItem("token"));
  const role = localStorage.getItem("role");

  return (
    <Router>
      {loggedIn ? (
        // ✅ Wrap routes inside SidebarLayout
        <SidebarLayout role={role}>
          <Routes>
            {/* general (lahat may access) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/units" element={<Units />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/reports" element={<Reports />} />
            {/* admin only */}
            <Route path="/payments" element={<Payments />} />
            <Route path="/overdue" element={<OverduePayments />} />
            <Route path="/expenses" element={<Expenses />} />
          </Routes>
        </SidebarLayout>
      ) : (
        // 🔑 Login page only when not logged in
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
