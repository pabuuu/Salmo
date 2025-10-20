import React, { useEffect, useState } from "react";
import Card from './components/Card'
import axios, { all } from "axios";
import LoadingScreen from "./views/Loading";
import {Link} from "react-router-dom";
import MonthlyIncomeChart from './components/Charts/MonthlyIncomeChart.js';
import MaintenanceChart from "./components/Charts/MaintenanceChart.js";
import { jwtDecode } from "jwt-decode";

function Dashboard() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [units, setUnits] = useState([]);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [maintenances, setMaintenances] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [currentUser, setCurrentUser] = useState([])

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded); 
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5050/api/tenants")
      .then((res) => setTenants(res.data.data))
      .catch((err) => console.error("Error fetching tenants:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsRes, paymentsRes] = await Promise.all([
          axios.get("http://localhost:5050/api/tenants"),
          axios.get("http://localhost:5050/api/payments/all"),
        ]);
  
        const tenants = tenantsRes.data.data;
        const allPayments = paymentsRes.data.data;
  
        const todayUTC = new Date(Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        ));
        const last30DaysUTC = new Date(todayUTC);
        last30DaysUTC.setUTCDate(todayUTC.getUTCDate() - 30);
  
        const recentPayments = allPayments.filter((payment) => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate.getTime() >= last30DaysUTC.getTime();
        });
  
        recentPayments.sort(
          (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
  
        const paymentsWithNames = recentPayments.map((payment) => {
          const tenant = tenants.find((t) => t._id === payment.tenantId);
          return {
            ...payment,
            tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : "Unknown Tenant",
          };
        });
  
        setPayments(paymentsWithNames);
      } catch (err) {
        console.error("Error fetching payments with tenant names:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
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
        const completedMaintenances = (res.data.data || []).filter(
          (item) => item.status === "Completed"
        );
        setCompleted(completedMaintenances);
      } catch (err) {
        console.error("Failed to fetch maintenances:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenances();
  }, []);

  if (loading) return (
    <div className="d-flex vh-100 w-100 align-items-center justify-content-center">
      <LoadingScreen/>
    </div>
  );

  return (
    <div className="container-fluid">
      {/* height auto */}
      <Card width="100%" height="100%" outline={"none"} border={"none"}>
        <div className="my-2">
          <div className="justify-content-between d-flex align-items-center m-0">
            <h1 className="numeral-text">Dashboard</h1>
            <div className="border rounded px-3 py-1">
              <span className="text-uppercase fw-bold ">{currentUser ? currentUser.role : ""}</span>
            </div>
          </div>
          <p className="mb-2 text-muted">Oveview of your units and tenants.</p>
        </div>
        <div className="row g-2">
          {/* Active Tenants */}
          <div className="col-12 col-md-3">
            <Link to="/tenants" className="text-decoration-none">
              <Card width="100%" height="160px" className="hover-card m-0 p-0" id={"person"}>
                <div className="w-100 h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fs-5 fa fa-solid fa-user-group"></i>
                    <p className="fs-5 my-1">Active Tenants</p>
                    <i className="ms-auto fs-5 fa fa-solid fa-up-right-from-square"></i>
                  </div>
                  <h3 className="mb-0 numeral-text">{tenants.length}</h3>
                </div>
              </Card>
            </Link>
          </div>
          <div className="col-12 col-md-3">
            <Link to="/units" className="text-decoration-none">
              <Card width="100%" height="160px" className="hover-card" id={'bar'}>
                <div className="w-100 h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fs-5 fa fa-solid fa-chart-simple"></i>
                    <p className="fs-5 my-1">Occupancy Rate</p>
                    <i className="ms-auto fs-5 fa fa-solid fa-up-right-from-square"></i>
                  </div>
                  <h3 className="mb-0 numeral-text">{occupancyRate}%</h3>
                </div>
              </Card>
            </Link>
          </div>
          <div className="col-12 col-md-3">
            <Card width="100%" height="160px" className="hover-card" id={'expense'}>
              <div className="w-100 h-100 d-flex flex-column justify-content-center">
                <div className="d-flex align-items-center gap-2">
                  <i className="fs-5 fa fa-solid fa-money-bill-wave"></i>
                  <p className="fs-5 my-1">Expenses (wip)</p>
                </div>
                <h3 className="mb-0 numeral-text">{'13k'}</h3>
              </div>
            </Card>
          </div>
          <div className="col-12 col-md-3">
            <Link to="/maintenance" className="text-decoration-none">
              <Card width="100%" height="160px" className="hover-card" id="cogs">
                <div className="w-100 h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-1 mb-2">
                    <i className="fs-5 fa fa-solid fa-wrench"></i>
                    <p className="fs-5 my-1">Maintenance</p>
                    <i className="ms-auto fs-5 fa fa-solid fa-up-right-from-square"></i>
                  </div>
                  <MaintenanceChart />
                </div>
              </Card>
            </Link>
          </div>
        </div>
        <div className="row g-2 mt-3 mb-3 align-items-stretch">
          <div className="col-12 col-md-9 d-flex">
            <Card className="py-4 px-0 flex-fill">
              <div className="px-3 d-flex flex-column h-100">
                <div className="d-flex flex-row gap-2 align-items-center mb-2">
                  <i className="fs-4 fa-solid fa-chart-simple"></i>
                  <h4 className="mb-0">Income Tracker</h4>
                </div>
                <span className="mb-3 d-block">
                  Track changes in income over time on all payments received
                </span>
                <div className="flex-grow-1">
                  <MonthlyIncomeChart />
                </div>
              </div>
            </Card>
          </div>
          <div className="col-12 col-md-3 d-flex">
            <Card className="p-1 px-0 flex-fill">
              <div className="px-1 d-flex flex-column h-100">
                <div className="d-flex flex-row align-items-center mb-2">
                  <i className="fa me-3 fs-5 fa-solid fa-history text-dark"></i>
                  <span className="mb-0 fs-5">Recent Payments</span>
                </div>
                <div className="flex-grow-1" style={{ overflowY: "auto" }}>
                  {payments.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {payments
                        .slice(0, 8)
                        .map((payment) => (
                          <li
                            key={payment._id}
                            className="mb-2 hide-scrollbar"
                            style={{ overflowY: "scroll" }}
                          >
                            <div className="w-100">
                              <span>
                                {payment.tenantId
                                  ? `${payment.tenantId.firstName} ${payment.tenantId.lastName}`
                                  : "Unknown Tenant"}
                              </span>
                              <br />
                              <div className="d-flex flex-row justify-content-between">
                                <span>₱{payment.amount.toLocaleString()}</span>
                                <em>{payment.paymentMethod}</em>
                              </div>
                              <span className="text-muted">
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </span>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No recent payments</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

        </div>
      </Card>
    </div>
  )
}

export default Dashboard;
