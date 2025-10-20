import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { useNavigate, useNavigation, useParams } from "react-router";
import Dropdown from "../../components/Dropdown.js";
import axios from "axios";
import LoadingScreen from "../../views/Loading";

export default function TenantsProfile(){
    //useState  & decaltation
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  //useEffect
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/tenants/${id}`);
        setTenant(res.data.data);
      } catch (err) {
        console.error("Error fetching tenant:", err);
      }
    };
    fetchTenant();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5050/api/tenants/${id}`, tenant);
      alert("Tenant updated successfully!");
      navigate(-1); 
    } catch (err) {
      console.error("Error updating tenant:", err);
      alert("Failed to update tenant");
    }
  };

  const [frequencyLabel, setFrequecyLabel] = useState("Select Frequency");

    return (
      <div className="d-flex h-100 w-100">
      <Card width={"100%"} height={"100%"}>
        <div className="mx-5 p-2">
        {!tenant ? (
            <LoadingScreen/>
          ):(
            <div>
              <h1 className="text-dark">{tenant.firstName}'s Profile</h1>
              <span className="text-muted">Update your tenant's profile here</span>
                <form onSubmit={handleUpdate}>
                <div className="d-flex gap-2 mt-5">
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">First Name</label>
                <input
                  placeholder="Enter first name"
                  className="custom-input form-control"
                  value={tenant.firstName}
                  onChange={(e) =>
                    setTenant(prev => ({ ...prev, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="flex-grow-1 ">
                <label className="form-label p-0 m-0">Last Name</label>
                <input
                  placeholder="Enter last name"
                  className="custom-input form-control"
                  value={tenant.lastName}
                  onChange={(e) =>
                    setTenant(prev => ({ ...prev, lastName: e.target.value }))
                  }
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="custom-input form-control"
                  value={tenant.email}
                  onChange={(e) =>
                    setTenant(prev => ({ ...prev, email: e.target.value }))
                  }
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
                  value={tenant.contactNumber}
                  maxLength={11}
                  pattern="[0-9]{11}"
                  required
                  onChange={(e) =>{
                    const value = e.target.value.replace(/\D/g, ""); 
                      if (value.length <= 11) {
                        setTenant(prev => ({ ...prev, contactNumber: e.target.value }))
                      }
                    } 
                  }
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Unit</label>
                <Dropdown label={tenant.rentalUnit} width={"100%"} height={"42px"} disabled={true}>
                  <li><button type="button" className="dropdown-item" >Unit A</button></li>
                  <li><button type="button" className="dropdown-item">Unit B</button></li>
                </Dropdown>
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Location</label>
                <Dropdown label={tenant.location} width={"100%"} height={"42px"} disabled={true}>
                  <li><button type="button" className="dropdown-item">Kambal Road GB</button></li>
                  <li><button type="button" className="dropdown-item">MH Del Pilar</button></li>
                  <li><button type="button" className="dropdown-item">Easterview</button></li>
                  <li><button type="button" className="dropdown-item">GSIS</button></li>
                  <li><button type="button" className="dropdown-item">Bulet</button></li>
                  <li><button type="button" className="dropdown-item">Liamson</button></li>
                </Dropdown>
              </div>
            </div>
            {/* <div className="d-flex gap-2 mt-3 align-items-start">
              <div style={{ width: "25%" }}>
                <label className="form-label p-0 m-0">Amount to Pay</label>
                <input
                  type="text"
                  placeholder="0"
                  className="custom-input form-control"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tenant.rentalAmount}
                  onChange={(e) =>
                    setTenant(prev => ({ ...prev, rentalAmount: e.target.value }))
                  }
                />
              </div>
              <div style={{ width: "25%" }}>
                <label className="form-label p-0 m-0">Payment Frequency</label>
                <Dropdown label={frequencyLabel} width={"100%"} height={"42px"} disabled={false}>
                  <li><button type="button" className="dropdown-item" 
                    onClick={() => {
                      setTenant(prev => ({ ...prev, paymentFrequency: "Monthly" }))
                      setFrequecyLabel('Monthly')
                    }}
                  >Monthly</button></li>
                  <li><button type="button" className="dropdown-item"
                    onClick={() => {
                      setTenant(prev => ({ ...prev, paymentFrequency: "Quarterly" }))
                      setFrequecyLabel('Quarterly')
                    }}
                  >Quarterly</button></li>
                  <li><button type="button" className="dropdown-item" 
                    onClick={() => {
                      setTenant(prev => ({ ...prev, paymentFrequency: "Yearly" }))
                      setFrequecyLabel('Yearly')
                    }}
                  > Yearly</button></li>
                </Dropdown>
              </div>
            </div> */}
            <div className="d-flex gap-2">
              <button className="custom-button fw-normal px-4 bg-light border text-muted" type="button"  onClick={()=>{{
                // to previous page
                navigate(-1)
              }}}>Cancel</button>
              <button className="custom-button fw-normal px-4 bg-warning" type="submit">Update</button>
            </div>
                </form>
            </div>
          )}
        </div>
      </Card>
    </div>
    );
}