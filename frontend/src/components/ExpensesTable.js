import React from "react";

function ExpensesTable({ columns, data, onRowClick }) {
  return (
    <div className="table-responsive mt-3">
      <table className="table table-striped align-middle">
        <thead className="table-dark">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row._id}
              style={{ cursor: onRowClick ? "pointer" : "default" }}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpensesTable;
