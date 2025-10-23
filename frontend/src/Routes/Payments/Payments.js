import React, { useEffect, useState } from "react";
import axios from "axios";
import PaymentsTable from "../../components/PaymentsTable";
import LoadingScreen from "../../views/Loading";
import { useNavigate, Link } from "react-router-dom";
import PaymentModal from "../../components/PaymentModal";
import Dropdown from "../../components/Dropdown";
import * as XLSX from "xlsx";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

function Payments() {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [units, setUnits] = useState([]);

  const navigate = useNavigate();

  const frequencyMultiplier = {
    Monthly: 1,
    Quarterly: 3,
    Yearly: 12,
  };
  

  const fetchTenants = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/tenants`);
      setTenants(res.data.data);
      setFilteredTenants(res.data.data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchUnits = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/units`);
      setUnits(res.data.data);
    } catch (err) {
      console.error("Error fetching Units:", err);
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
    //filter
    if (statusFilter !== "all") {
      temp = temp.filter((t) => t.status === statusFilter);
    }
    // sortingh
    if (sortKey === "newest")
      temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortKey === "oldest")
      temp.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortKey === "az") temp.sort((a, b) => a.firstName.localeCompare(b.firstName));
    else if (sortKey === "za") temp.sort((a, b) => b.firstName.localeCompare(a.firstName));

    setFilteredTenants(temp);
  }, [searchTerm, sortKey, statusFilter, tenants]);

  const downloadXLSX = () => {
    if (!filteredTenants || filteredTenants.length === 0) {
      alert("No data to export.");
      return;
    }
    
    const groupedByLocation = {};
    filteredTenants.forEach((t) => {
      const location = t.unitId?.location || "Unknown";
      if (!groupedByLocation[location]) groupedByLocation[location] = [];
      groupedByLocation[location].push(t);
    });

    const workbook = XLSX.utils.book_new();

    const generateSheetData = (tenants) => {
      const rows = tenants.map((t) => ({
        "First Name": t.firstName || "",
        "Last Name": t.lastName || "",
        "Contact Number": t.contactNumber || "",
        "Unit": t.unitId?.unitNo ? `Unit ${t.unitId.unitNo}` : "",
        "Location": t.unitId?.location || "",
        "Rent Amount (₱)": t.unitId?.rentAmount || 0,
        "Balance (₱)": t.balance || 0,
        "Status": t.status || "",
        "Next Due Date": t.nextDueDate
          ? new Date(t.nextDueDate).toLocaleDateString()
          : "",
        "Created At": t.createdAt
          ? new Date(t.createdAt).toLocaleDateString()
          : "",
        "Tenant ID": t._id || "",
      }));

      const totalBalance = tenants.reduce((sum, t) => sum + (t.balance || 0), 0);

      const totalRent = tenants.reduce((sum, t) => {
        const multiplier = frequencyMultiplier[t.paymentFrequency] || 1;
        return sum + ((t.unitId?.rentAmount || 0) * multiplier);
      }, 0);

      rows.push({});
      rows.push({
        "First Name": "",
        "Last Name": "",
        "Contact Number": "",
        "Unit": "",
        "Location": "",
        "Rent Amount (₱)": `TOTAL RENT: ₱${totalRent.toLocaleString()}`,
        "Balance (₱)": `TOTAL BALANCE: ₱${totalBalance.toLocaleString()}`,
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      const colWidths = Object.keys(rows[0]).map((key) => ({
        wch: Math.max(
          key.length + 3,
          ...rows.map((r) => String(r[key] || "").length + 2)
        ),
      }));
      worksheet["!cols"] = colWidths;

      return worksheet;
    };

    const allSheet = generateSheetData(filteredTenants);
    XLSX.utils.book_append_sheet(workbook, allSheet, "All");

    Object.entries(groupedByLocation).forEach(([location, tenants]) => {
      const sheet = generateSheetData(tenants);
      XLSX.utils.book_append_sheet(workbook, sheet, location.substring(0, 31));
    });

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const filename = `TENANT_PAYMENTS_${now.getFullYear()}-${pad(
      now.getMonth() + 1
    )}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  
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
      key: "location",
      label: "Location",
      render: (_, row) => (row.unitId ? `${row.unitId.location}` : "-"),
    },
    {
      key: "rentAmount",
      label: "Rent Amount",
      render: (_, row) => {
        const multiplier = frequencyMultiplier[row.paymentFrequency] || 1;
        const totalRent = (row.unitId?.rentAmount || 0) * multiplier;
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(totalRent);
      },
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
        else if (row.status === "Pending") bgColor = "bg-secondary text-white";
        
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
          <button className="px-4 py-2 rounded btn bg-white border" onClick={downloadXLSX}>
            <div className="d-flex gap-2 align-items-center">
              <i className="fa fa-solid fa-download text-success fw-bold"></i>
              <span className="text-success fw-bold">XLSX</span>
            </div>
          </button>
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
