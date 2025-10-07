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
      <Card width="100%" height="auto">
        <div className="my-2">
          <h1>Dashboard</h1>
        </div>
        <div className="row g-3">
          {/* Active Tenants */}
          <div className="col-12 col-md-4">
            <Card width="100%" height="140px" className="bg-dark text-white">
              <div className="w-100 h-100 d-flex flex-column justify-content-center">
                <div className="d-flex align-items-center gap-2">
                  <i className="fs-3 fa fa-solid fa-user-group"></i>
                  <p className="fs-2 my-1">Active Tenants</p>
                </div>
                <h3 className="fs-4 mb-0 fw-bold">{tenants.length}</h3>
              </div>
            </Card>
          </div>

          {/* Occupancy Rate */}
          <div className="col-12 col-md-4">
            <Card width="100%" height="140px" className="bg-light text-dark">
              <div className="w-100 h-100 d-flex flex-column justify-content-center">
                <div className="d-flex align-items-center gap-2">
                  <i className="fs-3 fa fa-solid fa-chart-simple"></i>
                  <p className="fs-2 my-1">Occupancy Rate</p>
                </div>
                <h3 className="fs-4 mb-0 fw-bold">{occupancyRate}%</h3>
              </div>
            </Card>
          </div>

          {/* Pending Maintenances */}
          <div className="col-12 col-md-4">
            <Card width="100%" height="140px" className="bg-dark text-white">
              <div className="w-100 h-100 d-flex flex-column justify-content-center">
                <div className="d-flex align-items-center gap-2">
                  <i className="fs-3 fa fa-solid fa-wrench"></i>
                  <p className="fs-2 my-1">Maintenance</p>
                </div>
                <h3 className="fs-4 mb-0 fw-bold">
                  {maintenances.length} <span className="fw-normal fs-5">remaining</span>
                </h3>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard;
