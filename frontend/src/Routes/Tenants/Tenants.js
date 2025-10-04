import React, { useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import Table from "../../components/Table";
import LoadingScreen from "../../views/Loading";
import { Link } from "react-router-dom";

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Newest");
  const [showArchived, setShowArchived] = useState(false); // toggle archived

  // fetch tenants
  useEffect(() => {
    axios
      .get("http://localhost:5050/api/tenants")
      .then((res) => setTenants(res.data.data))
      .catch((err) => console.error("Error fetching tenants:", err))
      .finally(() => setLoading(false));
  }, []);

  // archive tenant
  const handleArchive = async (tenantId) => {
    if (!window.confirm("Are you sure you want to archive this tenant?")) return;

    try {
      await axios.patch(`http://localhost:5050/api/tenants/${tenantId}/archive`);
      setTenants(prev =>
        prev.map(t => (t._id === tenantId ? { ...t, isArchived: true } : t))
      );
    } catch (err) {
      console.error("Failed to archive tenant:", err);
      alert("Failed to archive tenant.");
    }
  };

  // restore archived tenant
  const handleRestore = async (tenantId) => {
    if (!window.confirm("Restore this tenant?")) return;

    try {
      await axios.patch(`http://localhost:5050/api/tenants/${tenantId}/restore`);
      setTenants(prev =>
        prev.map(t => (t._id === tenantId ? { ...t, isArchived: false } : t))
      );
    } catch (err) {
      console.error("Failed to restore tenant:", err);
      alert("Failed to restore tenant.");
    }
  };

  // columns for table
  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "contactNumber", label: "Contact Number" },
    {
      key: "unitId",
      label: "Unit",
      render: (val) => val ? `Unit ${val.unitNo}` : "-"
    },
    {
      key: "unitId",
      label: "Location",
      render: (val) => val ? val.location : "-"
    },
    {
      key: "unitId",
      label: "Amount",
      render: (val) => val
        ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val.rentAmount)
        : "-"
    },
    {
      key: "unitId",
      label: "Status",
      render: (val) => (
        <span className={val?.status === "Occupied" ? "text-danger fw-bold" : "text-success"}>
          {val ? val.status : "N/A"}
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
    {
      key: "actions",
      label: "Actions",
      render: (val, row) => showArchived ? (
        <button
          className="btn btn-success btn-sm"
          onClick={(e) => { e.stopPropagation(); handleRestore(row._id); }}
          type="button"
        >
          Restore
        </button>
      ) : (
        <button
          className="btn btn-warning btn-sm"
          onClick={(e) => { e.stopPropagation(); handleArchive(row._id); }}
          type="button"
        >
          Archive
        </button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
        <LoadingScreen />
      </div>
    );
  }

  // show active or archived tenants
  const displayedTenants = tenants.filter(t => showArchived ? t.isArchived : !t.isArchived);

  // filter by search term
  let filteredTenants = displayedTenants.filter((tenant) => {
    const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // apply sorting
  if (sortOption === "Newest") filteredTenants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortOption === "Oldest") filteredTenants.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sortOption === "Alphabetical ↑") filteredTenants.sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );
  else if (sortOption === "Alphabetical ↓") filteredTenants.sort((a, b) =>
    `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
  );

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1>Tenants</h1>
        <span>{filteredTenants.length} Tenants found</span>
      </div>

      <div className="w-100">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <Link
            className="green-btn py-2 px-3 fw-normal text-decoration-none"
            to={"/tenants/create"}
          >
            Add Tenant <span className="ms-2 fw-bold">+</span>
          </Link>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Dropdown label={`Filter: ${sortOption}`} className="bg-dark">
              <li><button className="dropdown-item" onClick={() => setSortOption("Newest")}>Newest</button></li>
              <li><button className="dropdown-item" onClick={() => setSortOption("Oldest")}>Oldest</button></li>
              <li><button className="dropdown-item" onClick={() => setSortOption("Alphabetical ↑")}>Alphabetical ↑</button></li>
              <li><button className="dropdown-item" onClick={() => setSortOption("Alphabetical ↓")}>Alphabetical ↓</button></li>
            </Dropdown>
            <input
              placeholder="Enter Tenant"
              className="custom-input my-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Archived/Active toggle buttons */}
        <div className="d-flex gap-2 align-items-center mb-3">
          <button
            className="btn"
            onClick={() => setShowArchived(false)}
            type="button"
            style={{
              backgroundColor: !showArchived ? "#1e293b" : "transparent",
              color: !showArchived ? "#ffffff" : "#1e293b",
              border: "1px solid #1e293b",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 500,
              padding: "0.375rem 0.75rem",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = !showArchived ? "#273449" : "#f1f5f9";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = !showArchived ? "#1e293b" : "transparent";
            }}
          >
            Active
          </button>

          <button
            className="btn"
            onClick={() => setShowArchived(true)}
            type="button"
            style={{
              backgroundColor: showArchived ? "#1e293b" : "transparent",
              color: showArchived ? "#ffffff" : "#1e293b",
              border: "1px solid #1e293b",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 500,
              padding: "0.375rem 0.75rem",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = showArchived ? "#273449" : "#f1f5f9";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = showArchived ? "#1e293b" : "transparent";
            }}
          >
            Archived
          </button>
        </div>

        <Table columns={columns} data={filteredTenants} />
      </div>
    </div>
  );
}

export default Tenants;
