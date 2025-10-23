import React from "react";

function ExpensesTable({ columns, data, onRowClick }) {
  return (
    <div className="table-responsive mt-3">
      <table
        className="table table-striped align-middle shadow-sm"
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          fontSize: "1rem", // slightly larger text
        }}
      >
        <thead className="table-dark">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{
                  padding: "1rem 1.2rem", // thicker header padding
                  verticalAlign: "middle",
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <tr
                key={row._id}
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                  height: "70px", // taller rows
                }}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "1rem 1.2rem",
                      verticalAlign: "middle",
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-muted py-4"
                style={{ fontSize: "1.1rem" }}
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExpensesTable;
