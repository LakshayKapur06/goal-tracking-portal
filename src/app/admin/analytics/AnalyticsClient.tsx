"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import styles from "../../dashboard/Dashboard.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export interface AnalyticsStats {
  totalEmployees: number;
  totalGoals: number;
  draftGoals: number;
  pendingGoals: number;
  lockedGoals: number;
  thrustAreaDistribution: Record<string, number>;
}

export default function AnalyticsClient({ stats }: { stats: AnalyticsStats }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'rgba(255, 255, 255, 0.7)' }
      }
    },
    scales: {
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
        grid: { display: false }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: 'rgba(255, 255, 255, 0.7)' }
      }
    }
  };

  const statusData = {
    labels: ['Draft', 'Pending Approval', 'Locked/Approved'],
    datasets: [
      {
        label: 'Goal Status Distribution',
        data: [stats.draftGoals, stats.pendingGoals, stats.lockedGoals],
        backgroundColor: [
          'rgba(255, 255, 255, 0.2)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(16, 185, 129, 0.6)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.5)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const thrustAreaData = {
    labels: Object.keys(stats.thrustAreaDistribution),
    datasets: [
      {
        label: 'Goals by Thrust Area',
        data: Object.values(stats.thrustAreaDistribution),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <a 
          href="/api/export" 
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '0.6rem 1.5rem', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: 500,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV Report
        </a>
      </div>

      <div className={styles.statsGrid}>
        <div className={`glass ${styles.statCard}`}>
          <div className={styles.statTitle}>Total Employees</div>
          <div className={styles.statValue}>{stats.totalEmployees}</div>
        </div>
        <div className={`glass ${styles.statCard}`}>
          <div className={styles.statTitle}>Total Goals Created</div>
          <div className={styles.statValue}>{stats.totalGoals}</div>
        </div>
        <div className={`glass ${styles.statCard}`}>
          <div className={styles.statTitle}>Overall Goal Approval Rate</div>
          <div className={styles.statValue}>{stats.totalGoals ? Math.round((stats.lockedGoals / stats.totalGoals) * 100) : 0}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className={`glass ${styles.chartContainer}`}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Goal Status Overview</h3>
          <div style={{ height: '250px' }}>
            <Bar options={chartOptions} data={statusData} />
          </div>
        </div>

        <div className={`glass ${styles.chartContainer}`}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Thrust Area Distribution</h3>
          <div style={{ height: '250px' }}>
            <Pie options={pieOptions} data={thrustAreaData} />
          </div>
        </div>
      </div>
    </div>
  );
}
