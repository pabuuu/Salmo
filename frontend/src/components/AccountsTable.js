import React from "react";
import { useNavigate } from "react-router-dom";

const AccountsTable = ({ columns, data, basePath }) => {
  const navigate = useNavigate();

  return (
    <div className="table-responsive rounded">
      <table className="table table-striped table-hover align-middle">
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
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="text-dark"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`${basePath}/profile/${row._id}`)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-3">
                No accounts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AccountsTable;
