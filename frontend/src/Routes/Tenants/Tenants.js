import React, { useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import Table from "../../components/Table";
import LoadingScreen from "../../views/Loading";
import { Link } from "react-router-dom";

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5050/api/tenants")
      .then((res) => setTenants(res.data.data))
      .catch((err) => console.error("Error fetching tenants:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleArchive = async (e, id, isArchived) => {
    e.stopPropagation();
    const action = isArchived ? "unarchive" : "archive";

    if (!window.confirm(`Are you sure you want to ${action} this tenant?`)) return;

    try {
      await axios.put(`http://localhost:5050/api/tenants/${id}/archive`, {
        isArchived: !isArchived,
      });

      setTenants((prev) =>
        prev.map((tenant) =>
          tenant._id === id ? { ...tenant, isArchived: !isArchived } : tenant
        )
      );

      alert(`Tenant ${action}d successfully!`);
    } catch (err) {
      console.error(`Error trying to ${action} tenant:`, err);
      alert("Failed to update tenant status.");
    }
  };

  // 🔹 Filter tenants (All / Active / Archived)
  const filteredTenants = tenants.filter((tenant) => {
    if (filter === "Archived") return tenant.isArchived;
    if (filter === "Active") return !tenant.isArchived;
    return true;
  });

  // 🔹 Apply search filter (by name or email)
  const searchedTenants = filteredTenants.filter((tenant) => {
    const query = searchTerm.toLowerCase();
    return (
      tenant.firstName.toLowerCase().includes(query) ||
      tenant.lastName.toLowerCase().includes(query) ||
      tenant.email.toLowerCase().includes(query)
    );
  });

  // 🔹 Sort tenants (newest, oldest, A–Z, Z–A)
  const sortedTenants = [...searchedTenants].sort((a, b) => {
    switch (sortKey) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "az":
        return a.firstName.localeCompare(b.firstName);
      case "za":
        return b.firstName.localeCompare(a.firstName);
      default:
        return 0;
    }
  });

  const handleSort = (key) => {
    setSortKey(key);
  };

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "contactNumber", label: "Contact Number" },
    {
      key: "unitId",
      label: "Unit",
      render: (val) => (val ? `Unit ${val.unitNo}` : "-"),
    },
    {
      key: "unitId",
      label: "Location",
      render: (val) => (val ? val.location : "-"),
    },
    {
      key: "unitId",
      label: "Amount",
      render: (val) =>
        val
          ? new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
            }).format(val.rentAmount)
          : "-",
    },
    {
      key: "unitId",
      label: "Status",
      render: (val) => (
        <span
          className={
            val?.status === "Occupied"
              ? "text-danger fw-bold"
              : "text-success fw-bold"
          }
        >
          {val ? val.status : "N/A"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date Created",
      render: (val) =>
        new Date(val).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      label: "Actions",
      render: (val, row) => (
        <button
          className={`btn btn-sm ${
            row.isArchived ? "btn-success" : "btn-danger"
          }`}
          onClick={(e) => handleArchive(e, row._id, row.isArchived)}
        >
          {row.isArchived ? "Unarchive" : "Archive"}
        </button>
      ),
    },
  ];

  if (loading)
    return (
      <div className="d-flex vh-100 w-100 align-items-center justify-content-center ">
        <LoadingScreen />
      </div>
    );

  const filters = ["All", "Active", "Archived"];

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1>Tenants</h1>
        <span>{sortedTenants.length} Tenants found</span>
      </div>

      <div className="w-100">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
          <Link
            className="green-btn py-2 px-3 fw-normal text-decoration-none"
            to={"/tenants/create"}
          >
            Add Tenant <span className="ms-2 fw-bold">+</span>
          </Link>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Dropdown
              label={
                sortKey === "az"
                  ? "Alphabetical ↑"
                  : sortKey === "za"
                  ? "Alphabetical ↓"
                  : sortKey.charAt(0).toUpperCase() + sortKey.slice(1)
              }
              className="bg-dark"
            >
              {["newest", "oldest", "az", "za"].map((key) => (
                <li key={key}>
                  <button
                    className="dropdown-item"
                    style={{
                      background: "transparent",
                      color: "#1e293b",
                      border: "none",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#f1f5f9")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                    onClick={() => handleSort(key)}
                  >
                    {key === "az"
                      ? "Alphabetical ↑"
                      : key === "za"
                      ? "Alphabetical ↓"
                      : key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                </li>
              ))}
            </Dropdown>

            {/* 🔍 Search Module */}
            <input
              placeholder="Search tenant..."
              className="custom-input my-1"
              style={{ minWidth: "200px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Archive filter buttons */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                backgroundColor: filter === f ? "#1e293b" : "transparent",
                color: filter === f ? "#ffffff" : "#1e293b",
                border: "1px solid #1e293b",
                padding: "0.375rem 0.75rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor =
                  filter === f ? "#273449" : "#f1f5f9";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor =
                  filter === f ? "#1e293b" : "transparent";
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <Table columns={columns} data={sortedTenants} />
      </div>
    </div>
  );
}

export default Tenants;
