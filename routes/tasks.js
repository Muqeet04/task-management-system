const express = require('express');
const db = require('../db');  // Make sure this imports your DB connection
const router = express.Router();

// GET all tasks
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM tasks';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(result);
  });
});

// POST a new task
router.post('/', (req, res) => {
  const { title, description } = req.body;
  const sql = 'INSERT INTO tasks (title, description) VALUES (?, ?)';
  db.query(sql, [title, description], (err, result) => {
    if (err) {
      console.error('Error adding task:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ id: result.insertId, title, description });
  });
});

// UPDATE a task by ID (this is what we're adding)
router.put('/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, description } = req.body;

  const sql = 'UPDATE tasks SET title = ?, description = ? WHERE id = ?';
  db.query(sql, [title, description, taskId], (err, result) => {
    if (err) {
      console.error('Error updating task:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// DELETE a task by ID
router.delete('/:id', (req, res) => {
  const taskId = req.params.id;
  const sql = 'DELETE FROM tasks WHERE id = ?';
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

module.exports = router;

