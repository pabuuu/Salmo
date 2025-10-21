import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, PieController, ArcElement, Tooltip, Legend } from "chart.js";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://rangeles.online/api";

Chart.register(PieController, ArcElement, Tooltip, Legend);

export default function OccupancyChart() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [data, setData] = useState({ occupied: 0, available: 0 });

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/units`);
        const allUnits = res.data.data || [];
        const occupied = allUnits.filter((unit) => unit.status === "Occupied").length;
        const available = allUnits.filter((unit) => unit.status === "Available").length;
        const maintenance = allUnits.filter((unit) => unit.status === "Maintenance").length;
        setData({ occupied, available, maintenance });
      } catch (err) {
        console.error("Error fetching units:", err);
      }
    };

    fetchUnits();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Occupied", "Available","Maintenance"],
        datasets: [
          {
            data: [data.occupied, data.available, data.maintenance],
            backgroundColor: ["#c1121f", "green","yellow"], 
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "white", boxWidth: 5 },
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
    <div
      className="w-100 d-flex justify-content-center align-items-center"
      style={{ height: "130px" }}
    >
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
