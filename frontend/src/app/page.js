'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { modulesApi, assignmentsApi } from '@/lib/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [mods, assigns] = await Promise.all([
        modulesApi.getAll(),
        assignmentsApi.getAll(),
      ]);
      setModules(mods);
      setAssignments(assigns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  const pending = assignments.filter((a) => a.status === 'Pending');
  const submitted = assignments.filter((a) => a.status === 'Submitted');
  const upcoming = pending
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [submitted.length, pending.length],
        backgroundColor: ['#22c55e', '#f59e0b'],
        borderColor: ['rgba(34,197,94,0.3)', 'rgba(245,158,11,0.3)'],
        borderWidth: 2,
        cutout: '75%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { family: 'Inter' }, padding: 20 },
      },
    },
  };

  // Assignments per module bar chart
  const moduleAssignmentCounts = modules.map((m) => ({
    name: m.moduleCode,
    count: assignments.filter((a) => a.moduleId === m.id).length,
    color: m.colorTag,
  }));

  const barData = {
    labels: moduleAssignmentCounts.map((m) => m.name),
    datasets: [
      {
        label: 'Assignments',
        data: moduleAssignmentCounts.map((m) => m.count),
        backgroundColor: moduleAssignmentCounts.map((m) => m.color + '80'),
        borderColor: moduleAssignmentCounts.map((m) => m.color),
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Inter' } },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#94a3b8', font: { family: 'Inter' }, stepSize: 1 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user.name}! Here&apos;s your academic overview.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading your data...</p>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="glass-card stat-card" style={{ animationDelay: '0s' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>📚</div>
              <div className="stat-card-value">{modules.length}</div>
              <div className="stat-card-label">Total Modules</div>
            </div>
            <div className="glass-card stat-card" style={{ animationDelay: '0.1s' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>📝</div>
              <div className="stat-card-value">{assignments.length}</div>
              <div className="stat-card-label">Total Assignments</div>
            </div>
            <div className="glass-card stat-card" style={{ animationDelay: '0.2s' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)' }}>⏳</div>
              <div className="stat-card-value">{pending.length}</div>
              <div className="stat-card-label">Pending</div>
            </div>
            <div className="glass-card stat-card" style={{ animationDelay: '0.3s' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--accent-green)' }}>✅</div>
              <div className="stat-card-value">{submitted.length}</div>
              <div className="stat-card-label">Submitted</div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="glass-card chart-card">
              <h3 className="chart-title">Completion Status</h3>
              {assignments.length > 0 ? (
                <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                  No assignments yet
                </p>
              )}
            </div>
            <div className="glass-card chart-card">
              <h3 className="chart-title">Assignments per Module</h3>
              {modules.length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                  No modules yet
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 className="chart-title">Upcoming Deadlines</h3>
            {upcoming.length > 0 ? (
              <div className="upcoming-list">
                {upcoming.map((a) => (
                  <div key={a.id} className="upcoming-item">
                    <div className="upcoming-dot" style={{ background: a.moduleColor }} />
                    <div className="upcoming-info">
                      <div className="upcoming-title">{a.title}</div>
                      <div className="upcoming-module">{a.moduleName}</div>
                    </div>
                    <div className="upcoming-date">{formatDate(a.deadline)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                No upcoming deadlines 🎉
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
