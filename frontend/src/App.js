import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import './App.css';

const socket = io('http://localhost:5000');

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [username] = useState('muqeet'); // static user for now

  // ✅ fetchTasks (only one declaration)
  const fetchTasks = useCallback(() => {
    fetch(`http://localhost:5000/tasks?user=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error('Expected an array of tasks, got:', data);
          setTasks([]);
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setTasks([]);
      });
  }, [username]);

  useEffect(() => {
    fetchTasks();

    socket.on('notification', (msg) => {
      setNotifications((prev) => [msg, ...prev.slice(0, 4)]);
    });

    return () => socket.off('notification');
  }, [fetchTasks]);

  const addTask = (newTask) => {
    fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, owner: username }),
    }).then(fetchTasks);
  };

  const deleteTask = (id) => {
    fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'DELETE',
    }).then(fetchTasks);
  };

  const toggleComplete = (id) => {
    fetch(`http://localhost:5000/tasks/${id}/toggle`, {
      method: 'PATCH',
    }).then(fetchTasks);
  };

  const editTask = (id, updates) => {
    fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then(fetchTasks);
  };

  const shareTask = (id) => {
    const userToShare = prompt('Enter username to share with:');
    if (!userToShare) return;

    const task = tasks.find((t) => t.id === id);
    const sharedWith = task.sharedWith ? [...JSON.parse(task.sharedWith)] : [];

    if (!sharedWith.includes(userToShare)) {
      sharedWith.push(userToShare);
    }

    fetch(`http://localhost:5000/tasks/${id}/share`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareWith: sharedWith }),
    }).then(fetchTasks);
  };

  return (
    <div className="container">
      <h1>Task Management</h1>
      <p>Logged in as: <strong>{username}</strong></p>

      <TaskForm addTask={addTask} />

      <div className="notifications">
        <h3>Notifications</h3>
        <ul>
          {notifications.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>

      <TaskList
        tasks={tasks}
        deleteTask={deleteTask}
        toggleComplete={toggleComplete}
        editTask={editTask}
        shareTask={shareTask}
      />

      <hr style={{ margin: '40px 0' }} />

      <AnalyticsDashboard username={username} />
    </div>
  );
};

export default App;

