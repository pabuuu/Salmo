import React, { useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import axios from 'axios';
import Table from "../../components/Table";
import LoadingScreen from "../../views/Loading";
import { Link } from "react-router-dom";

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5050/api/tenants")
      .then(res => {
        setTenants(res.data.data); 
      })
      .catch(err => {
        console.error("Error fetching tenants:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "contactNumber", label: "Contact Number" },

    { 
      key: "unitNo", 
      label: "Unit", 
      render: (_, row) => row.unitId ? `Unit ${row.unitId.unitNo}` : "-"
    },
    { 
      key: "location", 
      label: "Location",
      render: (_, row) => row.unitId ? row.unitId.location : "-"
    },
    { 
      key: "amount", 
      label: "Amount",
      render: (_, row) => row.unitId 
        ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })
            .format(row.unitId.rentAmount) 
        : "-"
    },
    { 
      key: "status", 
      label: "Status",
      render: (_, row) => (
        <span className={row.unitId?.status === "Occupied" ? "text-danger fw-bold" : "text-success"}>
          {row.unitId ? row.unitId.status : "N/A"}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "Date Created",
      render: (val) => new Date(val).toLocaleDateString("en-PH", { 
        year: "numeric", month: "short", day: "numeric" 
      })
    },
  ];

  if (loading) return (
    <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
      <LoadingScreen/>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1>Tenants</h1>
        <span>{tenants.length} Tenants found</span>
      </div>

      {/* Search / Add */}
      <div className="w-100 mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <Link className="green-btn py-2 px-3 fw-normal" to={'/tenants/create'}>
            Add Tenant <span className="ms-2 fw-bold">+</span>
          </Link>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Dropdown label="Filter by" className="bg-dark">
              <li><a className="dropdown-item" href="#">Newest</a></li>
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
      </div>

      <Table columns={columns} data={tenants} />
    </div>
  );
}

export default Tenants;
