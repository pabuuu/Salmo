import React, { useState, useEffect } from "react";
import Card from "../../components/Card.js";
import Dropdown from "../../components/Dropdown.js";
import Notification from "../../components/Notification.js";
import CustomButton from "../../components/CustomBottom.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MaintenancePost() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tenant");

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedAvailableUnit, setSelectedAvailableUnit] = useState(null);

  const [task, setTask] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState("Pending");

  const [unit, setUnit] = useState({ unitNo: "", location: "" });

  const [notification, setNotification] = useState({ type: "", message: "" });
  const showNotification = (type, message) => setNotification({ type, message });

  // Fetch tenants and units
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsRes, unitsRes] = await Promise.all([
          axios.get("http://localhost:5050/api/tenants"),
          axios.get("http://localhost:5050/api/units"),
        ]);

        if (tenantsRes.data.success) setTenants(tenantsRes.data.data);

        if (unitsRes.data.success) {
          const unitsWithoutTenant = unitsRes.data.data.filter(
            (u) =>
              u.status === "Available" &&
              !tenantsRes.data.data.some((t) => {
                const tid = t.unitId?._id || t.unitId;
                return tid === u._id;
              })
          );
          setAvailableUnits(unitsWithoutTenant);
        }
      } catch (err) {
        console.error(err);
        showNotification("error", "Failed to load tenants or available units.");
      }
    };
    fetchData();
  }, []);

  // Update unit when tenant is selected
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

        const res = await axios.get(`http://localhost:5050/api/units/${unitId}`);
        if (res.data.success) {
          setUnit({ unitNo: res.data.data.unitNo, location: res.data.data.location });
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

    let unitId, tenantId;

    if (activeTab === "tenant") {
      if (!selectedTenant) return showNotification("error", "Please select a tenant.");
      unitId = selectedTenant.unitId?._id || selectedTenant.unitId;
      tenantId = selectedTenant._id;
      if (!unitId) return showNotification("error", "Selected tenant has no assigned unit.");
    } else {
      if (!selectedAvailableUnit) return showNotification("error", "Please select a unit.");
      unitId = selectedAvailableUnit._id;
      tenantId = undefined; // optional tenant
    }

    if (!task.trim()) return showNotification("error", "Please enter a task.");
    if (!schedule) return showNotification("error", "Please select a schedule date.");

    try {
      const payload = {
        unit: unitId,
        task,
        schedule: new Date(schedule), // convert to Date
        status,
      };

      if (tenantId) payload.tenant = tenantId;

      const response = await axios.post(
        "http://localhost:5050/api/maintenances/create",
        payload
      );

      if (response.data.success) {
        // Update unit status
        const newUnitStatus = status === "Completed" ? "Occupied" : "Maintenance";
        try {
          await axios.put(`http://localhost:5050/api/units/${unitId}`, {
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
        showNotification("error", response.data.message || "Failed to create maintenance.");
      }
    } catch (err) {
      console.error("Create Maintenance Error:", err.response || err);
      showNotification(
        "error",
        err.response?.data?.message || "An error occurred while creating maintenance."
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
              className={`btn ${activeTab === "tenant" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setActiveTab("tenant")}
            >
              By Tenant
            </button>
            <button
              className={`btn ${activeTab === "available" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setActiveTab("available")}
            >
              Available Units
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
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

            <div className="d-flex mt-4 gap-3 align-items-center">
              <div className="flex-grow-1">
                <label className="form-label">Task</label>
                <input
                  placeholder="Enter maintenance task"
                  className="custom-input form-control"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  required
                />
              </div>
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

            <div className="d-flex mt-4 gap-3 align-items-center">
              <div className="flex-grow-1">
                <label className="form-label">Status</label>
                <Dropdown label={status || "Select Status"} width="100%" height="42px">
                  <li>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => setStatus("Pending")}
                    >
                      Pending
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => setStatus("In Process")}
                    >
                      In Process
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => setStatus("Completed")}
                    >
                      Completed
                    </button>
                  </li>
                </Dropdown>
              </div>
            </div>

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
