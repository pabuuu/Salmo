import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import Notification from "../../components/Notification";
import CustomButton from "../../components/CustomBottom";
import { useNavigate } from "react-router-dom";

export default function ExpensesPost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    amount: "",
    status: "Pending",
    maintenanceId: "",
    unitId: "", // optional unit
  });
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [unitList, setUnitList] = useState([]);

  // Fetch all "In Process" maintenance tasks
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/maintenances/in-process");
        const data = await res.json();
        if (res.ok && data.success) setMaintenanceList(data.maintenance || []);
      } catch (err) {
        console.error("🔥 Error fetching maintenance:", err);
      }
    };
    fetchMaintenance();
  }, []);

  // Fetch all units (available and occupied)
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/units");
        const data = await res.json();
        if (res.ok && data.success) setUnitList(data.data || []);
      } catch (err) {
        console.error("🔥 Error fetching units:", err);
      }
    };
    fetchUnits();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  // Ensure Maintenance category always has Pending status
  const payload = {
    ...form,
    amount: Number(form.amount),
    unitId: form.unitId || null,
    status: form.category === "Maintenance" ? "Pending" : form.status,
  };

  try {
    const res = await fetch("http://localhost:5050/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setNotification({ type: "success", message: "Expense added successfully!" });
      setTimeout(() => navigate("/expenses"), 1200);
    } else {
      setNotification({ type: "error", message: data.message || "Failed to add expense." });
    }
  } catch (err) {
    console.error("❌ Request failed:", err);
    setNotification({ type: "error", message: "Request failed." });
  }
};

  return (
    <div className="d-flex h-100 w-100">
      <Card width="100%" height="100%">
        <div className="mx-5 p-3">
          <h1>Add Expense</h1>
          <form onSubmit={handleSubmit} className="mt-3">
            <label>Title</label>
            <input
              className="form-control mb-3"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <label>Description</label>
            <textarea
              className="form-control mb-3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label>Category</label>
            <select
              className="form-select mb-3"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value, maintenanceId: "" })
              }
              required
            >
              <option value="">Select Category</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Supplies">Supplies</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>

            {/* Maintenance dropdown only if category = Maintenance */}
            {form.category === "Maintenance" && (
              <>
                <label>Select Maintenance</label>
                <select
                  className="form-select mb-3"
                  value={form.maintenanceId}
                  onChange={(e) => setForm({ ...form, maintenanceId: e.target.value })}
                  required
                >
                  <option value="">Select a maintenance task</option>
                  {maintenanceList.length > 0 ? (
                    maintenanceList.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.task} — {m.unit?.unitNo || "Unknown Unit"} ({m.unit?.location || "Unknown Location"})
                      </option>
                    ))
                  ) : (
                    <option disabled>No In-Process Maintenance</option>
                  )}
                </select>
              </>
            )}

            {/* Optional Unit dropdown - hidden if category = Maintenance */}
            {form.category !== "Maintenance" && (
              <>
                <label>Select Unit (Optional)</label>
                <select
                  className="form-select mb-3"
                  value={form.unitId}
                  onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                >
                  <option value="">No unit selected</option>
                  {unitList.length > 0 &&
                    unitList.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.unitNo} ({u.location})
                      </option>
                    ))}
                </select>
              </>
            )}

            <label>Amount (₱)</label>
            <input
              type="number"
              className="form-control mb-3"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />

            <div className="d-flex gap-3 mt-4">
              <CustomButton label="Cancel" variant="secondary" onClick={() => navigate(-1)} />
              <CustomButton label="Create" type="submit" variant="primary" />
            </div>
          </form>
        </div>
      </Card>

      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />
    </div>
  );
}
