import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
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

const AnalyticsDashboard = ({ username }) => {
  const [overview, setOverview] = useState({});
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    // Fetch overview stats
    fetch(`http://localhost:5000/analytics/overview?user=${username}`)
      .then((res) => res.json())
      .then(setOverview)
      .catch((err) => {
        console.error('Error fetching overview:', err);
        setOverview({});
      });

    // Fetch task trends
    fetch(`http://localhost:5000/analytics/trends?user=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTrends(data);
        } else {
          console.error('Expected array for trends, got:', data);
          setTrends([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching trends:', err);
        setTrends([]);
      });
  }, [username]);

  const pieData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        label: 'Tasks',
        data: [overview.completed || 0, overview.pending || 0],
        backgroundColor: ['#28a745', '#ffc107'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: trends.map((t) => t.date),
    datasets: [
      {
        label: 'Tasks Created',
        data: trends.map((t) => t.total),
        backgroundColor: '#007bff',
      },
    ],
  };

  return (
    <div>
      <h2>Analytics Dashboard</h2>
      <div style={{ maxWidth: '500px', margin: 'auto' }}>
        <Pie data={pieData} />
        <Bar data={barData} style={{ marginTop: '40px' }} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

