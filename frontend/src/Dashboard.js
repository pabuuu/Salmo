import React, { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState("");

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   fetch("/api/dashboard", {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((res) => res.json())
  //     .then((info) => setData(info.message))
  //     .catch((err) => console.error(err));
  // }, []);

  return <h1>{data || "Loading protected data..."}</h1>;
}

export default Dashboard;
