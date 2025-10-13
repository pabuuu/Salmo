import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import CustomButton from "../../components/CustomBottom";
import { useParams, useNavigate } from "react-router-dom";
import Notification from "../../components/Notification";
import axios from "axios";
import LoadingScreen from "../../views/Loading";
import ReceiptModal from "../../components/ReceiptModal";

export default function ExpensesProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [imageFile, setImageFile] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Fetch expense by ID
  useEffect(() => {
    axios
      .get(`http://localhost:5050/api/expenses/${id}`)
      .then((res) => {
        if (res.data.success) setExpense(res.data.expense);
        else setNotification({ type: "error", message: "Expense not found" });
      })
      .catch(() =>
        setNotification({ type: "error", message: "Expense not found" })
      )
      .finally(() => setLoading(false));
  }, [id]);

  // Handle update with receipt validation
  const handleUpdate = async () => {
    if (
      expense.status === "Paid" &&
      !imageFile &&
      !expense.receiptImage
    ) {
      return setNotification({
        type: "error",
        message: "You must upload a receipt image to mark as Paid.",
      });
    }

    const formData = new FormData();
    formData.append("title", expense.title);
    formData.append("description", expense.description);
    formData.append("category", expense.category);
    formData.append("amount", expense.amount);
    formData.append("status", expense.status);

    // Only append unitId / maintenanceId if exists
    if (expense.unitId) formData.append("unitId", expense.unitId._id || expense.unitId);
    if (expense.maintenanceId) formData.append("maintenanceId", expense.maintenanceId._id || expense.maintenanceId);
    if (imageFile) formData.append("receiptImage", imageFile);

    try {
      const res = await axios.put(
        `http://localhost:5050/api/expenses/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        setNotification({ type: "success", message: "Expense updated!" });
        setExpense(res.data.expense);
        setImageFile(null);
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Update failed" });
    }
  };

  const handleViewReceipt = () => {
    if (expense.receiptImage) setShowReceiptModal(true);
  };

  if (loading) return <LoadingScreen />;
  if (!expense) return <p className="text-center mt-5">Expense not found.</p>;

  return (
    <div className="d-flex h-100 w-100">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <ReceiptModal
        show={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receiptUrl={expense.receiptImage ? `http://localhost:5050/uploads/${expense.receiptImage}` : ""}
      />

      <Card width="100%" height="100%">
        <div className="mx-5 p-3">
          <h1>Edit Expense</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
            className="mt-3"
          >
            <label>Title</label>
            <input
              className="form-control mb-3"
              value={expense.title}
              onChange={(e) =>
                setExpense({ ...expense, title: e.target.value })
              }
            />

            <label>Description</label>
            <textarea
              className="form-control mb-3"
              value={expense.description}
              onChange={(e) =>
                setExpense({ ...expense, description: e.target.value })
              }
            />

            <label>Category</label>
            <select
              className="form-select mb-3"
              value={expense.category}
              onChange={(e) =>
                setExpense({ ...expense, category: e.target.value })
              }
            >
              <option>Maintenance</option>
              <option>Supplies</option>
              <option>Utilities</option>
              <option>Other</option>
            </select>

            <label>Amount (₱)</label>
            <input
              type="number"
              className="form-control mb-3"
              value={expense.amount}
              onChange={(e) =>
                setExpense({ ...expense, amount: e.target.value })
              }
            />

            <label>Status</label>
            <select
              className="form-select mb-3"
              value={expense.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                if (newStatus === "Paid" && !expense.receiptImage && !imageFile) {
                  return setNotification({
                    type: "error",
                    message: "Cannot mark as Paid without a receipt image.",
                  });
                }
                setExpense({ ...expense, status: newStatus });
              }}
            >
              <option>Pending</option>
              <option>Approved</option>
              <option>Paid</option>
            </select>

            {(expense.status === "Approved" || expense.status === "Paid") && (
              <>
                <label>Upload Receipt Image (jpg/png/etc.)</label>
                <input
                  type="file"
                  className="form-control mb-3"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
                {(expense.receiptImage || imageFile) && (
                  <div className="mt-1 d-flex align-items-center gap-2">
                    <span className="text-muted">Current receipt:</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-info"
                      onClick={handleViewReceipt}
                    >
                      View Receipt
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="d-flex gap-3 mt-4">
              <CustomButton
                label="Cancel"
                variant="secondary"
                onClick={() => navigate("/expenses")}
              />
              <CustomButton label="Update" type="submit" variant="primary" />
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
