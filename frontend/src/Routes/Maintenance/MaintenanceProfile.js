import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import CustomButton from "../../components/CustomBottom"; // same button as UnitsProfile
import { useParams, useNavigate } from "react-router-dom";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification";
import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function MaintenanceProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
    actions: null,
  });

  useEffect(() => {
    fetchMaintenance();
  }, [id]);

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/maintenances/${id}`);
      setMaintenance(res.data);
    } catch (err) {
      console.error("Error fetching maintenance record:", err);
      setNotification({
        type: "error",
        message: "Failed to load maintenance details",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (message, onConfirm) => {
    setNotification({
      type: "info",
      message,
      actions: [
        { label: "Yes", onClick: () => onConfirm() },
        {
          label: "Cancel",
          onClick: () =>
            setNotification({ type: "", message: "", actions: null }),
        },
      ],
    });
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/maintenances/${id}`, {
        status: newStatus,
      });
      fetchMaintenance();
      setNotification({
        type: "success",
        message: `Status updated to ${newStatus}.`,
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to update status" });
    }
  };

  const deleteMaintenance = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/maintenances/${id}`);
      setNotification({
        type: "success",
        message: "Maintenance deleted successfully.",
      });
      setTimeout(() => navigate("/maintenance"), 1200);
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to delete maintenance" });
    }
  };

  if (loading) return <LoadingScreen />;

  if (!maintenance)
    return (
      <div className="text-center py-5">
        <h3>Maintenance record not found.</h3>
        <CustomButton
          label="Back"
          variant="secondary"
          onClick={() => navigate("/maintenance")}
        />
      </div>
    );

  return (
    <div
      className="d-flex justify-content-center align-items-start w-100 h-100 p-3"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Notification
        type={notification.type}
        message={notification.message}
        actions={notification.actions}
        onClose={() => setNotification({ type: "", message: "", actions: null })}
      />

      <Card
        width="100%"
        height="auto"
        style={{
          maxWidth: "800px",
          width: "100%",
          flexGrow: 1,
          borderRadius: "16px",
        }}
      >
        <div className="p-4">
          <h1 className="mb-1">Maintenance Details</h1>
          <span className="text-muted">
            View or update this maintenance record
          </span>

          <div className="mt-4">
            {/* Tenant */}
            <div className="mb-3">
              <label className="form-label fw-bold">Tenant</label>
              <input
                className="form-control"
                value={
                  maintenance.tenant
                    ? `${maintenance.tenant.firstName || ""} ${
                        maintenance.tenant.lastName || ""
                      }`
                    : "No Tenant (Available Unit)"
                }
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Unit */}
            <div className="mb-3">
              <label className="form-label fw-bold">Unit</label>
              <input
                className="form-control"
                value={
                  maintenance.unit
                    ? `${maintenance.unit.location || ""} - ${
                        maintenance.unit.unitNo || ""
                      }`
                    : "—"
                }
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Task */}
            <div className="mb-3">
              <label className="form-label fw-bold">Task</label>
              <input
                className="form-control"
                value={maintenance.task || ""}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label fw-bold">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={maintenance.description || "No description"}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Schedule */}
            <div className="mb-3">
              <label className="form-label fw-bold">Scheduled Date</label>
              <input
                className="form-control"
                value={
                  maintenance.schedule
                    ? new Date(maintenance.schedule).toLocaleDateString()
                    : "—"
                }
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="form-label fw-bold">Status</label>
              <input
                className="form-control"
                value={maintenance.status}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d" }}
              />
            </div>

            {/* Action Buttons */}
            <div
              className="d-flex flex-wrap gap-3 justify-content-center mt-3"
              style={{ marginBottom: "1rem" }}
            >
              <CustomButton
                label="Back"
                variant="secondary"
                onClick={() => navigate("/maintenance")}
              />

              {maintenance.status === "Pending" && (
                <>
                  <CustomButton
                    label="Move to In Process"
                    variant="primary"
                    onClick={() =>
                      confirmAction(
                        "Move this maintenance to 'In Process'?",
                        () => updateStatus("In Process")
                      )
                    }
                  />
                  <CustomButton
                    label="Cancel"
                    variant="secondary"
                    onClick={() =>
                      confirmAction("Cancel this maintenance task?", () =>
                        updateStatus("Cancelled")
                      )
                    }
                  />
                </>
              )}

              {maintenance.status === "In Process" && (
                <>
                  <CustomButton
                    label="Move to Completed"
                    variant="primary"
                    onClick={() =>
                      confirmAction(
                        "Mark this maintenance as 'Completed'?",
                        () => updateStatus("Completed")
                      )
                    }
                  />
                  <CustomButton
                    label="Back to Pending"
                    variant="secondary"
                    onClick={() =>
                      confirmAction(
                        "Move this maintenance back to 'Pending'?",
                        () => updateStatus("Pending")
                      )
                    }
                  />
                </>
              )}

              {maintenance.status === "Completed" && (
                <>
                  <CustomButton
                    label="Back to In Process"
                    variant="secondary"
                    onClick={() =>
                      confirmAction(
                        "Move this maintenance back to 'In Process'?",
                        () => updateStatus("In Process")
                      )
                    }
                  />
                  <CustomButton
                    label="Delete"
                    variant="danger"
                    onClick={() =>
                      confirmAction(
                        "Delete this completed maintenance record?",
                        deleteMaintenance
                      )
                    }
                  />
                </>
              )}

              {maintenance.status === "Cancelled" && (
                <CustomButton
                  label="Delete"
                  variant="danger"
                  onClick={() =>
                    confirmAction(
                      "Delete this cancelled maintenance record?",
                      deleteMaintenance
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
