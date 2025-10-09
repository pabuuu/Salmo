import React, { useEffect, useRef, useState } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function IncomeChart() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [latestTotal, setLatestTotal] = useState(0);
  const [filter, setFilter] = useState('Monthly'); 

  const fetchPayments = async (selectedFilter) => {
    try {
      const res = await axios.get("http://localhost:5050/api/payments/all");
      const payments = res.data.data || [];

      const incomeByPeriod = {};

      payments.forEach(payment => {
        const date = new Date(payment.paymentDate);
        let key;

        if (selectedFilter === 'Monthly') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}`;
        } else if (selectedFilter === 'Quarterly') {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
        } else if (selectedFilter === 'Yearly') {
          key = `${date.getFullYear()}`;
        }

        if (!incomeByPeriod[key]) incomeByPeriod[key] = 0;
        incomeByPeriod[key] += payment.amount;
      });

      const sortedKeys = Object.keys(incomeByPeriod).sort();

      const latestKey = sortedKeys[sortedKeys.length - 1];
      setLatestTotal(latestKey ? incomeByPeriod[latestKey] : 0);

      const data = {
        labels: sortedKeys,
        datasets: [{
          label: 'Income (₱) ',
          data: sortedKeys.map(k => incomeByPeriod[k]),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3
        }]
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: `Income (${selectedFilter})` }
        },
        scales: { y: { beginAtZero: true } }
      };

      if (chartRef.current) {
        if (chartInstanceRef.current) chartInstanceRef.current.destroy();
        chartInstanceRef.current = new Chart(chartRef.current, { type: 'line', data, options });
      }

    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments(filter);
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [filter]);

  return (
    <div style={{ width: '100%' }}>
      <div className="mb-1 d-flex gap-2">
        <button className="btn btn-sm btn-dark px-3 py-2" onClick={() => setFilter('Monthly')}>Monthly</button>
        <button className="btn btn-sm btn-dark px-3 py-2" onClick={() => setFilter('Quarterly')}>Quarterly</button>
        <button className="btn btn-sm btn-dark px-3 py-2" onClick={() => setFilter('Yearly')}>Yearly</button>
      </div>
      <div style={{ height: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
      <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
        Total {filter}: ₱{latestTotal.toLocaleString()}
      </div>
    </div>
  );
}
