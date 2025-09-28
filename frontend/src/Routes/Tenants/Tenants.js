import React, { useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import axios from 'axios'
import Table from "../../components/Table";
import LoadingScreen from "../../views/Loading";
import { Link } from "react-router-dom";
import TenantsPost from "./TenantsPost";

function Tenants() {
  //usestates n declarations
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  //useEffects
  useEffect(() => {
    axios.get("http://localhost:5050/api/tenants")
      .then(res => {
        setTenants(res.data.data); 
      })
      .catch(err => {
        console.error("Error fetching tenants:", err);
      })
      .finally(() => {
        setLoading(false);
    });
  }, []);

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "contactNumber", label: "Contact Number" },
    { key: "rentalInfo", label: "Rental Info", render: (val, row) => (
      <span>{row.rentalNo}{row.rentalUnit}</span>
      )
    },
    { key: "location", label: "Location" },
    { key: "rentalAmount", label: "Amount" },
    { 
      key: "createdAt", 
      label: "Date Created",
      render: (val) => new Date(val).toLocaleDateString()
    },
  ];

  if (loading) return(
    <div className="d-flex vh-100 w-100 align-items-center justify-content-center ">
      <LoadingScreen/>
    </div>
  )

  return (
    <div className=" container-fluid">
      <div className="mb-4">
        <h1>Tenants</h1>
        <span>12 Tenants found</span>
      </div>
      {/* exact dashbaord */}
      <div className="w-100">
        {/* Search bar */}
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <Link className="green-btn py-2 px-3 fw-normal" to={'/tenants/create'}>
            Add Tenant <span className="ms-2 fw-bold">+</span>
          </Link>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Dropdown label="Filter by" className="bg-dark" >
              <li><a className="dropdown-item " href="#">Newest</a></li>
              <li><a className="dropdown-item" href="#">Oldest</a></li>
              <li><a className="dropdown-item" href="#">Alphabetical ↑</a></li>
              <li><a className="dropdown-item" href="#">Alphabetical ↓</a></li>
            </Dropdown>  
            <input
              placeholder="Enter Tenant"
              className="custom-input my-1"
            />
            <button className="custom-button fw-normal px-4">Search</button>
          </div>
        </div>
        {/* navbar */}
        <Table columns={columns} data={tenants} />
      </div>
    </div>
  )
}

export default Tenants;