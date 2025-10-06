import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./views/login";
import Dashboard from "./Dashboard";

// 📂 Main Pages
import Tenants from "./Routes/Tenants/Tenants.js";
import TenantsPost from "./Routes/Tenants/TenantsPost.js";
import TenantsProfile from "./Routes/Tenants/TenantsProfile.js";

import Units from "./Routes/Units/Units.js";
import UnitsPost from "./Routes/Units/UnitsPost.js";
import UnitsProfile from "./Routes/Units/UnitsProfile.js";

import Payments from "./Routes/Payments";
import Expenses from "./Routes/Expenses";

import Maintenance from "./Routes/Maintenance/Maintenance.js";
import MaintenancePost from "./Routes/Maintenance/MaintenancePost.js";

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
            {/* General routes (accessible to all roles) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Tenants routes */}
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/tenants/create" element={<TenantsPost />} />
            <Route path="/tenants/profile/:id" element={<TenantsProfile />} />

            {/* Units routes */}
            <Route path="/units" element={<Units />} />
            <Route path="/units/create" element={<UnitsPost />} />
            <Route path="/units/profile/:id" element={<UnitsProfile />} />

            {/* Maintenance routes */}
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/maintenance/create" element={<MaintenancePost />} />

            {/* Admin only */}
            <Route path="/payments" element={<Payments />} />
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
