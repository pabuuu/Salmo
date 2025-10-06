import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";

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
        <SidebarLayout role={role}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/tenants/create" element={<TenantsPost />} />
            <Route path="/tenants/profile/:id" element={<TenantsProfile />} />
            <Route path="/units" element={<Units />} />
            <Route path="/units/create" element={<UnitsPost />} />
            <Route path="/units/profile/:id" element={<UnitsProfile />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </SidebarLayout>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
