# TaskFlow — How to Run

## Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v16+
- [MySQL](https://dev.mysql.com/downloads/) v8+
- npm (comes with Node)

---

## 1. Open a Terminal in the Project Root

The project root is the folder that contains `app.js`, `package.json`, and the `client/` folder.

```
task-management-system/   <-- you should be here
├── app.js
├── db.js
├── package.json
├── .env
├── uploads/
├── client/
└── routes/
```

If you're using VS Code, right-click the root folder in the Explorer and choose **Open in Integrated Terminal**. Or open a terminal and navigate there:

```bash
cd ~/Desktop/task-management-system
```

---

## 2. Install Backend Dependencies

Run this from the **project root**:

```bash
npm install
```

---

## 3. Set Up the Database

Open your MySQL client and run:

```sql
CREATE DATABASE IF NOT EXISTS taskdb;

USE taskdb;

CREATE TABLE IF NOT EXISTS users (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(50)  NOT NULL UNIQUE,
  password  VARCHAR(100) NOT NULL,
  createdAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200)  NOT NULL,
  description TEXT,
  owner       VARCHAR(100)  NOT NULL DEFAULT 'muqeet',
  sharedWith  JSON          NOT NULL DEFAULT ('[]'),
  completed   TINYINT(1)    NOT NULL DEFAULT 0,
  attachment  VARCHAR(255)  DEFAULT NULL,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Configure Environment Variables

The `.env` file is already in the project root. Edit it if your MySQL credentials differ:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=muqeet
DB_NAME=taskdb
PORT=5000
```

---

## 5. Install Frontend Dependencies

```bash
cd ~/Desktop/task-management-system/client
npm install
```

> Only needs to be done once.

---

## 6. Run the App

You need **two terminals** open at the same time.

**Terminal 1 — Backend** (project root):

```bash
cd ~/Desktop/task-management-system
node app.js
```

You should see:
```
✅ MySQL connected (pool)
🚀 Server running on port 5000
```

Leave this running. Do not close it.

**Terminal 2 — Frontend** (client folder):

```bash
cd ~/Desktop/task-management-system/client
npm start
```

Opens automatically at `http://localhost:3000`.

> Not sure which folder you're in? Run `pwd` — it prints your current path.

---

## 7. Using the App

| Feature | How |
|---|---|
| Add a task | Click the **+ New Task** button in the bottom-right corner |
| Step 1 | Type your task title, press **Next →** |
| Step 2 | Add an optional description and/or file attachment, press **✓ Add Task** |
| Complete a task | Click the checkbox on the left, or the **✓ Done** button |
| Undo complete | Click **↩ Undo** on a completed task |
| Edit a task | Click ✏️, edit inline, then **Save** |
| Delete a task | Click 🗑 |
| Share a task | Click 📤, type a username, click **Add** then **Share** |
| Search | Type in the search bar — queries the backend live |
| Filter | Use the dropdown — All / Pending / Completed |
| Analytics | Click the **Analytics** tab for charts and completion stats |
| Dark mode | Click the 🌙 / 🌞 button in the top-right corner |

---

## 8. Project Structure

```
task-management-system/
├── app.js                  # Express server + all API routes
├── db.js                   # MySQL connection pool
├── .env                    # Environment variables
├── uploads/                # Uploaded file attachments (auto-created)
├── routes/
│   └── tasks.js            # Standalone route file (reference only)
└── client/                 # React frontend (active)
    └── src/
        ├── App.js
        ├── App.css
        └── components/
            ├── TaskForm.js         # FAB floating task creator
            ├── TaskList.js         # Task cards with inline edit
            ├── AnalyticsDashboard.js
            ├── DarkModeToggle.js
            └── ShareModal.js
```

---

## 9. API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks?user=&search=&filter=` | List tasks (supports search + filter) |
| POST | `/tasks` | Create task (multipart/form-data) |
| GET | `/tasks/:id` | Get single task |
| PATCH | `/tasks/:id` | Update title/description |
| PATCH | `/tasks/:id/toggle` | Toggle completed status |
| DELETE | `/tasks/:id` | Delete task |
| PUT | `/tasks/:id/share` | Update shared users |
| GET | `/analytics/overview?user=` | Total / completed / pending counts |
| GET | `/analytics/trends?user=` | Tasks created per day (last 7 days) |

---

## Troubleshooting

**`DB Connection Error`** — Check your `.env` credentials match your MySQL setup.

**`EADDRINUSE: port 5000`** — Something is already on port 5000. Change `PORT` in `.env`.

**Frontend shows blank page** — Make sure the backend is running first, then hard-refresh (`Ctrl+Shift+R`).

**Old form still showing at the bottom** — Stop the dev server (`Ctrl+C`), then `npm start` again and hard-refresh the browser (`Ctrl+Shift+R`).

**Uploads not showing** — The `uploads/` folder must exist in the project root. Create it with `mkdir uploads`.

**Toggle not working** — Make sure the backend is restarted after the latest `app.js` changes.
