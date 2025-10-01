import React from "react";
import { useNavigate } from "react-router";
//for tenants and unit to
const UcTable = ({ columns, data }) => {
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
              <tr key={idx}  className="text-red">
                {columns.map((col) => (
                  <td key={col.key} className="py-3" onClick={() => {
                    console.log("Pressed:", row._id)
                    // navigate(`/tenants/profile/${row._id}`);
                    //clickable to
                  }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="">
              <td colSpan={columns.length} className="text-center text-muted">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UcTable;
