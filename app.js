const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' },
});

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'muqeet', // 👈 update this
  database: 'taskdb',
});

db.connect((err) => {
  if (err) return console.error('DB Error:', err);
  console.log('✅ MySQL connected');
});

// Socket.IO notifications
io.on('connection', (socket) => {
  console.log('🔌 Client connected');
});

// POST /tasks
app.post('/tasks', (req, res) => {
  const { title, description, owner } = req.body;
  const sharedWith = '[]'; // Default empty array

  db.query(
    'INSERT INTO tasks (title, description, owner, sharedWith) VALUES (?, ?, ?, ?)',
    [title, description, owner, sharedWith],
    (err, result) => {
      if (err) return res.status(500).send(err);
      io.emit('notification', `New task added by ${owner}`);
      res.status(201).json({
        id: result.insertId,
        title,
        description,
        owner,
        sharedWith,
        completed: 0,
      });
    }
  );
});

// GET /tasks?user=muqeet
app.get('/tasks', (req, res) => {
  const user = req.query.user;
  const sql = `
    SELECT * FROM tasks
    WHERE owner = ? OR JSON_CONTAINS(sharedWith, JSON_QUOTE(?))
    ORDER BY createdAt DESC
  `;
  db.query(sql, [user, user], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// PATCH /tasks/:id
app.patch('/tasks/:id', (req, res) => {
  const { title, description } = req.body;
  db.query(
    'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
    [title, description, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(204);
    }
  );
});

// PATCH /tasks/:id/toggle
app.patch('/tasks/:id/toggle', (req, res) => {
  db.query(
    'UPDATE tasks SET completed = NOT completed WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(204);
    }
  );
});

// DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
  db.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

// PUT /tasks/:id/share
app.put('/tasks/:id/share', (req, res) => {
  const { shareWith } = req.body;
  db.query(
    'UPDATE tasks SET sharedWith = ? WHERE id = ?',
    [JSON.stringify(shareWith), req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      io.emit('notification', `Task shared with: ${shareWith.join(', ')}`);
      res.sendStatus(204);
    }
  );
});

// Analytics
app.get('/analytics/overview', (req, res) => {
  const user = req.query.user;
  db.query(
    `SELECT COUNT(*) AS total, SUM(completed=1) AS completed, SUM(completed=0) AS pending
     FROM tasks WHERE owner = ? OR JSON_CONTAINS(sharedWith, JSON_QUOTE(?))`,
    [user, user],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result[0]);
    }
  );
});

app.get('/analytics/trends', (req, res) => {
  const user = req.query.user;
  db.query(
    `SELECT DATE(createdAt) as date, COUNT(*) as total
     FROM tasks
     WHERE owner = ? OR JSON_CONTAINS(sharedWith, JSON_QUOTE(?))
     GROUP BY DATE(createdAt)
     ORDER BY DATE(createdAt) DESC
     LIMIT 7`,
    [user, user],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    }
  );
});

server.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});

