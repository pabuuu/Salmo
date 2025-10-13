import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import 'bootstrap/dist/css/bootstrap.min.css';

// 🔐 Auth & Dashboard
import Login from "./views/login";
import Dashboard from "./Dashboard";

// 🧩 Tenants
import Tenants from "./Routes/Tenants/Tenants.js";
import TenantsPost from "./Routes/Tenants/TenantsPost.js";
import TenantsProfile from "./Routes/Tenants/TenantsProfile.js";

// 🏢 Units
import Units from "./Routes/Units/Units.js";
import UnitsPost from "./Routes/Units/UnitsPost.js";
import UnitsProfile from "./Routes/Units/UnitsProfile.js";

// 💳 Payments
import Payments from "./Routes/Payments/Payments.js";
import UsersPayments from "./Routes/Payments/UsersPayments.js";

// 🧾 Expenses
import Expenses from "./Routes/Expenses/Expenses.js";
import ExpensesPost from "./Routes/Expenses/ExpensesPost.js";
import ExpensesProfile from "./Routes/Expenses/ExpensesProfile.js";

// 🧰 Maintenance
import Maintenance from "./Routes/Maintenance/Maintenance.js";
import MaintenancePost from "./Routes/Maintenance/MaintenancePost.js";
import MaintenanceProfile from "./Routes/Maintenance/MaintenanceProfile.js";

// 🧭 Layout
import SidebarLayout from "./components/SidebarLayout";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!sessionStorage.getItem("token"));
  const role = sessionStorage.getItem("role");

  return (
    <Router>
      {loggedIn ? (
        <SidebarLayout role={role} setLoggedIn={setLoggedIn}>
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 🧍 Tenants */}
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/tenants/create" element={<TenantsPost />} />
            <Route path="/tenants/profile/:id" element={<TenantsProfile />} />

            {/* 🏢 Units */}
            <Route path="/units" element={<Units />} />
            <Route path="/units/create" element={<UnitsPost />} />
            <Route path="/units/profile/:id" element={<UnitsProfile />} />

            {/* 🧰 Maintenance */}
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/maintenance/create" element={<MaintenancePost />} />
            <Route path="/maintenance/:id" element={<MaintenanceProfile />} />

            {/* 💳 Payments */}
            <Route path="/payments" element={<Payments />} />
            <Route path="/tenants/:id/payments" element={<UsersPayments />} />

            {/* 🧾 Expenses */}
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/create" element={<ExpensesPost />} />
            <Route path="/expenses/:id" element={<ExpensesProfile />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </SidebarLayout>
      ) : (
        <Routes>
          <Route path="/" element={<Login setLoggedIn={setLoggedIn} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
