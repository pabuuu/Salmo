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
      render: (val) => (val ? val.unitNo || "—" : "—"),
    },
    { key: "task", label: "Task" },
    {
      key: "schedule",
      label: "Scheduled Date",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "—"),
    },
    { key: "status", label: "Status" },
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
                      {col.render ? col.render(m[col.key]) : m[col.key]}
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
