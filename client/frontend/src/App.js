import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import DarkModeToggle from './components/DarkModeToggle';
import './App.css';

const socket = io('http://localhost:5000');
const username = 'muqeet';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchTasks = useCallback(() => {
    fetch(`http://localhost:5000/tasks?user=${username}`)
      .then((res) => res.json())
      .then(setTasks)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchTasks();
    socket.on('notification', (msg) => {
      setNotifications((prev) => [msg, ...prev.slice(0, 4)]);
    });
    return () => socket.off('notification');
  }, [fetchTasks]);

  const addTask = (formData) => {
    fetch('http://localhost:5000/tasks', {
      method: 'POST',
      body: formData,
    }).then(fetchTasks);
  };

  const deleteTask = (id) => {
    fetch(`http://localhost:5000/tasks/${id}`, { method: 'DELETE' }).then(fetchTasks);
  };

  const toggleComplete = (id) => {
    fetch(`http://localhost:5000/tasks/${id}/toggle`, { method: 'PATCH' }).then(fetchTasks);
  };

  const shareTask = (id) => {
    const toUser = prompt('Share with user:');
    if (!toUser) return;
    const task = tasks.find(t => t.id === id);
    const shared = task.sharedWith ? JSON.parse(task.sharedWith) : [];
    if (!shared.includes(toUser)) shared.push(toUser);

    fetch(`http://localhost:5000/tasks/${id}/share`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shareWith: shared }),
    }).then(fetchTasks);
  };

  return (
    <div className="container">
      <DarkModeToggle />
      <h1>Task Manager</h1>
      <p>Welcome, <strong>{username}</strong></p>
      <TaskForm addTask={addTask} />
      <TaskList
        tasks={tasks}
        deleteTask={deleteTask}
        toggleComplete={toggleComplete}
        shareTask={shareTask}
        editTask={() => {}}
      />
      <div className="notifications">
        <h3>Notifications</h3>
        <ul>
          {notifications.map((note, i) => <li key={i}>{note}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default App;

