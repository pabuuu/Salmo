import React, { useEffect, useState } from "react";
import Card from "../../components/Card.js";
import Dropdown from "../../components/Dropdown.js";
import LoadingScreen from "../../views/Loading.js";
import { useNavigate } from "react-router-dom";
import Notification from "../../components/Notification.js";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function TenantsPost() {
  const navigate = useNavigate();

  // form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('');
  const [initialPayment, setInitial] = useState('');
  const [error, setError] = useState("");
  // location & units
  const [location, setLocation] = useState('');
  const [availableUnits, setAvailableUnits] = useState([]);
  const [unitId, setUnitId] = useState(""); // ✅ store unitId, not just label

  // dropdown labels
  const [unitLabel, setUnitLabel] = useState("Select Unit");
  const [locationLabel, setLocationLabel] = useState("Select Location");
  const [frequencyLabel, setFrequecyLabel] = useState("Select Frequency");
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });
  // fetch units when location changes
  useEffect(() => {
    if (location) {
      fetch(`${BASE_URL}/units/getAvailableByLocation?location=${location}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAvailableUnits(data.data);
          } else {
            setAvailableUnits([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching available units:", err);
          setAvailableUnits([]);
        });
    } else {
      setAvailableUnits([]);
    }
  }, [location]);

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedUnit = availableUnits.find((u) => u._id === unitId);
    const rentAmount = selectedUnit?.rentAmount || 0;

    if (Number(initialPayment) > rentAmount) {
      setToast({
        show: true,
        type: "warning",
        message: `⚠️ Initial payment cannot exceed rent amount (₱${rentAmount.toLocaleString()}).`,
      });
      return;
    }

    setError("");

    try {
      const response = await fetch(`${BASE_URL}${BASE_URL}/tenants/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          contactNumber,
          unitId,
          paymentFrequency,
          initialPayment,
          isArchived: false,
        }),
      });

      const data = await response.json();

      if (response.ok && data.tenant) {
        // success toast
        setToast({
          show: true,
          type: "success",
          message: "Tenant created successfully!",
        });

        //navigate 
        setTimeout(() => navigate("/tenants"), 1200);
      } else {
        // failure toast
        setToast({
          show: true,
          type: "warning",
          message: data.message || "Failed to create tenant.",
        });
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
      //error toast
      setToast({
        show: true,
        type: "error",
        message: "Something went wrong while creating tenant.",
      });
    }
  };

  // handlers
  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setLocationLabel(loc);
    setUnitId(""); // reset unit if location changes
    setUnitLabel("Select Unit");
  };

  const handleUnitSelect = (unit) => {
    setUnitId(unit._id); // store actual unitId
    setUnitLabel(`Unit ${unit.unitNo}`); // show friendly label
  };

  const handleFrequencySelect = (freq) => {
    setPaymentFrequency(freq);
    setFrequecyLabel(freq);
  };

  return (
    <div className="d-flex h-100 w-100">
      <Card width={"100%"} height={"100%"}>
        <div className="mx-5 p-2">
          <h1 className="text-dark">Create a Tenant</h1>
          <span className="text-muted">Fill out the tenant details below.</span>
          <form onSubmit={handleSubmit}>
            {/* --- personal info --- */}
            <div className="d-flex gap-2 mt-5">
              <div className="flex-grow-1">
                <label className="form-label">First Name</label>
                <input
                  placeholder="Enter first name"
                  className="custom-input form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label">Last Name</label>
                <input
                  placeholder="Enter last name"
                  className="custom-input form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="custom-input form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* --- contact + unit + location --- */}
            <div className="d-flex mt-3 align-items-center gap-2">
              <div className="flex-grow-1">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  className="custom-input form-control"
                  value={contactNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 11) setContactNumber(value);
                  }}
                  maxLength={11}
                  pattern="[0-9]{11}"
                  required
                />
              </div>

              {/* location dropdown */}
              <div className="flex-grow-1">
                <label className="form-label">Location</label>
                <Dropdown label={locationLabel} width={"100%"} height={"42px"}>
                  {["Kambal Road GB", "MH Del Pilar", "Easterview", "GSIS", "Bulet", "Liamson"].map((loc) => (
                    <li key={loc}>
                      <button type="button" className="dropdown-item" onClick={() => handleLocationSelect(loc)}>
                        {loc}
                      </button>
                    </li>
                  ))}
                </Dropdown>
              </div>
              {/* units dropdown (dynamic) */}
              <div className="flex-grow-1">
                <label className="form-label">Unit</label>
                <Dropdown label={unitLabel} width={"100%"} height={"42px"}>
                  {availableUnits.length > 0 ? (
                    availableUnits.map((unit) => (
                      <li key={unit._id}>
                        <button type="button" className="dropdown-item" onClick={() => handleUnitSelect(unit)}>
                          {`Unit ${unit.unitNo}`}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li><span className="dropdown-item text-muted">No available units</span></li>
                  )}
                </Dropdown>
              </div>
            </div>
            <div className="d-flex gap-2 mt-3 align-items-start">
            <div style={{ width: "25%" }}>
                <label className="form-label">Initial Payment</label>
                <input
                  type="number"
                  placeholder="0"
                  className="custom-input form-control"
                  value={initialPayment}
                  onChange={(e) => setInitial(e.target.value)}
                  required
                />
                {error && <span className="text-danger">{error}</span>}
              </div>
              <div style={{ width: "25%" }}>
                <label className="form-label">Payment Frequency</label>
                <Dropdown label={frequencyLabel} width={"100%"} height={"42px"}>
                  {["Monthly", "Quarterly", "Yearly"].map((freq) => (
                    <li key={freq}>
                      <button type="button" className="dropdown-item" onClick={() => handleFrequencySelect(freq)}>
                        {freq}
                      </button>
                    </li>
                  ))}
                </Dropdown>
              </div>
            </div>
            {toast.show && (
              <Notification
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ show: false, type: "", message: "" })}
              />
            )}
            <div className="d-flex gap-2 mt-3">
              <button
                className="custom-button fw-normal px-4 bg-light border text-muted"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button className="custom-button fw-normal px-4 bg-success" type="submit">
                Create
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
