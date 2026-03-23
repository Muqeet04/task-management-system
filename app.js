const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || '*' },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error('File type not allowed'));
  },
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// ── Auth ───────────────────────────────────────────────────────────────────

// Register
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password) return res.status(400).json({ error: 'Username and password required.' });

  const uname = username.trim().toLowerCase();
  db.query('SELECT id FROM users WHERE username = ?', [uname], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error.' });
    if (rows.length) return res.status(409).json({ error: 'Username already taken.' });

    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [uname, password], (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Failed to create account.' });
      res.status(201).json({ username: uname, id: result.insertId });
    });
  });
});

// Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password) return res.status(400).json({ error: 'Username and password required.' });

  const uname = username.trim().toLowerCase();
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [uname, password], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error.' });
    if (!rows.length) return res.status(401).json({ error: 'Invalid username or password.' });
    res.json({ username: uname, id: rows[0].id });
  });
});

// ── Tasks ──────────────────────────────────────────────────────────────────

// Add a task
app.post('/tasks', upload.single('attachment'), (req, res) => {
  const { title, description, owner = 'muqeet' } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required.' });

  const attachment = req.file ? req.file.filename : null;
  const sql = `
    INSERT INTO tasks (title, description, owner, sharedWith, completed, createdAt, attachment)
    VALUES (?, ?, ?, ?, ?, NOW(), ?)
  `;
  db.query(sql, [title.trim(), description?.trim() || '', owner, '[]', false, attachment], (err, result) => {
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ error: 'Failed to add task.' });
    }
    const task = { id: result.insertId, title, description, owner, attachment, completed: false, sharedWith: '[]' };
    io.emit('notification', { type: 'added', message: `New task added: "${title}"`, task });
    res.status(201).json(task);
  });
});

// Get tasks
app.get('/tasks', (req, res) => {
  const { user = 'muqeet', search = '', filter = 'all' } = req.query;
  let sql = `SELECT * FROM tasks WHERE (owner = ? OR JSON_CONTAINS(sharedWith, JSON_QUOTE(?)))`;
  const params = [user, user];

  if (search) {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (filter === 'completed') sql += ` AND completed = 1`;
  if (filter === 'pending') sql += ` AND completed = 0`;

  sql += ` ORDER BY createdAt DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch tasks.' });
    res.json(results);
  });
});

// Get single task
app.get('/tasks/:id', (req, res) => {
  db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch task.' });
    if (!results.length) return res.status(404).json({ error: 'Task not found.' });
    res.json(results[0]);
  });
});

// Update task
app.patch('/tasks/:id', (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required.' });
  db.query(
    'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
    [title.trim(), description?.trim() || '', req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to update task.' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found.' });
      io.emit('notification', { type: 'updated', message: `Task updated: "${title}"` });
      res.json({ id: req.params.id, title, description });
    }
  );
});

// Toggle task status
app.patch('/tasks/:id/toggle', (req, res) => {
  const id = req.params.id;
  // First get current state, then explicitly set the opposite
  db.query('SELECT completed FROM tasks WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to toggle task.' });
    if (!rows.length) return res.status(404).json({ error: 'Task not found.' });

    const newState = rows[0].completed ? 0 : 1;
    db.query('UPDATE tasks SET completed = ? WHERE id = ?', [newState, id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to toggle task.' });
      db.query('SELECT * FROM tasks WHERE id = ?', [id], (e, updated) => {
        if (!e && updated.length) {
          const t = updated[0];
          io.emit('notification', {
            type: 'toggled',
            message: `Task "${t.title}" marked ${t.completed ? 'complete' : 'pending'}`,
          });
        }
      });
      res.json({ id, completed: newState });
    });
  });
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
  db.query('SELECT title FROM tasks WHERE id = ?', [req.params.id], (e, rows) => {
    const title = rows?.[0]?.title || 'Unknown';
    db.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to delete task.' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found.' });
      io.emit('notification', { type: 'deleted', message: `Task deleted: "${title}"` });
      res.sendStatus(204);
    });
  });
});

// Share task
app.put('/tasks/:id/share', (req, res) => {
  const { shareWith } = req.body;
  if (!Array.isArray(shareWith)) return res.status(400).json({ error: 'shareWith must be an array.' });
  db.query(
    'UPDATE tasks SET sharedWith = ? WHERE id = ?',
    [JSON.stringify(shareWith), req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to share task.' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found.' });
      io.emit('notification', { type: 'shared', message: `Task shared with: ${shareWith.join(', ')}` });
      res.sendStatus(204);
    }
  );
});

// ── Analytics ──────────────────────────────────────────────────────────────

app.get('/analytics/overview', (req, res) => {
  const { user = 'muqeet' } = req.query;
  db.query(
    `SELECT COUNT(*) AS total, SUM(completed=1) AS completed, SUM(completed=0) AS pending
     FROM tasks WHERE owner = ? OR JSON_CONTAINS(sharedWith, JSON_QUOTE(?))`,
    [user, user],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch analytics.' });
      res.json(result[0]);
    }
  );
});

app.get('/analytics/trends', (req, res) => {
  const { user = 'muqeet' } = req.query;
  db.query(
    `SELECT DATE(createdAt) as date, COUNT(*) as total
     FROM tasks
     WHERE owner = ? OR JSON_CONTAINS(sharedWith, JSON_QUOTE(?))
     GROUP BY DATE(createdAt)
     ORDER BY DATE(createdAt) DESC
     LIMIT 7`,
    [user, user],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch trends.' });
      res.json(result);
    }
  );
});

// ── Error handler ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Serve React build in production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
  app.get('/{*path}', (req, res) =>
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'))
  );
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
