import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";

// 🔐 Auth & Dashboard
import Login from "./views/login";
import CustomerLogin from "./views/CustomerLogin";
import Dashboard from "./Dashboard";
// 🧍 Tenants
import Tenants from "./Routes/Tenants/Tenants.js";
import TenantsPost from "./Routes/Tenants/TenantsPost.js";
import TenantsProfile from "./Routes/Tenants/TenantsProfile.js";
import TenantResetPass from "./views/TenantResetPass.js";
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

// 👥 Accounts (Separated Folders)
import AdminAccounts from "./Routes/Accounts/Admin/AdminAccounts.js";
import AdminPost from "./Routes/Accounts/Admin/AdminPost.js";
import AdminProfile from "./Routes/Accounts/Admin/AdminProfile.js";

import StaffAccounts from "./Routes/Accounts/Staff/StaffAccounts.js";
import StaffPost from "./Routes/Accounts/Staff/StaffPost.js";
import StaffProfile from "./Routes/Accounts/Staff/StaffProfile.js";

// 🧭 Layout
import SidebarLayout from "./components/SidebarLayout";

// 👤 Customer Pages
import Customer from "./Routes/Customer/Customer.js";
import CustomerProfile from "./Routes/Customer/CustomerProfile.js";

// 🔑 Password Reset
import ResetPassword from "./Routes/ResetPassword.js";
import TenantNewPass from "./views/TenantNewPass.js";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!sessionStorage.getItem("token"));
  const role = sessionStorage.getItem("role");
  const isAdminOrSuperAdmin = role === "admin" || role === "superadmin";

  return (
    <Router>
      <Routes>
        {/* 🔐 Admin Login */}
        <Route path="/" element={<Login setLoggedIn={setLoggedIn} />} />

        {/* 👥 Customer Login */}
        <Route path="/customer-login" element={<CustomerLogin />} />
        
        <Route path="/forgot-password" element={<TenantResetPass />} />
        <Route path="/reset-password-tenant" element={<TenantNewPass />} />
        {/* 🔑 Password Reset (Public Route) */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 👤 Customer Dashboard */}
        <Route
          path="/customer"
          element={
            role === "customer" && loggedIn ? (
              <Customer />
            ) : (
              <Navigate to="/customer-login" />
            )
          }
        />

        {/* 👤 Customer Profile */}
        <Route
          path="/customer-profile"
          element={
            role === "customer" && loggedIn ? (
              <CustomerProfile />
            ) : (
              <Navigate to="/customer-login" />
            )
          }
        />

        {/* 🧭 Admin/Staff Area */}
        {loggedIn && role !== "customer" ? (
          <Route
            path="/*"
            element={
              <SidebarLayout role={role} setLoggedIn={setLoggedIn}>
                <Routes>
                  {/* 📊 Dashboard */}
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* 🧍 Tenants */}
                  <Route path="/tenants" element={<Tenants />} />
                  <Route path="/tenants/create" element={<TenantsPost />} />
                  <Route
                    path="/tenants/profile/:id"
                    element={<TenantsProfile />}
                  />

                  {/* 🏢 Units */}
                  <Route path="/units" element={<Units />} />
                  <Route path="/units/create" element={<UnitsPost />} />
                  <Route path="/units/profile/:id" element={<UnitsProfile />} />

                  {/* 🧰 Maintenance */}
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route
                    path="/maintenance/create"
                    element={<MaintenancePost />}
                  />
                  <Route
                    path="/maintenance/:id"
                    element={<MaintenanceProfile />}
                  />

                  {/* 💳 Payments (Admins + SuperAdmins) */}
                  {isAdminOrSuperAdmin && (
                    <>
                      <Route path="/payments" element={<Payments />} />
                      <Route
                        path="/tenants/:id/payments"
                        element={<UsersPayments />}
                      />
                    </>
                  )}

                  {/* 🧾 Expenses (Admins + SuperAdmins) */}
                  {isAdminOrSuperAdmin && (
                    <>
                      <Route path="/expenses" element={<Expenses />} />
                      <Route
                        path="/expenses/create"
                        element={<ExpensesPost />}
                      />
                      <Route
                        path="/expenses/:id"
                        element={<ExpensesProfile />}
                      />
                    </>
                  )}

                  {/* 👥 Accounts (SuperAdmin only) */}
                  {role === "superadmin" && (
                    <>
                      {/* Admin Subroutes */}
                      <Route
                        path="/accounts/admins"
                        element={<AdminAccounts />}
                      />
                      <Route
                        path="/accounts/admins/create"
                        element={<AdminPost />}
                      />
                      <Route
                        path="/accounts/admins/profile/:id"
                        element={<AdminProfile />}
                      />

                      {/* Staff Subroutes */}
                      <Route
                        path="/accounts/staff"
                        element={<StaffAccounts />}
                      />
                      <Route
                        path="/accounts/staff/create"
                        element={<StaffPost />}
                      />
                      <Route
                        path="/accounts/staff/profile/:id"
                        element={<StaffProfile />}
                      />
                    </>
                  )}

                  {/* 🧭 Restrict Staff from admin-only routes */}
                  {role === "staff" && (
                    <>
                      <Route
                        path="/payments"
                        element={<Navigate to="/dashboard" />}
                      />
                      <Route
                        path="/tenants/:id/payments"
                        element={<Navigate to="/dashboard" />}
                      />
                      <Route
                        path="/expenses"
                        element={<Navigate to="/dashboard" />}
                      />
                      <Route
                        path="/expenses/create"
                        element={<Navigate to="/dashboard" />}
                      />
                      <Route
                        path="/expenses/:id"
                        element={<Navigate to="/dashboard" />}
                      />
                    </>
                  )}

                  {/* 🧭 Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </SidebarLayout>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
