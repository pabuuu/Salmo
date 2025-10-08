import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentsTable = ({ columns, data }) => {
  const navigate = useNavigate();

  if (!data || data.length === 0)
    return <p className="text-center text-muted">No data available</p>;

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-dark">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-start p-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isOverdue = row.status === "Overdue";
            return (
              <tr
                key={row._id}
                className={`align-middle ${
                  isOverdue ? "table-danger" : "table-light"
                }`}
                style={{
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  marginBottom: "10px",
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTable;
