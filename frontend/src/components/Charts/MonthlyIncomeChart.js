import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function IncomeChart() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [latestTotal, setLatestTotal] = useState(0);
  const [filter, setFilter] = useState('Monthly');

  // ✅ Weekly helper (starts Monday, returns key + readable label)
  const getWeekKeyAndLabel = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Sunday = 7
    d.setUTCDate(d.getUTCDate() + 1 - dayNum); // Move to Monday

    // Week number key (for grouping)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const daysSinceYearStart = Math.floor((d - yearStart) / 86400000);
    const weekNo = Math.floor(daysSinceYearStart / 7) + 1;
    const key = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

    // Date range label (Mon–Sun)
    const monday = new Date(d);
    const sunday = new Date(d);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const formatDate = (date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const label = `${formatDate(monday)}–${formatDate(sunday)}`;
    return { key, label };
  };

  // ✅ Fetch and group payments
  const fetchPayments = async (selectedFilter) => {
    try {
      const res = await axios.get("http://localhost:5050/api/payments/all");
      const payments = res.data.data || [];

      const incomeByPeriod = {};

      payments.forEach(payment => {
        const date = new Date(payment.paymentDate);
        let key, label;

        if (selectedFilter === 'Weekly') {
          const { key: weekKey, label: weekLabel } = getWeekKeyAndLabel(date);
          key = weekKey;
          label = weekLabel;
          if (!incomeByPeriod[key]) incomeByPeriod[key] = { total: 0, label };
          incomeByPeriod[key].total += payment.amount;

        } else if (selectedFilter === 'Monthly') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!incomeByPeriod[key]) incomeByPeriod[key] = 0;
          incomeByPeriod[key] += payment.amount;

        } else if (selectedFilter === 'Quarterly') {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          if (!incomeByPeriod[key]) incomeByPeriod[key] = 0;
          incomeByPeriod[key] += payment.amount;

        } else if (selectedFilter === 'Yearly') {
          key = `${date.getFullYear()}`;
          if (!incomeByPeriod[key]) incomeByPeriod[key] = 0;
          incomeByPeriod[key] += payment.amount;
        }
      });

      const sortedKeys = Object.keys(incomeByPeriod).sort();

      const latestKey = sortedKeys[sortedKeys.length - 1];
      const latestVal = incomeByPeriod[latestKey];
      setLatestTotal(typeof latestVal === 'object' ? latestVal.total : latestVal || 0);

      // ✅ Chart data and options
      const data = {
        labels: sortedKeys.map(k =>
          typeof incomeByPeriod[k] === 'object' ? incomeByPeriod[k].label : k
        ),
        datasets: [{
          label: 'Income (₱)',
          data: sortedKeys.map(k =>
            typeof incomeByPeriod[k] === 'object' ? incomeByPeriod[k].total : incomeByPeriod[k]
          ),
          borderColor: '#222222',
          backgroundColor: '#222222',
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

      // ✅ Render Chart.js instance
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

  // ✅ UI
  return (
    <div style={{ width: '100%' }}>
      <div className="mb-1 d-flex gap-2 flex-wrap">
        <button
          className={`btn btn-sm px-3 py-2 ${filter === 'Weekly' ? 'btn-secondary' : 'btn-dark'}`}
          onClick={() => setFilter('Weekly')}
        >
          Weekly
        </button>
        <button
          className={`btn btn-sm px-3 py-2 ${filter === 'Monthly' ? 'btn-secondary' : 'btn-dark'}`}
          onClick={() => setFilter('Monthly')}
        >
          Monthly
        </button>
        <button
          className={`btn btn-sm px-3 py-2 ${filter === 'Quarterly' ? 'btn-secondary' : 'btn-dark'}`}
          onClick={() => setFilter('Quarterly')}
        >
          Quarterly
        </button>
        <button
          className={`btn btn-sm px-3 py-2 ${filter === 'Yearly' ? 'btn-secondary' : 'btn-dark'}`}
          onClick={() => setFilter('Yearly')}
        >
          Yearly
        </button>
      </div>

      <div style={{ height: '240px' }}>
        <canvas ref={chartRef}></canvas>
      </div>

      <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
        Total {filter}: ₱{latestTotal.toLocaleString()}
      </div>
    </div>
  );
}
