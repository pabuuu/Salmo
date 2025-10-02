import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { useParams, useNavigate } from "react-router";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification";
import axios from "axios";

export default function UnitsProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Unit state
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notification state
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Fetch unit data on mount
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/units/${id}`);
        if (res.data.success && res.data.data) {
          setUnit(res.data.data);
        } else {
          setNotification({ type: "error", message: "Unit not found" });
        }
      } catch (err) {
        console.error(err);
        setNotification({ type: "error", message: "Failed to fetch unit" });
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  // Handle the actual update
  const handleUpdate = async () => {
    try {
      const res = await axios.put(`http://localhost:5050/api/units/${id}`, unit);
      if (res.data.success) {
        setNotification({ type: "success", message: `Unit ${unit.unitNo} updated successfully!` });
        setTimeout(() => navigate("/units"), 1200);
      } else {
        setNotification({ type: "error", message: res.data.message || "Update failed" });
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to update unit" });
    }
  };

  // Show confirmation notification
  const confirmUpdate = () => {
    setNotification({
      type: "info",
      message: `Are you sure you want to update Unit ${unit.unitNo}?`,
      actions: [
        { label: "Yes", type: "primary", onClick: handleUpdate },
        { label: "Cancel", type: "secondary", onClick: () => setNotification({ type: "", message: "" }) },
      ],
    });
  };

  if (loading) return <LoadingScreen />;
  if (!unit)
    return (
      <div className="text-center py-5">
        <h3>Unit not found</h3>
      </div>
    );

  return (
    <div className="d-flex h-100 w-100">
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        actions={notification.actions}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <Card width="100%" height="100%">
        <div className="mx-5 p-3">
          <h1>Unit {unit.unitNo}</h1>
          <span className="text-muted">Update unit details</span>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmUpdate(); // Show confirmation notification
            }}
            className="mt-4"
          >
            {/* Unit No. (read-only, grayed out) */}
            <div className="mb-3">
              <label className="form-label">Unit No.</label>
              <input
                className="form-control"
                value={unit.unitNo || ""}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d", cursor: "not-allowed" }}
              />
            </div>

            {/* Location (read-only, grayed out) */}
            <div className="mb-3">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                value={unit.location || ""}
                readOnly
                style={{ backgroundColor: "#f5f5f5", color: "#6c757d", cursor: "not-allowed" }}
              />
            </div>

            {/* Monthly Rent */}
            <div className="mb-3">
              <label className="form-label">Monthly Rent</label>
              <input
                type="number"
                className="form-control"
                value={unit.rentAmount || ""}
                onChange={(e) => setUnit({ ...unit, rentAmount: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={unit.status || "Available"}
                onChange={(e) => setUnit({ ...unit, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/units")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-warning">
                Update
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
