import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Auth & Dashboard
import Login from "./views/login";
import CustomerLogin from "./views/CustomerLogin";
import Dashboard from "./Dashboard";
import SidebarLayout from "./components/SidebarLayout";

// Tenants
import Tenants from "./Routes/Tenants/Tenants";
import TenantsPost from "./Routes/Tenants/TenantsPost";
import TenantsProfile from "./Routes/Tenants/TenantsProfile";
import TenantResetPass from "./views/TenantResetPass";
import TenantNewPass from "./views/TenantNewPass"
// Units
import Units from "./Routes/Units/Units";
import UnitsPost from "./Routes/Units/UnitsPost";
import UnitsProfile from "./Routes/Units/UnitsProfile";

// Payments
import Payments from "./Routes/Payments/Payments";
import UsersPayments from "./Routes/Payments/UsersPayments";

// Expenses
import Expenses from "./Routes/Expenses/Expenses";
import ExpensesPost from "./Routes/Expenses/ExpensesPost";
import ExpensesProfile from "./Routes/Expenses/ExpensesProfile";

// Maintenance
import Maintenance from "./Routes/Maintenance/Maintenance";
import MaintenancePost from "./Routes/Maintenance/MaintenancePost";
import MaintenanceProfile from "./Routes/Maintenance/MaintenanceProfile";

// Accounts
import AdminAccounts from "./Routes/Accounts/Admin/AdminAccounts";
import AdminPost from "./Routes/Accounts/Admin/AdminPost";
import AdminProfile from "./Routes/Accounts/Admin/AdminProfile";
import StaffAccounts from "./Routes/Accounts/Staff/StaffAccounts";
import StaffPost from "./Routes/Accounts/Staff/StaffPost";
import StaffProfile from "./Routes/Accounts/Staff/StaffProfile";

// Customer Pages
import Customer from "./Routes/Customer/Customer";
import CustomerProfile from "./Routes/Customer/CustomerProfile";

// Requirements
import Requirements from "./Routes/Accounts/Requirement";

// Password Reset
import ResetPassword from "./views/ResetPassword"; // ✅ Updated import path
import NewPassword from "./views/NewPassword";
import NewResetPassword from "./views/NewResetPassword";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  // Restore session
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedRole = sessionStorage.getItem("role");
    setLoggedIn(!!token);
    setRole(storedRole);
  }, []);

  const isAdminOrSuperAdmin = role === "admin" || role === "superadmin";

  // ===============================
  // Admin / Staff Guard
  // ===============================
  const AdminGuard = ({ children }) => {
    const storedToken = sessionStorage.getItem("token");
    const storedRole = sessionStorage.getItem("role");
    const tempPass = sessionStorage.getItem("isTemporaryPassword") === "true";

    if (!storedToken || storedRole === "customer") {
      return <Navigate to="/" replace />;
    }

    if (tempPass) {
      return <Navigate to="/new-password" replace />;
    }

    return children;
  };

  // ===============================
  // Customer Guard
  // ===============================
  const CustomerGuard = ({ children }) => {
    const storedToken = sessionStorage.getItem("token");
    const storedRole = sessionStorage.getItem("role");

    if (!storedToken || storedRole !== "customer") {
      return <Navigate to="/customer-login" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* =======================
            Public Routes
        ======================= */}
        <Route
          path="/"
          element={<Login setLoggedIn={setLoggedIn} setRole={setRole} />}
        />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/forgot-password" element={<TenantResetPass />} />
        <Route path="/reset-password-tenant" element={<TenantNewPass />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* ✅ Updated */}
        {/* =======================
            Admin Reset Password Route
        ======================= */}        
        <Route path="/reset-password-admin" element={<NewResetPassword />} />
        <Route path="/admin-forgot-password" element={<ResetPassword />} />

        {/* =======================
            New Password Route
        ======================= */}
        <Route
          path="/new-password"
          element={
            sessionStorage.getItem("isTemporaryPassword") === "true" ? (
              <NewPassword />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* =======================
            Dashboard (Top-level route)
        ======================= */}
        <Route
          path="/dashboard"
          element={
            <AdminGuard>
              <SidebarLayout role={role} setLoggedIn={setLoggedIn}>
                <Dashboard />
              </SidebarLayout>
            </AdminGuard>
          }
        />

        {/* =======================
            Customer Routes
        ======================= */}
        <Route
          path="/customer"
          element={
            <CustomerGuard>
              <Customer />
            </CustomerGuard>
          }
        />
        <Route
          path="/customer-profile"
          element={
            <CustomerGuard>
              <CustomerProfile />
            </CustomerGuard>
          }
        />

        {/* =======================
            Admin / Staff Routes
        ======================= */}
        <Route
          path="/*"
          element={
            <AdminGuard>
              <SidebarLayout role={role} setLoggedIn={setLoggedIn}>
                <Routes>
                  {/* Tenants */}
                  <Route path="/tenants" element={<Tenants />} />
                  <Route path="/tenants/create" element={<TenantsPost />} />
                  <Route path="/tenants/profile/:id" element={<TenantsProfile />} />

                  {/* Units */}
                  <Route path="/units" element={<Units />} />
                  <Route path="/units/create" element={<UnitsPost />} />
                  <Route path="/units/profile/:id" element={<UnitsProfile />} />

                  {/* Maintenance */}
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/maintenance/create" element={<MaintenancePost />} />
                  <Route path="/maintenance/:id" element={<MaintenanceProfile />} />

                  {/* Payments */}
                  {isAdminOrSuperAdmin && (
                    <>
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/tenants/:id/payments" element={<UsersPayments />} />
                    </>
                  )}

                  {/* Expenses */}
                  {isAdminOrSuperAdmin && (
                    <>
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/expenses/create" element={<ExpensesPost />} />
                      <Route path="/expenses/:id" element={<ExpensesProfile />} />
                    </>
                  )}

                  {/* Requirements */}
                  {(role === "admin" || role === "staff") && (
                    <Route path="/requirements" element={<Requirements />} />
                  )}
                  
                  {/* Accounts */}
                  {role === "superadmin" && (
                    <>
                      <Route path="/accounts/admins" element={<AdminAccounts />} />
                      <Route path="/accounts/admins/create" element={<AdminPost />} />
                      <Route path="/accounts/admins/profile/:id" element={<AdminProfile />} />
                      <Route path="/accounts/staff" element={<StaffAccounts />} />
                      <Route path="/accounts/staff/create" element={<StaffPost />} />
                      <Route path="/accounts/staff/profile/:id" element={<StaffProfile />} />
                    </>
                  )}

                  {/* Staff restrictions */}
                  {role === "staff" && (
                    <>
                      <Route path="/payments" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/tenants/:id/payments" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/expenses" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/expenses/create" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/expenses/:id" element={<Navigate to="/dashboard" replace />} />
                    </>
                  )}

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </SidebarLayout>
            </AdminGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
