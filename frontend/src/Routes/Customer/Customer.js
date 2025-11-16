import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "../../views/Loading";
import CustomerSidebarLayout from "../../components/CustomerSidebarLayout";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

export default function Customer() {
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [qrCodes, setQrCodes] = useState({ gcash: "", bank: "" });
  const [qrLoading, setQrLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState("");

  const [showQrModal, setShowQrModal] = useState(false);

  const tenantId = sessionStorage.getItem("tenantId");
  const tenantName = sessionStorage.getItem("tenantName");

  useEffect(() => {
    const fetchTenantPayments = async () => {
      if (!tenantId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/payments/tenant/${tenantId}`);
        const tenantData = res.data?.data?.tenant || res.data?.tenant || null;
        const paymentsData = res.data?.data?.payments || res.data?.payments || [];
        setTenant(tenantData);
        setPayments(paymentsData);
      } catch (err) {
        console.error("Error fetching tenant payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenantPayments();
  }, [tenantId]);

  useEffect(() => {
    const fetchQrCodes = async () => {
      if (paymentMethod !== "GCash" && paymentMethod !== "Bank Transfer") return;
      setQrLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/qr`);
        if (res.data?.gcash && res.data?.bank) {
          setQrCodes({ gcash: res.data.gcash, bank: res.data.bank });
        }
      } catch (err) {
        console.error("Error loading QR codes:", err);
      } finally {
        setQrLoading(false);
      }
    };
    fetchQrCodes();
  }, [paymentMethod]);

  const uploadManualPayment = async () => {
    if (!paymentAmount || !paymentMethod || !referenceNumber || !receipt) {
      alert("Please complete all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("tenantId", tenantId);
    formData.append("amount", paymentAmount);
    formData.append("paymentMethod", paymentMethod);
    formData.append("referenceNumber", referenceNumber);
    formData.append("notes", notes);
    formData.append("receipt", receipt);

    try {
      setIsPaying(true);
      await axios.post(`${BASE_URL}/payments/customer-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Payment submitted! Please wait for verification.");
      window.location.reload();
    } catch (err) {
      console.error("Error uploading payment:", err);
      alert(err.response?.data?.message || "Failed to submit payment.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading)
    return (
      <CustomerSidebarLayout>
        <LoadingScreen />
      </CustomerSidebarLayout>
    );

  if (!tenant)
    return (
      <CustomerSidebarLayout>
        <p className="text-danger text-center mt-4">Tenant not found.</p>
      </CustomerSidebarLayout>
    );

  const selectedQr =
    paymentMethod === "GCash" ? qrCodes.gcash : paymentMethod === "Bank Transfer" ? qrCodes.bank : null;

  return (
    <CustomerSidebarLayout>
      <div className="p-4 d-flex flex-column gap-4">
        <h2 className="fw-bold text-center mb-4">
          Welcome, {tenantName || "Tenant"}
        </h2>

        {/* PAYMENT AREA */}
        <div className="card shadow-sm p-4 w-100">
          <h5 className="fw-semibold mb-2">
            Unit: {tenant.unitId ? tenant.unitId.unitNo : tenant.lastUnitNo || "N/A"}
          </h5>
          <p className="mb-3">
            Remaining Balance:{" "}
            {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(tenant.balance || 0)}
          </p>

          <div className="row g-3">
            {/* Payment Method with button */}
            <div className="col-12 col-md-6 d-flex align-items-end gap-2">
              <div className="w-75">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Select Method</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="w-25 d-flex justify-content-center">
                {paymentMethod && selectedQr && (
                  qrLoading ? (
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-primary mt-2"
                      onClick={() => setShowQrModal(true)}
                    >
                      View QR
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Screenshot */}
            <div className="col-12 col-md-6">
              <label className="form-label">Screenshot of Payment</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setReceipt(e.target.files[0])}
              />
            </div>

            {/* Reference No */}
            <div className="col-12 col-md-6">
              <label className="form-label">Reference No.</label>
              <input
                type="text"
                className="form-control"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className="col-12 col-md-6">
              <label className="form-label">Amount (PHP)</label>
              <input
                type="number"
                className="form-control"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="col-12 col-md-6">
              <label className="form-label">Notes</label>
              <input
                type="text"
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="col-12 text-center">
              <button
                className="btn btn-success mt-2"
                onClick={uploadManualPayment}
                disabled={isPaying}
              >
                {isPaying ? "Submitting..." : "Submit Payment"}
              </button>
            </div>
          </div>
        </div>

        {/* PAYMENT HISTORY */}
        <div className="card shadow-sm w-100">
          <div className="card-header bg-light">
            <h5 className="mb-0 fw-semibold">Payment History</h5>
          </div>
          <div className="card-body p-0" style={{ overflowX: "auto" }}>
            {payments.length === 0 ? (
              <div className="p-4 text-center text-muted">No payment records yet.</div>
            ) : (
              <table className="table table-striped table-bordered mb-0 w-100">
                <thead className="table-light text-center align-middle">
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Notes</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody className="text-center align-middle">
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td>
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(p.amount)}
                      </td>
                      <td>{p.paymentMethod}</td>
                      <td>{p.notes || "-"}</td>
                      <td>
                        {p.receiptUrl ? (
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-muted">No Receipt</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* QR Modal */}
        {selectedQr && showQrModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
            }}
            onClick={() => setShowQrModal(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "400px",
                width: "90%",
                boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  border: "none",
                  background: "transparent",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
                onClick={() => setShowQrModal(false)}
              >
                ✕
              </button>
              <h5 style={{ textAlign: "center", marginBottom: "15px" }}>
                {paymentMethod} QR Code
              </h5>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={selectedQr}
                  alt={`${paymentMethod} QR`}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerSidebarLayout>
  );
}
