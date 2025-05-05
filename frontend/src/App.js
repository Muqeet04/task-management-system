// App.js

import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';


const App = () => {
  const [tasks, setTasks] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [filterOption, setFilterOption] = useState('all');

  const fetchTasks = () => {
    fetch('http://localhost:5000/tasks')
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error('Error fetching tasks:', error));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = (newTask) => {
    fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
      .then(() => fetchTasks())
      .catch((error) => console.error('Error adding task:', error));
  };

  const deleteTask = (id) => {
    fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetchTasks())
      .catch((error) => console.error('Error deleting task:', error));
  };

  const toggleComplete = (id) => {
    fetch(`http://localhost:5000/tasks/${id}/toggle`, {
      method: 'PATCH',
    })
      .then(() => fetchTasks())
      .catch((error) => console.error('Error toggling task:', error));
  };

  const editTask = (id, updatedTask) => {
    fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    })
      .then(() => fetchTasks())
      .catch((error) => console.error('Error editing task:', error));
  };

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = [...tasks];

    if (filterOption === 'completed') {
      filteredTasks = filteredTasks.filter((task) => task.completed);
    } else if (filterOption === 'pending') {
      filteredTasks = filteredTasks.filter((task) => !task.completed);
    }

    if (sortOption === 'title') {
      filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'completed') {
      filteredTasks.sort((a, b) => (b.completed ? 1 : -1) - (a.completed ? 1 : -1));
    }

    return filteredTasks;
  };

 return (
  <div className="container">
    <h1>Task Management System</h1>
    <TaskForm addTask={addTask} />
    
    {/* Sort and Filter Controls */}
    <div>
      <label>Sort By: </label>
      <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
        <option value="default">Default</option>
        <option value="title">Title (A-Z)</option>
        <option value="completed">Completed First</option>
      </select>
    </div>

    <div>
      <label>Filter By: </label>
      <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
        <option value="all">All</option>
        <option value="completed">Completed Only</option>
        <option value="pending">Pending Only</option>
      </select>
    </div>

    <TaskList
      tasks={getFilteredAndSortedTasks()}
      deleteTask={deleteTask}
      toggleComplete={toggleComplete}
      editTask={editTask}
    />
  </div>
);

};

export default App;

