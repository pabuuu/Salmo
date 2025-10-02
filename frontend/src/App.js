import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./views/login";
import Dashboard from "./Dashboard";
// 📂 Main Pages
import Tenants from "./Routes/Tenants/Tenants.js";
import Units from "./Routes/Units/Units.js";
import Payments from "./Routes/Payments";
import Maintenance from "./Routes/Maintenance";
import Expenses from "./Routes/Expenses";
import TenantsPost from "./Routes/Tenants/TenantsPost";
import TenantsProfile from "./Routes/Tenants/TenantsProfile.js";
import UnitsPost from "./Routes/Units/UnitsPost.js";
import UnitsProfile from "./Routes/Units/UnitsProfile.js";

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
            {/* ✅ new tenants sub-route */}
            <Route path="/tenants/create" element={<TenantsPost />} />
            <Route path="/tenants/profile/:id" element={<TenantsProfile />} />
            <Route path="/units" element={<Units />} />
            {/* ✅ new units sub-route */}
            <Route path="/units/create" element={<UnitsPost />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/units/profile/:id" element={<UnitsProfile />} />
            {/* admin only */}
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
