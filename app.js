const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Allow socket.io CORS for development
const io = new Server(server, {
  cors: { origin: '*' }, // Change this to your frontend URL in production
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend (React build)
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) return console.error('❌ DB Connection Error:', err);
  console.log('✅ MySQL connected');
});

// Socket.IO for real-time notifications
io.on('connection', (socket) => {
  console.log('🔌 New client connected');
});

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Add a task
app.post('/tasks', upload.single('attachment'), (req, res) => {
  const { title, description } = req.body;
  const owner = 'muqeet'; // Replace with auth later if needed
  const attachment = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO tasks (title, description, owner, sharedWith, completed, createdAt, attachment)
    VALUES (?, ?, ?, ?, ?, NOW(), ?)
  `;
  const values = [title, description, owner, '[]', false, attachment];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ error: 'Failed to add task.' });
    }

    io.emit('notification', `New task added by ${owner}`);
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      owner,
      attachment,
      completed: false,
    });
  });
});

// Get tasks
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

// Update task
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

// Toggle task status
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

// Delete task
app.delete('/tasks/:id', (req, res) => {
  db.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

// Share task
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

// Analytics - overview
app.get('/analytics/overview', (req, res) => {
  const user = req.query.user;
  db.query(
    `SELECT COUNT(*) AS total, 
            SUM(completed=1) AS completed, 
            SUM(completed=0) AS pending
     FROM tasks 
     WHERE owner = ? OR JSON_CONTAINS(sharedWith, JSON_QUOTE(?))`,
    [user, user],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result[0]);
    }
  );
});

// Analytics - trends
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

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

