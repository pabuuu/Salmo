import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { useNavigate, useParams } from "react-router";
import Dropdown from "../../components/Dropdown.js";
import axios from "axios";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification.js";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function TenantsProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "info" });
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [frequencyLabel, setFrequencyLabel] = useState("Select Frequency");

  // Fetch available locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/units`);
        const allUnits = res.data.data;
        const uniqueLocations = [...new Set(allUnits.map((u) => u.location))];
        setAvailableLocations(uniqueLocations);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setAvailableLocations([]);
      }
    };
    fetchLocations();
  }, []);

  // Fetch units by location
  const fetchUnitsByLocation = async (location) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/units/getAvailableByLocation?location=${encodeURIComponent(location)}`
      );
      setAvailableUnits(res.data.data || []);
    } catch (err) {
      console.error("Error fetching units:", err);
      setAvailableUnits([]);
    }
  };

  // Assign unit to tenant
  const handleAssignUnit = async () => {
    if (!selectedUnit) return;

    try {
      await axios.put(`${BASE_URL}/tenants/${tenant._id}/assign-unit`, {
        unitId: selectedUnit._id,
      });

      setNotification({
        message: `Unit ${selectedUnit.unitNo} assigned successfully!`,
        type: "success",
      });

      // Refresh tenant info
      const res = await axios.get(`${BASE_URL}/tenants/${tenant._id}`);
      setTenant(res.data.data);

      // Reset selections
      setSelectedLocation("");
      setSelectedUnit(null);
    } catch (err) {
      console.error("Error assigning unit:", err);
      setNotification({
        message: "Failed to assign unit.",
        type: "error",
      });
    }
  };

  // Fetch tenant info
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/tenants/${id}`);
        setTenant(res.data.data);
        setFrequencyLabel(res.data.data.paymentFrequency || "Select Frequency");
      } catch (err) {
        console.error("Error fetching tenant:", err);
      }
    };
    fetchTenant();
  }, [id]);

  // Update tenant profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/tenants/${id}`, tenant);
      setNotification({
        message: "Tenant updated successfully!",
        type: "success",
      });
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error("Error updating tenant:", err);
      setNotification({
        message: "Failed to update tenant.",
        type: "error",
      });
    }
  };

  if (!tenant) return <LoadingScreen />;

  return (
    <div className="d-flex h-100 w-100">
      <Card width={"100%"} height={"100%"}>
        <div className="mx-5 p-2">
          <h1 className="text-dark">{tenant.firstName}'s Profile</h1>
          <span className="text-muted">Update your tenant's profile here</span>

          <form onSubmit={handleUpdate}>
            {/* Personal Info */}
            <div className="d-flex gap-2 mt-5">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">First Name</label>
                <input
                  placeholder="Enter first name"
                  className="custom-input form-control"
                  value={tenant.firstName || ""}
                  onChange={(e) =>
                    setTenant((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Last Name</label>
                <input
                  placeholder="Enter last name"
                  className="custom-input form-control"
                  value={tenant.lastName || ""}
                  onChange={(e) =>
                    setTenant((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="custom-input form-control"
                  value={tenant.email || ""}
                  onChange={(e) =>
                    setTenant((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Location & Unit */}
            <div className="d-flex mt-3 align-items-center gap-2">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Location</label>
                <Dropdown
                  label={
                    tenant.unitId
                      ? tenant.unitId.location
                      : selectedLocation || "Select location"
                  }
                  width={"100%"}
                  height={"42px"}
                  disabled={!!tenant.unitId}
                >
                  {!tenant.unitId &&
                    availableLocations.map((loc, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedLocation(loc);
                            fetchUnitsByLocation(loc);
                          }}
                        >
                          {loc}
                        </button>
                      </li>
                    ))}
                </Dropdown>
              </div>

              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Unit</label>
                <Dropdown
                  label={
                    tenant.unitId
                      ? `Unit ${tenant.unitId.unitNo}`
                      : selectedUnit
                      ? `Unit ${selectedUnit.unitNo} (₱${selectedUnit.rentAmount?.toLocaleString() || 0})`
                      : "Select unit"
                  }
                  width={"100%"}
                  height={"42px"}
                  disabled={!!tenant.unitId || !selectedLocation}
                >
                  {!tenant.unitId &&
                    availableUnits.map((u) => (
                      <li key={u._id}>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => setSelectedUnit(u)}
                        >
                          Unit {u.unitNo} (₱{u.rentAmount?.toLocaleString() || 0})
                        </button>
                      </li>
                    ))}
                </Dropdown>
              </div>
            </div>

            {/* Payment Frequency */}
            <div className="d-flex gap-2 mt-3" style={{ width: "25%" }}>
              <label className="form-label p-0 m-0">Payment Frequency</label>
              <Dropdown
                label={tenant.paymentFrequency || frequencyLabel}
                width={"100%"}
                height={"42px"}
                disabled={!!tenant.unitId} // optional: disable if tenant already has a unit
              >
                {["Monthly", "Quarterly", "Yearly"].map((freq) => (
                  <li key={freq}>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setTenant((prev) => ({ ...prev, paymentFrequency: freq }));
                        setFrequencyLabel(freq);
                      }}
                    >
                      {freq}
                    </button>
                  </li>
                ))}
              </Dropdown>
            </div>

            {/* Assign Unit Button */}
            {!tenant.unitId && (
              <div className="mt-3">
                <button
                  type="button"
                  className="custom-button fw-normal px-4 bg-primary text-white"
                  onClick={handleAssignUnit}
                  disabled={!selectedUnit || !tenant.paymentFrequency} // must select frequency too
                >
                  Assign Unit
                </button>
              </div>
            )}

            {/* Update / Cancel */}
            <div className="d-flex gap-2 mt-4">
              <button
                className="custom-button fw-normal px-4 bg-light border text-muted"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                className="custom-button fw-normal px-4 bg-warning"
                type="submit"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </Card>

      {notification.message && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ message: "", type: "" })}
        />
      )}
    </div>
  );
}
