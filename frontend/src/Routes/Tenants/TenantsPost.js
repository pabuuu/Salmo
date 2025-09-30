import React, { useEffect, useState } from "react";
import Card from "../../components/Card.js";
import Dropdown from "../../components/Dropdown.js";
import LoadingScreen from "../../views/Loading.js";
import { useNavigate } from "react-router-dom";

export default function TenantsPost() {
  const navigate = useNavigate();
  //useStates
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState('');
  const [rentalUnit, setRentalUnit] = useState("");
  const [rentalAmount, setRentalAmount] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('');
  const [location, setLocation] = useState('');

  const handleSumbit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5050/api/tenants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          contactNumber,
          rentalUnit,
          rentalAmount: Number(rentalAmount),
          paymentFrequency,
          location,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        alert("✅ Tenant created successfully!");
        navigate("/tenants"); 
      } else {
        alert("⚠️ " + data.message);
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
      alert("Something went wrong while creating tenant.");
    }
  };
  
  //useEffects
  return (
    <div className="d-flex h-100 w-100">
      <Card width={"100%"} height={"100%"}>
        <div className="mx-5 p-2">
          <h1 className="text-dark">Create a Tenant</h1>
          <span className="text-muted">Fill out the tenant details below.</span>
          <form onSubmit={handleSumbit}>
            <div className="d-flex gap-2 mt-5">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">First Name</label>
                <input
                  placeholder="Enter first name"
                  className="custom-input form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex-grow-1 ">
                <label className="form-label p-0 m-0">Last Name</label>
                <input
                  placeholder="Enter last name"
                  className="custom-input form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="custom-input form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex mt-3 align-items-center gap-2">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  className="custom-input form-control"
                  value={contactNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); 
                    if (value.length <= 11) {
                      setContactNumber(value);
                    }
                  }}
                  maxLength={11}
                  pattern="[0-9]{11}"
                  required
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Unit</label>
                <Dropdown label="Select Unit" width={"100%"} height={"42px"}>
                  <li><button type="button" className="dropdown-item" onClick={()=>setRentalUnit('A')}>Unit A</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=>setRentalUnit('B')}>Unit B</button></li>
                </Dropdown>
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Location</label>
                <Dropdown label="Select Location" width={"100%"} height={"42px"}>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Kambal Road GB')} >Kambal Road GB</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Kambal Road GB')} >MH Del Pilar</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Easterview')} >Easterview</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('GSIS')} >GSIS</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Bulet')} >Bulet</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setLocation('Liamson')} >Liamson</button></li>
                </Dropdown>
              </div>
            </div>
            <div className="d-flex gap-2 mt-3 align-items-start">
              <div style={{ width: "25%" }}>
                <label className="form-label p-0 m-0">Amount to Pay</label>
                <input
                  type="text"
                  placeholder="0"
                  className="custom-input form-control"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={rentalAmount}
                  onChange={(e) => setRentalAmount(e.target.value)}
                />
              </div>
              <div style={{ width: "25%" }}>
                <label className="form-label p-0 m-0">Payment Frequency</label>
                <Dropdown label="Select Frequency" width={"100%"} height={"42px"}>
                  <li><button type="button" className="dropdown-item" onClick={()=> setPaymentFrequency('Monthly')} >Monthly</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setPaymentFrequency('Quarterly')} >Quarterly</button></li>
                  <li><button type="button" className="dropdown-item" onClick={()=> setPaymentFrequency('Yearly')} >Yearly</button></li>
                  {/* to confirm */}
                </Dropdown>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="custom-button fw-normal px-4 bg-light border text-muted" type="button"  onClick={()=>{{
                // to previous page
                navigate(-1)
              }}}>Cancel</button>
              <button className="custom-button fw-normal px-4 bg-success" type="submit">Create</button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
