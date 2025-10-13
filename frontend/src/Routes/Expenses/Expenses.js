import React, { useEffect, useState } from "react";
import Dropdown from "../../components/Dropdown";
import axios from "axios";
import ExpensesTable from "../../components/ExpensesTable";
import LoadingScreen from "../../views/Loading";
import Notification from "../../components/Notification";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Expenses() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5050/api/expenses");
      const data = res.data.expenses || [];
      setExpenses(data);

      let uniqueCategories = Array.from(new Set(data.map((e) => e.category).filter(Boolean)));
      uniqueCategories = uniqueCategories.filter((cat) => cat !== "Other");
      uniqueCategories.push("Other");
      setCategories(["All", ...uniqueCategories]);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setNotification({ type: "error", message: "Failed to fetch expenses." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const confirmDelete = (id, title) => {
    setNotification({
      type: "info",
      message: `Are you sure you want to delete expense "${title}"?`,
      actions: [
        { label: "Yes", type: "primary", onClick: () => handleDelete(id) },
        { label: "Cancel", type: "secondary", onClick: () => setNotification({ type: "", message: "" }) },
      ],
    });
  };

  const handleDelete = async (id) => {
    setDeletingExpenseId(id);
    try {
      const res = await axios.delete(`http://localhost:5050/api/expenses/${id}`);
      if (res.data.success) {
        setNotification({ type: "success", message: "Expense deleted successfully!" });
        fetchExpenses();
      } else {
        setNotification({ type: "error", message: res.data.message || "Failed to delete expense" });
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to delete expense" });
    } finally {
      setDeletingExpenseId(null);
    }
  };

  // 🔹 Updated Move To logic
  const handleMoveTo = async (expense) => {
    if (expense.status === "Pending") {
      // Move to Approved
      try {
        await axios.put(`http://localhost:5050/api/expenses/${expense._id}`, { status: "Approved" });
        setNotification({ type: "success", message: `"${expense.title}" moved to Approved.` });
        fetchExpenses();
      } catch (err) {
        console.error(err);
        setNotification({ type: "error", message: "Failed to update status." });
      }
    } else if (expense.status === "Approved") {
      // Check if receipt exists
      if (!expense.receiptImage) {
        return setNotification({
          type: "error",
          message: "You must upload a receipt before moving to Paid.",
        });
      }

      // Move to Paid
      try {
        await axios.put(`http://localhost:5050/api/expenses/${expense._id}`, { status: "Paid" });
        setNotification({ type: "success", message: `"${expense.title}" moved to Paid.` });
        fetchExpenses();
      } catch (err) {
        console.error(err);
        setNotification({ type: "error", message: "Failed to move to Paid." });
      }
    } else if (expense.status === "Paid" && expense.receiptImage) {
      // View Receipt
      navigate(`/expenses/${expense._id}`);
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    {
      key: "amount",
      label: "Amount (₱)",
      render: (row) => (row.amount ? `₱${Number(row.amount).toLocaleString()}` : "—"),
    },
    { key: "status", label: "Status" },
    {
      key: "unit",
      label: "Unit",
      render: (row) => {
        if (row.unitId) return `${row.unitId.unitNo || "Unknown"} (${row.unitId.location || "Unknown"})`;
        if (row.maintenanceId && row.maintenanceId.unit) return `${row.maintenanceId.unit.unitNo || "Unknown"} (${row.maintenanceId.unit.location || "Unknown"})`;
        return "—";
      },
    },
    {
      key: "createdAt",
      label: "Date Created",
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "Not Available"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${row.status === "Paid" ? "btn-info" : "btn-success"}`}
            onClick={(e) => {
              e.stopPropagation();
              handleMoveTo(row);
            }}
          >
            {row.status === "Pending" ? "Move to Approved" :
             row.status === "Approved" ? "Move to Paid" :
             "View Receipt"}
          </button>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={deletingExpenseId === row._id}
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(row._id, row.title);
            }}
          >
            {deletingExpenseId === row._id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  const filteredExpenses = expenses
    .filter((e) =>
      `${e.title} ${e.category}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((e) => selectedCategory === "All" || e.category === selectedCategory);

  const handleSort = (type) => {
    const sorted = [...expenses];
    if (type === "newest") sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (type === "oldest") sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (type === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (type === "za") sorted.sort((a, b) => b.title.localeCompare(a.title));
    setExpenses(sorted);
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
        <h1>Expenses</h1>
        <span>{filteredExpenses.length} Expenses found</span>
      </div>

      <div className="w-100">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <Link
            to="/expenses/create"
            style={{
              backgroundColor: "#198754",
              color: "white",
              padding: "6px 16px",
              borderRadius: "6px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#146c43")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#198754")}
          >
            + Add Expense
          </Link>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Dropdown label="Sort by" className="bg-dark">
              {["newest", "oldest", "az", "za"].map((sortKey) => (
                <li key={sortKey}>
                  <button className="dropdown-item" onClick={() => handleSort(sortKey)}>
                    {sortKey === "az" ? "Alphabetical ↑" :
                     sortKey === "za" ? "Alphabetical ↓" :
                     sortKey.charAt(0).toUpperCase() + sortKey.slice(1)}
                  </button>
                </li>
              ))}
            </Dropdown>

            <input
              placeholder="Search Title or Category"
              className="custom-input my-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="custom-button fw-normal px-4">Search</button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? "#1e293b" : "transparent",
                color: selectedCategory === cat ? "#ffffff" : "#1e293b",
                border: "1px solid #1e293b",
                padding: "0.375rem 0.75rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredExpenses.length > 0 ? (
          <ExpensesTable
            columns={columns}
            data={filteredExpenses}
            onRowClick={(row) => navigate(`/expenses/${row._id}`)}
          />
        ) : (
          <div className="text-center py-4 text-muted">No expenses found matching your search/filter.</div>
        )}
      </div>
    </div>
  );
}

export default Expenses;
