import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";

import Login from "./views/login";
import Dashboard from "./Dashboard";

// 📂 Main Pages
import Tenants from "./Routes/Tenants/Tenants.js";
import TenantsPost from "./Routes/Tenants/TenantsPost.js";
import TenantsProfile from "./Routes/Tenants/TenantsProfile.js";

import Units from "./Routes/Units/Units.js";
import UnitsPost from "./Routes/Units/UnitsPost.js";
import UnitsProfile from "./Routes/Units/UnitsProfile.js";

import Payments from "./Routes/Payments/Payments.js";
import UsersPayments from "./Routes/Payments/UsersPayments.js"
import Expenses from "./Routes/Expenses";

import Maintenance from "./Routes/Maintenance/Maintenance.js";
import MaintenancePost from "./Routes/Maintenance/MaintenancePost.js";
import MaintenanceProfile from "./Routes/Maintenance/MaintenanceProfile.js";

import SidebarLayout from "./components/SidebarLayout";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const role = localStorage.getItem("role");

  return (
    <Router>
      {loggedIn ? (
        <SidebarLayout role={role} setLoggedIn={setLoggedIn}>
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

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
            <Route path="/maintenance/:id" element={<MaintenanceProfile />} />

            {/* Admin only */}
            <Route path="/payments" element={<Payments />} />
            <Route path="/tenants/:id/payments" element={<UsersPayments />} />
            <Route path="/expenses" element={<Expenses />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </SidebarLayout>
      ) : (
        <Routes>
          <Route path="/" element={<Login setLoggedIn={setLoggedIn} />}/>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
