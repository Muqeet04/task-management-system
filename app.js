// Backend: app.js

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'muqeet',
  database: 'taskdb'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Routes

// Get all tasks
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    } else {
      res.json(results);
    }
  });
});

// Add a task
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  db.query('INSERT INTO tasks (title, description, completed) VALUES (?, ?, 0)', [title, description], (err, result) => {
    if (err) {
      console.error('Error adding task:', err);
      res.status(500).json({ error: 'Failed to add task' });
    } else {
      res.json({ id: result.insertId, title, description, completed: 0 });
    }
  });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ error: 'Failed to delete task' });
    } else {
      res.json({ message: 'Task deleted successfully' });
    }
  });
});

// Toggle completion
app.patch('/tasks/:id/toggle', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE tasks SET completed = NOT completed WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error toggling task:', err);
      res.status(500).json({ error: 'Failed to toggle task' });
    } else {
      res.json({ message: 'Task toggled successfully' });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// MySQL Table Schema (for reference)
// CREATE TABLE tasks (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   title VARCHAR(255),
//   description TEXT,
//   completed BOOLEAN DEFAULT 0
// );

