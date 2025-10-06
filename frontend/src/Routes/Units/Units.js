import React, { useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import UcTable from "../../components/ucTable.js";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification";
import { Link, useLocation } from "react-router-dom";

function Units() {
  const location = useLocation();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [deletingUnitId, setDeletingUnitId] = useState(null);

  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchUnits = () => {
    setLoading(true);
    const params =
      selectedCategory !== "All"
        ? `?location=${encodeURIComponent(selectedCategory)}`
        : "";

    axios
      .get(`http://localhost:5050/api/units${params}`)
      .then((res) => {
        const data = res.data.data || [];
        setUnits(data);

        if (selectedCategory === "All") {
          const uniqueLocations = [
            "All",
            ...new Set(data.map((u) => u.location).filter(Boolean)),
          ];
          setCategories(uniqueLocations);
        }
      })
      .catch((err) => {
        console.error("Error fetching units:", err);
        setNotification({
          type: "error",
          message: "Failed to fetch units. Please try again later.",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnits();
  }, [selectedCategory]);

  const confirmDelete = (id, unitNo) => {
    setNotification({
      type: "info",
      message: `Are you sure you want to delete Unit ${unitNo}?`,
      actions: [
        {
          label: "Yes",
          type: "primary",
          onClick: () => handleDelete(id),
        },
        {
          label: "Cancel",
          type: "secondary",
          onClick: () => setNotification({ type: "", message: "" }),
        },
      ],
    });
  };

  const handleDelete = async (id) => {
    setDeletingUnitId(id);
    try {
      const res = await axios.delete(`http://localhost:5050/api/units/${id}`);
      if (res.data.success) {
        setNotification({
          type: "success",
          message: "Unit deleted successfully!",
        });
        fetchUnits();
      } else {
        setNotification({
          type: "error",
          message: res.data.message || "Failed to delete unit",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to delete unit" });
    } finally {
      setDeletingUnitId(null);
    }
  };

    const columns = [
    { key: "unitNo", label: "Unit No." },
    { key: "location", label: "Location" },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        let badgeClass = "bg-success"; // default Available = green
        if (val === "Occupied") badgeClass = "bg-danger"; // red
        if (val === "Maintenance") badgeClass = "bg-warning"; // yellow

        return (
          <span className={`badge px-3 py-2 text-white ${badgeClass}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: "rentAmount",
      label: "Monthly Rent",
      render: (val) => (val ? `₱${Number(val).toLocaleString()}` : "—"),
    },
    {
      key: "createdAt",
      label: "Date Created",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "Not Available"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="d-flex gap-2">
          {/* Edit Button */}
          <Link to={`/units/${row._id}`}>
            <button
              className="btn btn-primary btn-sm"
              type="button"
            >
              Edit
            </button>
          </Link>

          {/* Delete Button */}
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={deletingUnitId === row._id}
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(row._id, row.unitNo);
            }}
          >
            {deletingUnitId === row._id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  const filteredUnits = units.filter((u) =>
    `${u.unitNo} ${u.location}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (type) => {
    const sorted = [...units];
    if (type === "newest")
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (type === "oldest")
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (type === "az") sorted.sort((a, b) => a.unitNo.localeCompare(b.unitNo));
    if (type === "za") sorted.sort((a, b) => b.unitNo.localeCompare(a.unitNo));
    setUnits(sorted);
  };

  if (loading)
    return (
      <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
        <LoadingScreen />
      </div>
    );

  return (
    <div className="container-fluid">
      <Notification
        type={notification.type}
        message={notification.message}
        actions={notification.actions}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <div className="mb-4">
        <h1>Units</h1>
        <span>{filteredUnits.length} Units found</span>
      </div>

      {/* Search / Sort / Add */}
      <div className="w-100">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          {/* Add Unit button */}
          <Link
            to="/units/create"
            style={{
              backgroundColor: "#198754",
              color: "white",
              padding: "6px 16px",
              borderRadius: "6px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease",
              display: "inline-block",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#146c43";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#198754";
            }}
          >
            + Add Unit
          </Link>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Dropdown label="Filter by" className="bg-dark">
              {["newest", "oldest", "az", "za"].map((sortKey) => (
                <li key={sortKey}>
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
                    onClick={() =>
                      handleSort(
                        sortKey === "az"
                          ? "az"
                          : sortKey === "za"
                          ? "za"
                          : sortKey
                      )
                    }
                  >
                    {sortKey === "az"
                      ? "Alphabetical ↑"
                      : sortKey === "za"
                      ? "Alphabetical ↓"
                      : sortKey.charAt(0).toUpperCase() + sortKey.slice(1)}
                  </button>
                </li>
              ))}
            </Dropdown>

            <input
              placeholder="Enter Unit or Building"
              className="custom-input my-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="custom-button fw-normal px-4">Search</button>
          </div>
        </div>

        {/* Category Buttons */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              backgroundColor:
                selectedCategory === cat ? "#1e293b" : "transparent",
              color: selectedCategory === cat ? "#ffffff" : "#1e293b",
              border: "1px solid #1e293b",
              padding: "0.375rem 0.75rem",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor =
                selectedCategory === cat ? "#273449" : "#f1f5f9";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor =
                selectedCategory === cat ? "#1e293b" : "transparent";
            }}
          >
            {cat}
          </button>
        ))}
      </div>

        {filteredUnits.length > 0 ? (
          <UcTable columns={columns} data={filteredUnits} />
        ) : (
          <div className="text-center py-4 text-muted">
            No units found matching your search/filter.
          </div>
        )}
      </div>
    </div>
  );
}

export default Units;
