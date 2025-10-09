import React, { useEffect, useState } from "react";
import Card from './components/Card'
import axios from "axios";
import LoadingScreen from "./views/Loading";
import {Link} from "react-router-dom";
import MonthlyIncomeChart from './components/Charts/MonthlyIncomeChart.js';

function Dashboard() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [maintenances, setMaintenances] = useState([]);

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

  useEffect(() => {
    const fetchMaintenances = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5050/api/maintenances");
        // Filter only Pending maintenances
        const pendingMaintenances = (res.data.data || []).filter(
          (item) => item.status === "Pending"
        );
        setMaintenances(pendingMaintenances);
      } catch (err) {
        console.error("Failed to fetch maintenances:", err);
        // setNotification({ type: "error", message: "Failed to fetch maintenances" });
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenances();
  }, []); // empty dependency array to run once on mount

  if (loading) return (
    <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
      <LoadingScreen/>
    </div>
  );

  return (
    <div className="container-fluid">
      <Card width="100%" height="auto" outline={"none"} border={"none"}>
        <div className="my-2">
          <h1 className="numeral-text">Dashboard</h1>
          <p className="my-2 text-muted">Oveview of your units and tenants.</p>
        </div>
        <div className="row g-2">
          {/* Active Tenants */}
          <div className="col-12 col-md-4">
            <Link to={'/tenants'} className="text-decoration-none">
              <Card width="100%" height="140px" className="hover-card m-0 p-0">
                <div className="w-100 h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fs-4 fa fa-solid fa-user-group"></i>
                    <p className="fs-4 my-1">Active Tenants</p>
                    <i className="ms-auto fs-5 fa fa-solid fa-up-right-from-square"></i>
                  </div>
                  <h3 className=" mb-0 numeral-text">{tenants.length}</h3>
                </div>
              </Card>
            </Link>
          </div>
          {/* Occupancy Rate */}
          <div className="col-12 col-md-4">
            <Link to={'/units'} className="text-decoration-none">
              <Card width="100%" height="140px" className="hover-card">
                <div className="w-100 h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fs-4 fa fa-solid fa-chart-simple"></i>
                    <p className="fs-4 my-1">Occupancy Rate</p>
                    <i className="ms-auto fs-5 fa fa-solid fa-up-right-from-square"></i>
                  </div>
                  <h3 className="mb-0 numeral-text">{occupancyRate}%</h3>
                </div>
              </Card>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link to={'/maintenance'} className="text-decoration-none">
              <Card width="100%" height="140px" className="hover-card">
                <div className="w-100 h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fs-4 fa fa-solid fa-wrench"></i>
                    <p className="fs-4 my-1">Maintenance</p>
                    <i className="ms-auto fs-5 fa fa-solid fa-up-right-from-square"></i>
                  </div>
                  <h3 className="mb-0 numeral-text">
                    {maintenances.length} <span className="fw-normal fs-4">remaining</span>
                  </h3>
                </div>
              </Card>
            </Link>
          </div>
        </div>
        <div className="row g-2 mt-3">
          <div className="col-12">
            <Card width="100%" height="auto" className="py-4 px-0">
              <div className="d-flex flex-row gap-2">
                <i class="fs-4 fa-solid fa-chart-simple"></i>
                <h4 className="mb-0 p-0">Income Tracker</h4>
              </div>
              <span className="mb-3 p-0">Track changes in income over time on all payments received</span>
              <MonthlyIncomeChart />
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard;
