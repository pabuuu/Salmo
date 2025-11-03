import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "../../views/Loading";
import CustomerSidebarLayout from "../../components/CustomerSidebarLayout";

const USE_NGROK = true;

const BASE_URL =
  window.location.hostname === "localhost"
    ? USE_NGROK
      ? "https://multicarinated-ellison-subfrontally.ngrok-free.dev/api" 
      : "http://localhost:5050/api" 
    : "https://rangeles.online/api";

export default function Customer() {
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [notes, setNotes] = useState("");

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
        setTenant(res.data.data.tenant);
        setPayments(res.data.data.payments || []);
      } catch (err) {
        console.error("Error fetching tenant payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenantPayments();
  }, [tenantId]);

  const handlePayNow = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setIsPaying(true);
      const amountInCentavos = Math.round(paymentAmount * 100);

      const res = await axios.post(`${BASE_URL}/payments/paymongo/create-intent`, {
        amount: amountInCentavos,
        currency: "PHP",
        tenantId,
        notes,
      });

      const checkoutUrl = res.data.data.checkoutUrl;
      if (!checkoutUrl) throw new Error("No checkout URL returned from backend");

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Error creating payment intent:", err.response?.data || err.message);
      alert("Failed to create payment intent. Check console.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return (
    <CustomerSidebarLayout><LoadingScreen /></CustomerSidebarLayout>
  );

  if (!tenant) return (
    <CustomerSidebarLayout><p className="text-danger text-center mt-4">Tenant not found.</p></CustomerSidebarLayout>
  );

  return (
    <CustomerSidebarLayout>
      <div className="p-4" style={{ flexGrow: 1 }}>
        <h2 className="fw-bold text-center mb-4">
          Welcome, {tenantName || "Tenant"}
        </h2>

        <div className="card shadow-sm p-4 mb-4">
          <h5 className="fw-semibold mb-2">
            Unit: {tenant.unitId ? tenant.unitId.unitNo : tenant.lastUnitNo || "N/A"}
          </h5>
          <p className="mb-1">
            Remaining Balance: {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(tenant.balance || 0)}
          </p>

          <div className="mt-3">
            <label className="form-label">Payment Amount (PHP)</label>
            <input
              type="number"
              className="form-control mb-2"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
            />
            <label className="form-label">Notes (optional)</label>
            <input
              type="text"
              className="form-control mb-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for this payment"
            />
            <button
              className="btn btn-primary mt-2"
              onClick={handlePayNow}
              disabled={isPaying}
            >
              {isPaying ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>

        <div className="card shadow-sm" style={{ minHeight: "400px" }}>
          <div className="card-header bg-light">
            <h5 className="mb-0 fw-semibold">Payment History</h5>
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: "auto", height: "100%" }}>
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
                      <td>{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(p.amount)}</td>
                      <td>{p.paymentMethod}</td>
                      <td>{p.notes || "-"}</td>
                      <td>
                        {p.receiptUrl ? (
                          <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">View</a>
                        ) : (<span className="text-muted">No Receipt</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </CustomerSidebarLayout>
  );
}
