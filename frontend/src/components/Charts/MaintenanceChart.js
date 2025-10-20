import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default function MaintenanceChart() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [data, setData] = useState({ pending: 0, inProcess: 0, completed: 0 });

  useEffect(() => {
    const fetchMaintenances = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/maintenances`);
        const maintenances = res.data.data || [];
        const pending = maintenances.filter((m) => m.status === "Pending").length;
        const inProcess = maintenances.filter((m) => m.status === "In Process").length;
        const completed = maintenances.filter((m) => m.status === "Completed").length;
        setData({ pending, inProcess, completed });
      } catch (err) {
        console.error("Error fetching maintenances:", err);
      }
    };

    fetchMaintenances();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Pending", "In Process", "Completed"],
        datasets: [
          {
            data: [data.pending, data.inProcess, data.completed],
            backgroundColor: ["black", "gray", "white"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        layout: {
          padding: 0,
        },
        plugins: {
          legend: {
            display: false, // hide legend inside small card
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}`,
            },
          },
        },
      },
    });
  }, [data]);

  return (
    <div className="w-100 d-flex justify-content-center align-items-center" style={{ height: "130px" }}>
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
