import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../../views/Loading";

function UsersPayments() {
  const { id } = useParams(); // tenant ID from URL
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch tenant + payments data
  useEffect(() => {
    const fetchTenantPayments = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/payments/tenant/${id}`);
        setTenant(res.data.data.tenant);
        setPayments(res.data.data.payments || []);
      } catch (err) {
        console.error("Error fetching tenant payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantPayments();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!tenant) return <p className="text-danger">Tenant not found.</p>;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            {tenant.firstName} {tenant.lastName}
          </h2>
          <p className="text-muted mb-0">
            Unit: {tenant.unitId ? tenant.unitId.unitNo : "N/A"} | Rent:{" "}
            {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(tenant.unitId.rentAmount)}{" "}
            ({tenant.paymentFrequency}) | Status:{" "}
            <span className={tenant.status === "Overdue" ? "text-danger" : "text-success"}>
              {tenant.status}
            </span>
          </p>
          <p className="text-muted">
            Next Due Date: {new Date(tenant.nextDueDate).toLocaleDateString()}
          </p>
          <p className="text-muted">
            Remaining Balance: {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(tenant.balance || 0)}
          </p>
        </div>
        <Link to="/payments" className="btn btn-outline-secondary">
          ← Back to Payments
        </Link>
      </div>
      {/* Payment History Table */}
      <div className="card shadow-sm w-100">
        <div className="card-header bg-light">
          <h5 className="mb-0">Payment History</h5>
        </div>
        <div className="card-body table-responsive ">
          {payments.length === 0 ? (
            <p className="text-muted text-center m-0">No payment records yet.</p>
          ) : (
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Remarks</th>
                  <th>Receipt</th>
                  <th>Next Due</th>
                </tr>
              </thead>
              <tbody>
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

                    {/* 👇 Receipt Column */}
                    <td>
                      {p.receiptUrl ? (
                        <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer">
                          <i className="fa fa-file-image text-primary"></i>
                        </a>
                      
                      ) : (
                        <span className="text-muted">No Receipt</span>
                      )}
                    </td>

                    <td>
                      {tenant.nextDueDate
                        ? new Date(tenant.nextDueDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsersPayments;
