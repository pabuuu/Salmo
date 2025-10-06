import React, { useState } from "react";
import Card from "../../components/Card.js";
import Dropdown from "../../components/Dropdown.js";
import Notification from "../../components/Notification.js";
import CustomButton from "../../components/CustomBottom.js"; // ✅ Import our reusable button
import { useNavigate } from "react-router-dom";

export default function UnitsPost() {
  const navigate = useNavigate();

  // useStates for form fields
  const [unitNo, setUnitNo] = useState("");
  const [location, setLocation] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [status, setStatus] = useState("Available");

  // 🔔 Notification state
  const [notification, setNotification] = useState({ type: "", message: "" });

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5050/api/units/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNo,
          location,
          rentAmount: Number(rentAmount),
          status,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification("success", "Unit created successfully!");
        setTimeout(() => navigate("/units"), 1200);
      } else {
        showNotification("error", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error creating unit:", error);
      showNotification("error", "Something went wrong while creating the unit.");
    }
  };

  return (
    <div className="d-flex h-100 w-100">
      <Card width={"100%"} height={"100%"}>
        <div className="mx-5 p-2">
          <h1 className="text-dark">Create a Unit</h1>
          <span className="text-muted">Fill out the unit details below.</span>

          <form onSubmit={handleSubmit}>
            {/* Unit Number + Location */}
            <div className="d-flex mt-4 gap-3 align-items-center">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Unit No.</label>
                <input
                  placeholder="Enter unit number"
                  className="custom-input form-control"
                  value={unitNo}
                  onChange={(e) => setUnitNo(e.target.value)}
                  required
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Location</label>
                <Dropdown label={location || "Select Location"} width={"100%"} height={"42px"}>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Kambal Road GB')} >Kambal Road GB</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('MH Del Pilar')} >MH Del Pilar</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Easterview')} >Easterview</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('GSIS')} >GSIS</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Bulet')} >Bulet</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Liamson')} >Liamson</button></li>
                </Dropdown>
              </div>
            </div>

            {/* Rent Amount + Status */}
            <div className="d-flex mt-4 gap-3 align-items-center">
              <div style={{ width: "50%" }}>
                <label className="form-label p-0 m-0">Rent Amount</label>
                <input
                  type="text"
                  placeholder="0"
                  className="custom-input form-control"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  required
                />
              </div>
              <div style={{ width: "50%" }}>
                <label className="form-label p-0 m-0">Status</label>
                <Dropdown label={status || "Select Status"} width={"100%"} height={"42px"}>
                  <li><button type="button" className="dropdown-item" onClick={()=> setStatus('Available')}>Available</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setStatus('Occupied')}>Occupied</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setStatus('Maintenance')}>Maintenance</button></li>
                </Dropdown>
              </div>
            </div>

            {/* ✅ Action Buttons (Now use CustomButton) */}
            <div className="d-flex gap-3 mt-4">
              <CustomButton
                label="Cancel"
                variant="secondary"
                onClick={() => navigate(-1)}
              />
              <CustomButton
                label="Create"
                type="submit"
                variant="primary"
              />
            </div>
          </form>
        </div>
      </Card>

      {/* 🔔 Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />
    </div>
  );
}
