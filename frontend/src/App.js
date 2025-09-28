import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 🔑 Auth Pages
import Login from "./views/login";

// 🏠 Dashboard
import Dashboard from "./Dashboard";

// 📂 Main Pages
import Tenants from "./Routes/Tenants/Tenants.js";
import Units from "./Routes/Units";
import Payments from "./Routes/Payments";
import OverduePayments from "./Routes/OverduePayments";
import Maintenance from "./Routes/Maintenance";
import Expenses from "./Routes/Expenses";
import Reports from "./Routes/Reports";
import TenantsPost from "./Routes/Tenants/TenantsPost"; // ✅ keep their extra page

// ✅ Sidebar Layout
import SidebarLayout from "./components/SidebarLayout";

function App() {
  const [loggedIn] = useState(!!localStorage.getItem("token"));
  const role = localStorage.getItem("role");

  return (
    <Router>
      {loggedIn ? (
        // ✅ Sidebar + Protected Routes
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
            {/* ✅ new tenants sub-route */}
            <Route path="/tenants/create" element={<TenantsPost />} />
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
