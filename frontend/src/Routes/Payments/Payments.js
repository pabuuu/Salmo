import React, { useEffect, useState } from "react";
import axios from "axios";
import PaymentsTable from "../../components/PaymentsTable";
import LoadingScreen from "../../views/Loading";
import { useNavigate, Link } from "react-router-dom";
import PaymentModal from "../../components/PaymentModal";
import Dropdown from "../../components/Dropdown"; // make sure you have this component

function Payments() {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  const fetchTenants = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/tenants");
      setTenants(res.data.data);
      setFilteredTenants(res.data.data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    let temp = [...tenants];

    // Search
    if (searchTerm) {
      temp = temp.filter(
        (t) =>
          t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.unitId?.unitNo || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter !== "all") {
      temp = temp.filter((t) => t.status === statusFilter);
    }

    // Sort
    if (sortKey === "newest") temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortKey === "oldest") temp.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortKey === "az") temp.sort((a, b) => a.firstName.localeCompare(b.firstName));
    else if (sortKey === "za") temp.sort((a, b) => b.firstName.localeCompare(a.firstName));

    setFilteredTenants(temp);
  }, [searchTerm, sortKey, statusFilter, tenants]);

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "contactNumber", label: "Contact Number" },
    {
      key: "unitNo",
      label: "Unit",
      render: (_, row) => (row.unitId ? `Unit ${row.unitId.unitNo}` : "-"),
    },
    {
      key: "rentAmount",
      label: "Rent Amount",
      render: (amt) =>
        new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amt),
    },
    {
      key: "balance",
      label: "Balance",
      render: (bal) =>
        new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(bal || 0),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => {
        let bgColor = "";
        if (row.status === "Paid") bgColor = "bg-success text-white";
        else if (row.status === "Partial") bgColor = "bg-warning text-dark";
        else if (row.status === "Overdue") bgColor = "bg-danger text-white";

        return <span className={`px-2 py-1 rounded ${bgColor}`}>{row.status || "Active"}</span>;
      },
    },
    {
      key: "nextDueDate",
      label: "Next Due Date",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/tenants/${row._id}/payments`)}
          >
            View Payments
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={() => {
              setSelectedTenant(row);
              setShowModal(true);
            }}
          >
            + Record Payment
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1>Payments</h1>
        <p className="text-muted">View tenant balances or record new payments below.</p>

        {/* Filter & Sort Bar */}
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
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
                  <button className="dropdown-item" onClick={() => setSortKey(key)}>
                    {key === "az" ? "Alphabetical ↑" : key === "za" ? "Alphabetical ↓" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                </li>
              ))}
            </Dropdown>
            <Dropdown
              label={
                statusFilter === "all"
                  ? "All"
                  : statusFilter
              }
              className="bg-dark"
            >
              {["all", "Paid", "Partial", "Overdue"].map((status) => (
                <li key={status}>
                  <button className="dropdown-item" onClick={() => setStatusFilter(status)}>
                    {status === "all" ? "All" : status}
                  </button>
                </li>
              ))}
            </Dropdown>
            <input
              placeholder="Search tenant..."
              className="custom-input my-1"
              style={{ minWidth: "200px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <PaymentsTable columns={columns} data={filteredTenants} />

      <PaymentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        tenant={selectedTenant}
        onSuccess={fetchTenants}
      />
    </div>
  );
}

export default Payments;
