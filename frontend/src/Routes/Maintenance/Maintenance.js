import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification";

function Maintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [notification, setNotification] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5050/api/maintenances");
      setMaintenances(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch maintenances:", err);
      setNotification({ type: "error", message: "Failed to fetch maintenances" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (maintenance, newStatus) => {
    try {
      // Update maintenance status
      await axios.put(`http://localhost:5050/api/maintenances/${maintenance._id}`, {
        status: newStatus,
      });

      // Update unit status accordingly
      if (maintenance.unit?._id) {
        let unitStatus = "Maintenance";
        if (newStatus === "Completed") unitStatus = "Occupied";
        if (newStatus === "Pending") {
          unitStatus = maintenance.unit.originalStatus || "Occupied";
        }
        await axios.put(`http://localhost:5050/api/units/${maintenance.unit._id}`, {
          status: unitStatus,
        });
      }

      fetchMaintenances();
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to update status" });
    }
  };

  const deleteMaintenance = async (maintenance) => {
    if (!window.confirm("Are you sure you want to delete this maintenance?")) return;
    try {
      await axios.delete(`http://localhost:5050/api/maintenances/${maintenance._id}`);
      fetchMaintenances();
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to delete maintenance" });
    }
  };

  const cancelMaintenance = async (maintenance) => {
    if (!window.confirm("Are you sure you want to cancel this maintenance?")) return;
    try {
      await axios.put(`http://localhost:5050/api/maintenances/${maintenance._id}`, {
        status: "Cancelled",
      });

      // Revert unit status
      if (maintenance.unit?._id) {
        const originalStatus = maintenance.unit.originalStatus || "Occupied";
        await axios.put(`http://localhost:5050/api/units/${maintenance.unit._id}`, {
          status: originalStatus,
        });
      }

      fetchMaintenances();
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to cancel maintenance" });
    }
  };

  const filteredMaintenances = maintenances.filter(
    (m) => m.status === statusFilter
  );

  if (loading)
    return (
      <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
        <LoadingScreen />
      </div>
    );

  const columns = [
    {
      key: "tenant",
      label: "Tenant",
      render: (val) =>
        val ? `${val.firstName || ""} ${val.lastName || ""}` : "—",
    },
    {
      key: "unit",
      label: "Unit",
      render: (_, row) =>
        row.unit ? `${row.unit.location || ""} - ${row.unit.unitNo || ""}` : "—",
    },
    { key: "task", label: "Task" },
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
        <div className="d-flex gap-2">
          {/* Pending: Move to In Process + Cancel */}
          {row.status === "Pending" && (
            <>
              <button
                className="btn btn-warning btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(row, "In Process");
                }}
              >
                Move to In Process
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelMaintenance(row);
                }}
              >
                Cancel
              </button>
            </>
          )}

          {/* In Process: Move to Completed + Back */}
          {row.status === "In Process" && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(row, "Completed");
                }}
              >
                Move to Completed
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(row, "Pending");
                }}
              >
                Back
              </button>
            </>
          )}

          {/* Completed: Back + Delete */}
          {row.status === "Completed" && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(row, "In Process");
                }}
              >
                Back
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMaintenance(row);
                }}
              >
                Delete
              </button>
            </>
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
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <div className="mb-3">
        <h1>Maintenance Tasks</h1>
      </div>

      {/* Add Maintenance button */}
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

      {/* Status tabs */}
      <div className="d-flex gap-2 mb-3">
        {["Pending", "In Process", "Completed"].map((status) => (
          <button
            key={status}
            className="btn"
            style={{
              backgroundColor: statusFilter === status ? "#1e293b" : "transparent",
              color: statusFilter === status ? "#fff" : "#1e293b",
              border: "1px solid #1e293b",
              padding: "0.375rem 0.75rem",
              borderRadius: "0.375rem",
              fontWeight: 500,
            }}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Maintenance Table */}
      <div className="table-responsive rounded">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMaintenances.length > 0 ? (
              filteredMaintenances.map((m) => (
                <tr key={m._id}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(m[col.key], m) : m[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted">
                  No maintenances for "{statusFilter}" status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Maintenance;
