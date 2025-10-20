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

export default function ExpenseOutput() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [latestTotal, setLatestTotal] = useState(0);
  const [filter, setFilter] = useState('Weekly');

  // helper to compute week label (Mon–Sun)
  const getWeekKeyAndLabel = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 1 - dayNum);

    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const daysSinceYearStart = Math.floor((d - yearStart) / 86400000);
    const weekNo = Math.floor(daysSinceYearStart / 7) + 1;

    const key = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

    const monday = new Date(d);
    const sunday = new Date(d);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const formatDate = (date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const label = `${formatDate(monday)}–${formatDate(sunday)}`;
    return { key, label };
  };

  // fetch & group expenses
  const fetchExpenses = async (selectedFilter) => {
    try {
      const res = await axios.get("http://localhost:5050/api/expenses");
      const expenses = res.data.expenses || [];


      const expenseByPeriod = {};

      expenses.forEach(expense => {
        if (!expense.amount || !expense.createdAt) return;
        const date = new Date(expense.createdAt);

        let key, label;

        if (selectedFilter === 'Weekly') {
          const { key: weekKey, label: weekLabel } = getWeekKeyAndLabel(date);
          key = weekKey;
          label = weekLabel;
          if (!expenseByPeriod[key]) expenseByPeriod[key] = { total: 0, label };
          expenseByPeriod[key].total += expense.amount;

        } else if (selectedFilter === 'Monthly') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!expenseByPeriod[key]) expenseByPeriod[key] = 0;
          expenseByPeriod[key] += expense.amount;

        } else if (selectedFilter === 'Quarterly') {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          if (!expenseByPeriod[key]) expenseByPeriod[key] = 0;
          expenseByPeriod[key] += expense.amount;

        } else if (selectedFilter === 'Yearly') {
          key = `${date.getFullYear()}`;
          if (!expenseByPeriod[key]) expenseByPeriod[key] = 0;
          expenseByPeriod[key] += expense.amount;
        }
      });

      // sort keys for chart order
      const sortedKeys = Object.keys(expenseByPeriod).sort();

      // latest total
      const latestKey = sortedKeys[sortedKeys.length - 1];
      const latestVal = expenseByPeriod[latestKey];
      setLatestTotal(typeof latestVal === 'object' ? latestVal.total : latestVal || 0);

      // prepare chart data
      const data = {
        labels: sortedKeys.map(k =>
          typeof expenseByPeriod[k] === 'object' ? expenseByPeriod[k].label : k
        ),
        datasets: [{
          label: 'Expenses (₱)',
          data: sortedKeys.map(k =>
            typeof expenseByPeriod[k] === 'object' ? expenseByPeriod[k].total : expenseByPeriod[k]
          ),
          borderColor: '#c1121f',
          backgroundColor: '#c1121f',
          tension: 0.3,
          fill: false
        }]
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: `Expenses (${selectedFilter})` }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (value) => `₱${value.toLocaleString()}` }
          }
        }
      };

      // render chart
      if (chartRef.current) {
        if (chartInstanceRef.current) chartInstanceRef.current.destroy();
        chartInstanceRef.current = new Chart(chartRef.current, { type: 'line', data, options });
      }

    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  useEffect(() => {
    fetchExpenses(filter);
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [filter]);

  return (
    <div style={{ width: '100%' }}>
      <div className="mb-2 d-flex gap-2 flex-wrap">
        {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map(period => (
          <button
            key={period}
            className={`btn btn-sm px-3 py-2 ${filter === period ? 'btn-danger' : 'btn-dark'}`}
            onClick={() => setFilter(period)}
          >
            {period}
          </button>
        ))}
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
