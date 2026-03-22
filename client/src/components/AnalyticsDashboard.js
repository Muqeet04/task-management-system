import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const BASE = 'http://localhost:5000';

const AnalyticsDashboard = ({ username }) => {
  const [overview, setOverview] = useState({ total: 0, completed: 0, pending: 0 });
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE}/analytics/overview?user=${username}`).then((r) => r.json()),
      fetch(`${BASE}/analytics/trends?user=${username}`).then((r) => r.json()),
    ])
      .then(([ov, tr]) => {
        setOverview(ov || {});
        setTrends(Array.isArray(tr) ? tr : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  const isDark = document.body.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [overview.completed || 0, overview.pending || 0],
      backgroundColor: ['#22c55e', '#f59e0b'],
      borderColor: isDark ? '#1e293b' : '#ffffff',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: trends.map((t) => {
      const d = new Date(t.date);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Tasks Created',
      data: trends.map((t) => t.total),
      backgroundColor: 'rgba(99,102,241,0.7)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: textColor, font: { size: 12 } } },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: textColor, padding: 16, font: { size: 12 } } },
    },
    cutout: '65%',
  };

  const completionRate = overview.total
    ? Math.round((overview.completed / overview.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-info">
            <div className="stat-value">{overview.total || 0}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done">✅</div>
          <div className="stat-info">
            <div className="stat-value">{overview.completed || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{overview.pending || 0}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPLETION RATE</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{completionRate}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Task Status</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        <div className="chart-card">
          <h3>Tasks Created (Last 7 Days)</h3>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
