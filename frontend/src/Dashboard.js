import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "./components/Card";


function Dashboard() {
  const [data, setData] = useState("");
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:5050/api/tenants")
      .then((res) => {
        setTenants(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching tenants:", err);
      })
      .finally(() => {
        // setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5050/api/units")
      .then((res) => {
        const units = res.data.data;
        setUnits(units);
  
        const occupied = units.filter((u) => u.status === "Occupied").length;
        const available = units.filter((u) => u.status === "Available").length;
        const rate = units.length > 0 ? (occupied / units.length) * 100 : 0;
        setAvailableCount(available);
        setOccupiedCount(rate);
      })
      .catch((err) => {
        console.error("Error fetching units:", err);
      });
  }, []);
  

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   fetch("/api/dashboard", {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((res) => res.json())
  //     .then((info) => setData(info.message))
  //     .catch((err) => console.error(err));
  // }, []);
{/* <h1>{tenants.length}</h1>; */}
  return (
    <Card width={"100%"} height={"auto"}>
      <h1 className="fs-1 fw-bold my-1 ">Dashboard</h1>
      <span className="fs-5 mb-2 text-muted">Analytics</span>
      <div className="d-flex gap-2 align-items-center justify-content-center mb-3">
        <div className="card px-4 py-2 justify-content-center d-flex" style={{height:"250px"}}>
          <h1>{tenants.length}</h1>
          <p className="fs-4">Total tenants</p>
        </div>
        <div className="card px-4 py-2 justify-content-center d-flex" style={{height:"250px"}}>
          <h1>{occupiedCount.toFixed(0)} %</h1>
          <p className="fs-4">Occupancy rate</p>
        </div>
        <div className="card px-4 py-2 justify-content-center d-flex" style={{height:"250px"}}>
          <h1>{availableCount}</h1>
          <p className="fs-4">Remaining Units</p>
        </div>
      </div>
      <div className="d-flex gap-2 align-items-center justify-content-center mb-2 mx-1">
        <div className="card px-4 py-2 justify-content-center align-items-center d-flex w-100" style={{height:"250px"}}>
          <p className="fs-4">Graph here</p>
        </div>
      </div>
    </Card>
  )
}

export default Dashboard;
