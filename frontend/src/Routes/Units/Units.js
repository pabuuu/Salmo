import React, { useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import Table from "../../components/Table";
import LoadingScreen from "../../views/Loading";
import { Link } from "react-router-dom";

function Units() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  // === Fetch Data ===
  useEffect(() => {
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

        // When loading ALL, build category list from locations
        if (selectedCategory === "All") {
          const uniqueLocations = [
            "All",
            ...new Set(data.map((u) => u.location).filter(Boolean)),
          ];
          setCategories(uniqueLocations);
        }
      })
      .catch((err) => console.error("Error fetching units:", err))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // === Table Columns (type removed) ===
  const columns = [
    { key: "unitNo", label: "Unit No." },
    { key: "location", label: "Building" },
    { key: "status", label: "Status" },
    {
      key: "rentAmount",
      label: "Monthly Rent",
      render: (val) => `₱${Number(val).toLocaleString()}`
    },
    {
      key: "createdAt",
      label: "Date Created",
      render: (val) => new Date(val).toLocaleDateString()
    }
  ];

  // === Client-side Filters ===
  const filteredUnits = units.filter((u) =>
    `${u.unitNo} ${u.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // === Sort Handler ===
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
      <div className="mb-4">
        <h1>Units</h1>
        <span>{filteredUnits.length} Units found</span>
      </div>

      {/* === Category Buttons (from locations) === */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn ${
              selectedCategory === cat ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* === Search / Sort / Add === */}
      <div className="w-100">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <Link className="green-btn py-2 px-3 fw-normal" to="/units/create">
            Add Unit <span className="ms-2 fw-bold">+</span>
          </Link>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Dropdown label="Filter by" className="bg-dark">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort("newest")}
                >
                  Newest
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort("oldest")}
                >
                  Oldest
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort("az")}
                >
                  Alphabetical ↑
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort("za")}
                >
                  Alphabetical ↓
                </button>
              </li>
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

        {/* === Units Table === */}
        <Table columns={columns} data={filteredUnits} />
      </div>
    </div>
  );
}

export default Units;
