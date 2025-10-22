import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification";
import MaintenanceTable from "../../components/MaintenanceTable";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

function Maintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [notification, setNotification] = useState({
    type: "",
    message: "",
    actions: null,
  });

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/maintenances`);
      setMaintenances(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch maintenances:", err);
      setNotification({
        type: "error",
        message: "Failed to fetch maintenances",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (message, onConfirm) => {
    setNotification({
      message,
      type: "info",
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

  const updateStatus = async (maintenance, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/maintenances/${maintenance._id}`, {
        status: newStatus,
      });

      if (maintenance.unit?._id) {
        let unitStatus = "Maintenance";
        if (newStatus === "Completed" || newStatus === "Pending") {
          unitStatus = maintenance.tenant ? "Occupied" : "Available";
        }

        await axios.put(`${BASE_URL}/units/${maintenance.unit._id}`, {
          status: unitStatus,
        });
      }

      fetchMaintenances();
      setNotification({
        type: "success",
        message: `Moved to ${newStatus} successfully.`,
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to update status" });
    }
  };

  const cancelMaintenance = async (maintenance) => {
    try {
      await axios.put(`${BASE_URL}/maintenances/${maintenance._id}`, {
        status: "Cancelled",
      });

      if (maintenance.unit?._id) {
        const unitStatus = maintenance.tenant ? "Occupied" : "Available";
        await axios.put(`${BASE_URL}/units/${maintenance.unit._id}`, {
          status: unitStatus,
        });
      }

      fetchMaintenances();
      setNotification({
        type: "success",
        message: "Maintenance cancelled successfully.",
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to cancel maintenance" });
    }
  };

  const deleteMaintenance = async (maintenance) => {
    try {
      await axios.delete(`${BASE_URL}/maintenances/${maintenance._id}`);
      fetchMaintenances();
      setNotification({
        type: "success",
        message: "Maintenance deleted successfully.",
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to delete maintenance" });
    }
  };

  // Filter logic (by status and priority)
  const filteredMaintenances = maintenances.filter((m) => {
    const statusMatch = m.status === statusFilter;
    const priorityMatch =
      priorityFilter === "All" || m.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading)
    return (
      <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
        <LoadingScreen />
      </div>
    );

  // Function for coloring priorities
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-danger fw-semibold";
      case "Medium":
        return "text-warning fw-semibold";
      case "Low":
        return "text-success fw-semibold";
      default:
        return "text-muted fst-italic";
    }
  };

  const columns = [
    {
      key: "tenant",
      label: "Tenant",
      render: (val) =>
        val ? (
          `${val.firstName || ""} ${val.lastName || ""}`
        ) : (
          <span className="text-muted fst-italic">No Tenant</span>
        ),
    },
    {
      key: "unit",
      label: "Unit",
      render: (_, row) =>
        row.unit ? `${row.unit.location || ""} - ${row.unit.unitNo || ""}` : "—",
    },
    { key: "task", label: "Task" },
    {
      key: "priority",
      label: "Priority",
      render: (val) => (
        <span className={getPriorityColor(val)}>
          {val || <span className="text-muted fst-italic">No Priority</span>}
        </span>
      ),
    },
    {
      key: "schedule",
      label: "Scheduled Date",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "—"),
    },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {row.status === "Pending" && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction("Move this maintenance to 'In Process'?", () =>
                    updateStatus(row, "In Process")
                  );
                }}
              >
                Move to In Process
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction("Cancel this maintenance task?", () =>
                    cancelMaintenance(row)
                  );
                }}
              >
                Cancel
              </button>
            </>
          )}

          {row.status === "In Process" && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction("Mark this maintenance as 'Completed'?", () =>
                    updateStatus(row, "Completed")
                  );
                }}
              >
                Move to Completed
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction("Move back to 'Pending'?", () =>
                    updateStatus(row, "Pending")
                  );
                }}
              >
                Back
              </button>
            </>
          )}

          {row.status === "Completed" && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction("Move this maintenance back to 'In Process'?", () =>
                    updateStatus(row, "In Process")
                  );
                }}
              >
                Back
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction("Delete this completed maintenance record?", () =>
                    deleteMaintenance(row)
                  );
                }}
              >
                Delete
              </button>
            </>
          )}

          {row.status === "Cancelled" && (
            <button
              className="btn btn-danger btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                confirmAction("Delete this cancelled maintenance record?", () =>
                  deleteMaintenance(row)
                );
              }}
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid">
      <Notification
        type={notification.type}
        message={notification.message}
        actions={notification.actions}
        onClose={() => setNotification({ type: "", message: "", actions: null })}
      />

      <div className="mb-2">
        <h1>Maintenance Tasks</h1>
      </div>

      <div className="text-muted mb-4" style={{ fontWeight: 500 }}>
        {filteredMaintenances.length}{" "}
        {filteredMaintenances.length === 1
          ? "Maintenance Found"
          : "Maintenances Found"}
      </div>

      <div className="mb-3">
        <Link
          to="/maintenance/create"
          style={{
            backgroundColor: "#198754",
            color: "white",
            padding: "6px 16px",
            borderRadius: "6px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "all 0.2s ease",
            display: "inline-block",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#146c43")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#198754")}
        >
          + Add Maintenance
        </Link>
      </div>

      {/* Status filter buttons */}
      <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
        {["Pending", "In Process", "Completed", "Cancelled"].map((status) => (
          <button
            key={status}
            className="btn"
            style={{
              backgroundColor: statusFilter === status ? "#000" : "transparent",
              color: statusFilter === status ? "#fff" : "#1e293b",
              border: "1px solid #000",
              padding: "0.375rem 0.75rem",
              borderRadius: "0.375rem",
              fontWeight: 500,
            }}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}

        {/* Priority Dropdown (styled like Units filter) */}
        ````<div className="ms-auto d-flex align-items-center">
          <label htmlFor="priorityFilter" className="me-2 fw-semibold text-dark">
            Priority:
          </label>
          <select
            id="priorityFilter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-select"
            style={{
              width: "180px",
              border: "1px solid #000",
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "0.95rem",
              color: "#1e293b",
              backgroundColor: "#fff",
              fontWeight: 500,
              transition: "all 0.2s ease",
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='5'%3E%3Cpath fill='black' d='M0 0l5 5 5-5z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "10px 5px",
            }}
            onMouseOver={(e) => (e.target.style.borderColor = "#333")}
            onMouseOut={(e) => (e.target.style.borderColor = "#000")}
          >
            <option value="All">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {filteredMaintenances.length === 0 ? (
        <div
          className="d-flex justify-content-center align-items-center text-muted"
          style={{
            height: "200px",
            fontSize: "1rem",
            fontStyle: "italic",
          }}
        >
          No Maintenance Found
        </div>
      ) : (
        <MaintenanceTable columns={columns} data={filteredMaintenances} />
      )}
    </div>
  );
}

export default Maintenance;
