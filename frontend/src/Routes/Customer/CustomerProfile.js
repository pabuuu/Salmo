import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import axios from "axios";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification";
import { useNavigate } from "react-router-dom";
import CustomerSidebarLayout from "../../components/CustomerSidebarLayout";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function CustomerProfile() {
  const [tenant, setTenant] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(true); // ✅ added
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenant = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/customer-login", { replace: true });
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/customers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        setTenant(data);

        const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
        sessionStorage.setItem("tenantName", name || "Tenant");
      } catch (err) {
        console.error("Error fetching tenant:", err);
        setNotification({
          message: "Session expired. Please log in again.",
          type: "error",
        });
        setTimeout(() => navigate("/customer-login", { replace: true }), 1500);
      } finally {
        setLoading(false); // ✅ stop loading once done
      }
    };

    fetchTenant();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.put(`${BASE_URL}/customers/update`, tenant, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenant(res.data.data);
      setNotification({
        message: "Profile updated successfully!",
        type: "success",
      });

      const updatedName = `${tenant.firstName || ""} ${tenant.lastName || ""}`.trim();
      sessionStorage.setItem("tenantName", updatedName || "Tenant");
    } catch (err) {
      console.error("Error updating tenant:", err);
      setNotification({ message: "Failed to update profile.", type: "error" });
    }
  };

  return (
    <CustomerSidebarLayout>
      <div className="d-flex flex-grow-1">
        <div className="flex-grow-1 p-4">
          {loading ? (
            // ✅ Sidebar stays, loading shows inside layout
            <LoadingScreen />
          ) : (
            <Card width="100%" height="auto">
              <div className="mx-4 my-3">
                <h1 className="text-dark">
                  Welcome, {tenant?.firstName || "Tenant"}!
                </h1>
                <span className="text-muted">
                  Manage your profile information below.
                </span>

                <form onSubmit={handleUpdate} className="mt-4">
                  {/* Personal Info */}
                  <div className="d-flex gap-3 flex-wrap">
                    <div className="flex-grow-1">
                      <label>First Name</label>
                      <input
                        className="form-control"
                        value={tenant?.firstName || ""}
                        onChange={(e) =>
                          setTenant({ ...tenant, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label>Last Name</label>
                      <input
                        className="form-control"
                        value={tenant?.lastName || ""}
                        onChange={(e) =>
                          setTenant({ ...tenant, lastName: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={tenant?.email || ""}
                        onChange={(e) =>
                          setTenant({ ...tenant, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="d-flex gap-3 flex-wrap mt-3">
                    <div className="flex-grow-1">
                      <label>Contact Number</label>
                      <input
                        className="form-control"
                        value={tenant?.contactNumber || ""}
                        onChange={(e) =>
                          setTenant({
                            ...tenant,
                            contactNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Unit & Payment Frequency */}
                  <div className="d-flex gap-3 flex-wrap mt-3">
                    <div className="flex-grow-1">
                      <label>Unit</label>
                      <input
                        className="form-control"
                        value={
                          tenant?.unitId
                            ? `Unit ${tenant.unitId.unitNo} (${tenant.unitId.location})`
                            : "No unit assigned"
                        }
                        disabled
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label>Payment Frequency</label>
                      <input
                        className="form-control"
                        value={tenant?.paymentFrequency || "Not set"}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-warning">
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </div>

        {notification.message && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification({ message: "", type: "" })}
          />
        )}
      </div>
    </CustomerSidebarLayout>
  );
}
