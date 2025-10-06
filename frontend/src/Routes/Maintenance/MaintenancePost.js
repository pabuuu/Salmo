import React, { useState, useEffect } from "react";
import Card from "../../components/Card.js";
import Dropdown from "../../components/Dropdown.js";
import Notification from "../../components/Notification.js";
import CustomButton from "../../components/CustomBottom.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MaintenancePost() {
  const navigate = useNavigate();

  // Form states
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [unit, setUnit] = useState({ unitNo: "", location: "" });
  const [task, setTask] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState("Pending");

  // Notification
  const [notification, setNotification] = useState({ type: "", message: "" });
  const showNotification = (type, message) => setNotification({ type, message });

  // Fetch tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/tenants");
        if (res.data.success) setTenants(res.data.data);
      } catch (err) {
        console.error(err);
        showNotification("error", "Failed to load tenants.");
      }
    };
    fetchTenants();
  }, []);

  // Fetch unit when tenant changes
  useEffect(() => {
    const fetchUnit = async () => {
      if (!selectedTenant) return;

      try {
        let unitId;
        if (typeof selectedTenant.unitId === "object") {
          unitId = selectedTenant.unitId.$oid || selectedTenant.unitId._id;
        } else {
          unitId = selectedTenant.unitId;
        }

        if (!unitId) {
          setUnit({ unitNo: "", location: "" });
          showNotification("error", "This tenant has no assigned unit.");
          return;
        }

        const res = await axios.get(`http://localhost:5050/api/units/${unitId}`);
        if (res.data.success) {
          setUnit({ unitNo: res.data.data.unitNo, location: res.data.data.location });
        } else {
          setUnit({ unitNo: "", location: "" });
          showNotification("error", "Failed to fetch the assigned unit.");
        }
      } catch (err) {
        console.error(err);
        setUnit({ unitNo: "", location: "" });
        showNotification("error", "Failed to fetch the assigned unit.");
      }
    };

    fetchUnit();
  }, [selectedTenant]);

    const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure tenant is selected
    if (!selectedTenant) {
        showNotification("error", "Please select a tenant first.");
        return;
    }

    // Ensure task is not empty
    if (!task.trim()) {
        showNotification("error", "Please enter a maintenance task.");
        return;
    }

    // Ensure schedule is a valid date
    if (!schedule) {
        showNotification("error", "Please select a valid schedule date.");
        return;
    }

    try {
        // Safely extract tenant and unit IDs
        const tenantId = selectedTenant._id?._id || selectedTenant._id;
        const unitId = selectedTenant.unitId?._id || selectedTenant.unitId;

        const response = await fetch("http://localhost:5050/api/maintenances/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tenant: tenantId,
            unit: unitId,
            task,
            schedule,
            status,
        }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
        showNotification("success", "Maintenance created successfully!");
        setTimeout(() => navigate("/maintenance"), 1200);
        } else {
        showNotification("error", data.message || "Failed to create maintenance.");
        }
    } catch (error) {
        console.error("Error creating maintenance:", error);
        showNotification("error", "An error occurred while creating the maintenance.");
    }
    };

  return (
    <div className="d-flex h-100 w-100">
      <Card width="100%" height="100%">
        <div className="mx-5 p-2">
          <h1 className="text-dark">Create Maintenance</h1>
          <span className="text-muted">Select tenant and fill out maintenance details.</span>

          <form onSubmit={handleSubmit}>
            {/* Tenant selection */}
            <div className="d-flex mt-4 gap-3 align-items-center">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Tenant</label>
                <Dropdown
                  label={selectedTenant ? `${selectedTenant.firstName} ${selectedTenant.lastName}` : "Select Tenant"}
                  width="100%"
                  height="42px"
                >
                  {tenants.map((tenant) => (
                    <li key={tenant._id}>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        {tenant.firstName} {tenant.lastName}
                      </button>
                    </li>
                  ))}
                </Dropdown>
              </div>

              {/* Display Unit */}
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Unit</label>
                <input
                  className="custom-input form-control"
                  value={unit.unitNo ? `${unit.location} - ${unit.unitNo}` : ""}
                  readOnly
                  placeholder="Unit assigned to tenant"
                />
              </div>
            </div>

            {/* Task + Schedule */}
            <div className="d-flex mt-4 gap-3 align-items-center">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Task</label>
                <input
                  placeholder="Enter maintenance task"
                  className="custom-input form-control"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  required
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Schedule</label>
                <input
                  type="date"
                  className="custom-input form-control"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="d-flex mt-4 gap-3 align-items-center">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Status</label>
                <Dropdown label={status || "Select Status"} width="100%" height="42px">
                  <li>
                    <button type="button" className="dropdown-item" onClick={() => setStatus("Pending")}>
                      Pending
                    </button>
                  </li>
                  <li>
                    <button type="button" className="dropdown-item" onClick={() => setStatus("In Process")}>
                      In Process
                    </button>
                  </li>
                  <li>
                    <button type="button" className="dropdown-item" onClick={() => setStatus("Completed")}>
                      Completed
                    </button>
                  </li>
                </Dropdown>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex gap-3 mt-4">
              <CustomButton label="Cancel" variant="secondary" onClick={() => navigate(-1)} />
              <CustomButton label="Create" type="submit" variant="primary" />
            </div>
          </form>
        </div>
      </Card>

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />
    </div>
  );
}
