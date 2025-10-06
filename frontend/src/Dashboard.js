import React, { useEffect, useState } from "react";
import Card from './components/Card'
import axios from "axios";
import LoadingScreen from "./views/Loading";

function Dashboard() {
  const [data, setData] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [occupancyRate, setOccupancyRate] = useState(0);
  
  useEffect(() => {
    axios
      .get("http://localhost:5050/api/tenants")
      .then((res) => setTenants(res.data.data))
      .catch((err) => console.error("Error fetching tenants:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5050/api/units")
      .then((res) => {
        const allUnits = res.data.data;
        const occupiedCount = allUnits.filter(unit => unit.status === "Occupied").length;
        const rate = allUnits.length > 0 ? (occupiedCount / allUnits.length) * 100 : 0;
        setOccupancyRate(rate.toFixed(0));
        setUnits(res.data.data)
      })
      .catch((err) => console.error("Error fetching Units:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
      <LoadingScreen/>
    </div>
  );

  return (
    <div className="container-fluid">
      <Card width={"100%"} height={"auto"}>
        <div className="my-2">
          <h1>Dashboard</h1>
        </div>
        <div className="w-100 d-flex gap-3">
          <Card width="100%" height="140px" className={'bg-dark text-white'}>
            <div className="w-100 d-flex h-100 flex-column justify-content-center">
              <div className="d-flex align-items-center gap-2">
                <i class="fs-3 fa fa-solid fa-user-group"></i>
                <p className=" fs-3 my-1">Active Tenants</p>
              </div>
              <h3 className="fs-1 mb-0 fw-bold">{tenants.length}</h3>
            </div>
          </Card>
          <Card width="100%" height="140px" className={'bg-dark text-white'}>
            <div className="w-100 d-flex h-100 flex-column justify-content-center">
              <div className="d-flex align-items-center gap-2">
                <i class="fs-3 fa fa-solid fa-chart-simple"></i>
                <p className=" fs-3 my-1">Occupancy rate</p>
              </div>
              <h3 className="fs-1 mb-0 fw-bold">{occupancyRate}%</h3>
            </div>
          </Card>
          <Card width="100%" height="140px">
          <div className="w-100 d-flex h-100 flex-column justify-content-center">
              <div className="d-flex align-items-center gap-2">
                <i class="fs-3 fa fa-solid fa-code-pull-request"></i>
                <p className=" fs-3 my-1">Maintenance</p>
              </div>
              <h3 className="fs-1 mb-0 fw-bold">GIAN FAGGOT NIGGA SHIBAR</h3>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard;
