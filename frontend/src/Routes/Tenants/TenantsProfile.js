import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { useNavigate, useNavigation, useParams } from "react-router";
import Dropdown from "../../components/Dropdown.js";
import axios from "axios";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification.js";

export default function TenantsProfile(){
    //useState  & decaltation
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "info" });

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
                <Dropdown
                  label={tenant.unitId ? `Unit ${tenant.unitId.unitNo}` : "No unit"}
                  width={"100%"}
                  height={"42px"}
                  disabled={true}
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label p-0 m-0">Location</label>
                <Dropdown
                  label={tenant.unitId ? tenant.unitId.location : "No location"}
                  width={"100%"}
                  height={"42px"}
                  disabled={true}
                />

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