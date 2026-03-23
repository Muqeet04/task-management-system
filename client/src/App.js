import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import DarkModeToggle from './components/DarkModeToggle';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ShareModal from './components/ShareModal';
import AuthPage from './components/AuthPage';
import './App.css';

const BASE = 'http://localhost:5000';
const socket = io(BASE, { autoConnect: true });

const App = () => {
  const [user, setUser] = useState(() => localStorage.getItem('tf_user') || null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('tasks');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [shareTarget, setShareTarget] = useState(null); // { id, title, sharedWith }
  const notifTimers = useRef({});

  // ── Fetch tasks ──────────────────────────────────────────────────────────
  const fetchTasks = useCallback(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({ user, search, filter });
    fetch(`${BASE}/tasks?${params}`)
      .then((r) => r.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Socket notifications ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (payload) => {
      const id = Date.now();
      setNotifications((prev) => [{ id, ...payload }, ...prev.slice(0, 4)]);
      notifTimers.current[id] = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
      Object.values(notifTimers.current).forEach(clearTimeout);
    };
  }, []);

  // ── Task actions ─────────────────────────────────────────────────────────
  const addTask = (formData) => {
    formData.append('owner', user);
    setAddingTask(true);
    fetch(`${BASE}/tasks`, { method: 'POST', body: formData })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to add task');
        return r.json();
      })
      .then(() => fetchTasks())
      .catch(console.error)
      .finally(() => setAddingTask(false));
  };

  const deleteTask = (id) => {
    fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' })
      .then(() => fetchTasks())
      .catch(console.error);
  };

  const toggleComplete = (id) => {
    fetch(`${BASE}/tasks/${id}/toggle`, { method: 'PATCH' })
      .then(() => fetchTasks())
      .catch(console.error);
  };

  const editTask = (id, data) => {
    fetch(`${BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(() => fetchTasks())
      .catch(console.error);
  };

  const openShare = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) setShareTarget(task);
  };

  const handleShare = (users) => {
    if (!shareTarget) return;
    fetch(`${BASE}/tasks/${shareTarget.id}/share`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareWith: users }),
    })
      .then(() => { fetchTasks(); setShareTarget(null); })
      .catch(console.error);
  };

  // ── Auth ─────────────────────────────────────────────────────────────────
  const handleLogin = (username) => {
    localStorage.setItem('tf_user', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('tf_user');
    setUser(null);
    setTasks([]);
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">✓</div>
          <span className="app-title">TaskFlow</span>
        </div>
        <div className="app-header-right">
          <div className="user-badge">
            <div className="user-avatar">{user[0].toUpperCase()}</div>
            <span>{user}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
            ⎋ Logout
          </button>
          <DarkModeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn${tab === 'tasks' ? ' active' : ''}`}
            onClick={() => setTab('tasks')}
          >
            📋 Tasks
          </button>
          <button
            className={`tab-btn${tab === 'analytics' ? ' active' : ''}`}
            onClick={() => setTab('analytics')}
          >
            📊 Analytics
          </button>
        </div>

        {tab === 'tasks' && (
          <>
            {/* Stats row */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon total">📋</div>
                <div className="stat-info">
                  <div className="stat-value">{total}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon done">✅</div>
                <div className="stat-info">
                  <div className="stat-value">{completed}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon pending">⏳</div>
                <div className="stat-info">
                  <div className="stat-value">{pending}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {total > 0 && (
              <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    PROGRESS
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {completionRate}%
                  </span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="toolbar">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Task list */}
            <TaskList
              tasks={tasks}
              deleteTask={deleteTask}
              toggleComplete={toggleComplete}
              editTask={editTask}
              shareTask={openShare}
              loading={loading}
            />
          </>
        )}

        {tab === 'analytics' && <AnalyticsDashboard username={user} />}
      </main>

      {/* FAB — always visible */}
      <TaskForm addTask={addTask} loading={addingTask} />

      {/* Share modal */}
      {shareTarget && (
        <ShareModal
          task={shareTarget}
          onShare={handleShare}
          onClose={() => setShareTarget(null)}
        />
      )}

      {/* Toast notifications */}
      {notifications.length > 0 && (
        <div className="notifications-panel">
          {notifications.map((n) => (
            <div key={n.id} className={`notification-toast ${n.type || ''}`}>
              <span>
                {n.type === 'added' && '✅'}
                {n.type === 'deleted' && '🗑'}
                {n.type === 'updated' && '✏️'}
                {n.type === 'shared' && '📤'}
                {n.type === 'toggled' && '🔄'}
              </span>
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
