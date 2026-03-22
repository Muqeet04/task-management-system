# TaskFlow

A full-stack task management app built with React, Node.js, Express, MySQL, and Socket.IO.

---

## Features

- **Floating task creator** — a two-step FAB that pops up from the bottom-right corner
- **Real-time notifications** — Socket.IO toasts whenever a task is added, updated, deleted, or shared
- **Inline editing** — edit task title and description directly on the card
- **Task sharing** — share tasks with other users by username
- **File attachments** — attach images or documents to any task
- **Search & filter** — live search with All / Pending / Completed filter
- **Analytics dashboard** — doughnut + bar charts with completion rate progress bar
- **Dark mode** — respects system preference, toggleable at any time
- **Responsive** — works on mobile and desktop

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, CSS Variables |
| Backend | Node.js, Express 5 |
| Database | MySQL 8 (via mysql2 connection pool) |
| Real-time | Socket.IO |
| Charts | Chart.js + react-chartjs-2 |
| File uploads | Multer |

---

## Quick Start

**1. Install backend dependencies** (from project root):
```bash
npm install
```

**2. Set up MySQL** — create the database and table:
```sql
CREATE DATABASE IF NOT EXISTS taskdb;
USE taskdb;
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  owner VARCHAR(100) NOT NULL DEFAULT 'muqeet',
  sharedWith JSON NOT NULL DEFAULT ('[]'),
  completed TINYINT(1) NOT NULL DEFAULT 0,
  attachment VARCHAR(255) DEFAULT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**3. Configure `.env`** (already in project root):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=muqeet
DB_NAME=taskdb
PORT=5000
```

**4. Install frontend dependencies:**
```bash
cd client && npm install
```

**5. Run — two terminals:**
```bash
# Terminal 1 (project root)
node app.js

# Terminal 2 (client folder)
cd client && npm start
```

App runs at `http://localhost:3000`, backend at `http://localhost:5000`.

> See [WALKTHROUGH.md](./WALKTHROUGH.md) for a detailed step-by-step guide.

---

## Project Structure

```
task-management-system/
├── app.js                  # Express server + all API routes
├── db.js                   # MySQL connection pool
├── .env                    # Environment config
├── uploads/                # File attachments
├── routes/tasks.js         # Route file (reference)
└── client/
    └── src/
        ├── App.js
        ├── App.css
        └── components/
            ├── TaskForm.js         # FAB floating creator
            ├── TaskList.js         # Task cards + inline edit
            ├── AnalyticsDashboard.js
            ├── DarkModeToggle.js
            └── ShareModal.js
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List tasks (`?user=&search=&filter=`) |
| POST | `/tasks` | Create task (multipart/form-data) |
| GET | `/tasks/:id` | Get single task |
| PATCH | `/tasks/:id` | Update title/description |
| PATCH | `/tasks/:id/toggle` | Toggle completed |
| DELETE | `/tasks/:id` | Delete task |
| PUT | `/tasks/:id/share` | Share with users |
| GET | `/analytics/overview` | Stats summary |
| GET | `/analytics/trends` | Tasks per day (last 7 days) |

---

## Author

Built by [Muqeet](https://github.com/Muqeet04)
