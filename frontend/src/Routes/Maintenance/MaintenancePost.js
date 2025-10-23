import React, { useState, useEffect } from "react";
import Card from "../../components/Card.js";
import Dropdown from "../../components/Dropdown.js";
import Notification from "../../components/Notification.js";
import CustomButton from "../../components/CustomBottom.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function MaintenancePost() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tenant");
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedAvailableUnit, setSelectedAvailableUnit] = useState(null);

  const [tasks, setTasks] = useState([]); // ✅ multi-select tasks
  const [customTask, setCustomTask] = useState(""); // input for "Others"
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Medium");

  const [unit, setUnit] = useState({ unitNo: "", location: "" });

  const [notification, setNotification] = useState({ type: "", message: "" });
  const showNotification = (type, message) => setNotification({ type, message });

  // Fetch tenants & units
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsRes, unitsRes] = await Promise.all([
          axios.get(`${BASE_URL}/tenants`),
          axios.get(`${BASE_URL}/units`),
        ]);

        if (tenantsRes.data.success) setTenants(tenantsRes.data.data);

        if (unitsRes.data.success) {
          const availableOnly = unitsRes.data.data.filter(
            (u) => u.status === "Available"
          );
          setAvailableUnits(availableOnly);
        }
      } catch (err) {
        console.error(err);
        showNotification("error", "Failed to load tenants or available units.");
      }
    };
    fetchData();
  }, []);

  // Update unit info when tenant is selected
  useEffect(() => {
    if (!selectedTenant) return;

    const fetchUnit = async () => {
      try {
        const unitId = selectedTenant.unitId?._id || selectedTenant.unitId;
        if (!unitId) {
          setUnit({ unitNo: "", location: "" });
          showNotification("error", "Selected tenant has no assigned unit.");
          return;
        }

        const res = await axios.get(`${BASE_URL}/units/${unitId}`);
        if (res.data.success) {
          setUnit({
            unitNo: res.data.data.unitNo,
            location: res.data.data.location,
          });
        }
      } catch (err) {
        console.error(err);
        setUnit({ unitNo: "", location: "" });
        showNotification("error", "Failed to fetch assigned unit.");
      }
    };

    fetchUnit();
  }, [selectedTenant]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let unitId, tenantId;

    if (activeTab === "tenant") {
      if (!selectedTenant)
        return showNotification("error", "Please select a tenant.");
      unitId = selectedTenant.unitId?._id || selectedTenant.unitId;
      tenantId = selectedTenant._id;
      if (!unitId)
        return showNotification("error", "Selected tenant has no assigned unit.");
    } else {
      if (!selectedAvailableUnit)
        return showNotification("error", "Please select a unit.");
      unitId = selectedAvailableUnit._id;
      tenantId = undefined;
    }

    // Combine selected tasks + custom "Others"
    const finalTasks = tasks
      .map((t) => (t === "Others" ? customTask.trim() : t))
      .filter((t) => t); // remove empty strings

    if (!finalTasks.length)
      return showNotification("error", "Please select at least one task.");
    if (!schedule)
      return showNotification("error", "Please select a schedule date.");

    try {
      const payload = {
        unit: unitId,
        task: finalTasks, // ✅ send as array
        description,
        schedule: new Date(schedule),
        status,
        priority,
      };

      if (tenantId) payload.tenant = tenantId;

      const response = await axios.post(`${BASE_URL}/maintenances`, payload);

      if (response.data.success) {
        let newUnitStatus;
        if (status === "Completed") {
          newUnitStatus = activeTab === "available" ? "Available" : "Occupied";
        } else {
          newUnitStatus = "Maintenance";
        }

        try {
          await axios.put(`${BASE_URL}/units/${unitId}`, {
            status: newUnitStatus,
          });
        } catch (err) {
          console.error("Failed to update unit status:", err);
          showNotification(
            "error",
            "Maintenance created but failed to update unit status."
          );
          return;
        }

        showNotification("success", "Maintenance created successfully!");
        setTimeout(() => navigate("/maintenance"), 1200);
      } else {
        showNotification(
          "error",
          response.data.message || "Failed to create maintenance."
        );
      }
    } catch (err) {
      console.error("Create Maintenance Error:", err.response || err);
      showNotification(
        "error",
        err.response?.data?.message ||
          "An error occurred while creating maintenance."
      );
    }
  };

  return (
    <div className="d-flex h-100 w-100">
      <Card width="100%" height="100%">
        <div className="mx-5 p-2">
          <h1 className="text-dark">Create Maintenance</h1>

          {/* Tabs */}
          <div className="d-flex gap-3 mt-3">
            <button
              className={`btn ${
                activeTab === "tenant" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setActiveTab("tenant")}
            >
              By Tenant
            </button>
            <button
              className={`btn ${
                activeTab === "available" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setActiveTab("available")}
            >
              Available Units
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            {/* Tenant Tab */}
            {activeTab === "tenant" && (
              <div className="d-flex mt-4 gap-3 align-items-center">
                <div className="flex-grow-1">
                  <label className="form-label">Tenant</label>
                  <Dropdown
                    label={
                      selectedTenant
                        ? `${selectedTenant.firstName} ${selectedTenant.lastName}`
                        : "Select Tenant"
                    }
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

                <div className="flex-grow-1">
                  <label className="form-label">Unit</label>
                  <input
                    className="custom-input form-control"
                    value={unit.unitNo ? `${unit.location} - ${unit.unitNo}` : ""}
                    readOnly
                    placeholder="Unit assigned to tenant"
                  />
                </div>
              </div>
            )}

            {/* Available Units Tab */}
            {activeTab === "available" && (
              <div className="d-flex mt-4 gap-3 align-items-center">
                <div className="flex-grow-1">
                  <label className="form-label">Unit (Available Only)</label>
                  <Dropdown
                    label={
                      selectedAvailableUnit
                        ? `${selectedAvailableUnit.location} - ${selectedAvailableUnit.unitNo}`
                        : "Select Unit"
                    }
                    width="100%"
                    height="42px"
                  >
                    {availableUnits.map((unit) => (
                      <li key={unit._id}>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => setSelectedAvailableUnit(unit)}
                        >
                          {unit.location} - {unit.unitNo}
                        </button>
                      </li>
                    ))}
                  </Dropdown>
                </div>
              </div>
            )}

            {/* Task & Schedule */}
            <div className="d-flex mt-4 gap-3 align-items-center">
              {/* Task Dropdown */}
              <div className="flex-grow-1">
                <label className="form-label">Task</label>
                <Dropdown
                  label={tasks.length ? tasks.join(", ") : "Select Task"}
                  width="100%"
                  height="42px"
                >
                  {[
                    "Plumbing Repair",
                    "Electrical Repair",
                    "Aircon Maintenance",
                    "Pest Control",
                    "Cleaning Service",
                    "Painting / Repainting",
                    "Appliance Repair",
                    "Others",
                  ].map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        className={`dropdown-item ${
                          tasks.includes(option) ? "active" : ""
                        }`}
                        onClick={() => {
                          if (option === "Others") {
                            if (!tasks.includes("Others"))
                              setTasks([...tasks, "Others"]);
                          } else {
                            if (tasks.includes(option)) {
                              setTasks(tasks.filter((t) => t !== option));
                            } else {
                              setTasks([...tasks, option]);
                            }
                            if (tasks.includes("Others") && option !== "Others") {
                              setCustomTask("");
                            }
                          }
                        }}
                      >
                        {option} {tasks.includes(option) && "✓"}
                      </button>
                    </li>
                  ))}
                </Dropdown>

                {/* Show input box only when Others is selected */}
                {tasks.includes("Others") && (
                  <input
                    type="text"
                    placeholder="Specify other task"
                    className="custom-input form-control mt-2"
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Schedule */}
              <div className="flex-grow-1">
                <label className="form-label">Schedule</label>
                <input
                  type="date"
                  className="custom-input form-control"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="form-label">Description</label>
              <textarea
                className="custom-input form-control"
                placeholder="Enter detailed description of the maintenance task"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Status & Priority */}
            <div className="d-flex mt-4 gap-3 align-items-center">
              {/* Status */}
              <div className="flex-grow-1">
                <label className="form-label">Status</label>
                <Dropdown label={status} width="100%" height="42px">
                  {["Pending", "In Process", "Completed"].map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => setStatus(opt)}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </Dropdown>
              </div>

              {/* Priority */}
              <div className="flex-grow-1">
                <label className="form-label">Priority</label>
                <Dropdown label={priority} width="100%" height="42px">
                  {["Low", "Medium", "High"].map((opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => setPriority(opt)}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </Dropdown>
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex gap-3 mt-4">
              <CustomButton
                label="Cancel"
                variant="secondary"
                onClick={() => navigate(-1)}
              />
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
