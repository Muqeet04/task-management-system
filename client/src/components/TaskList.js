import React, { useState } from 'react';

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const TaskItem = ({ task, deleteTask, toggleComplete, editTask, shareTask }) => {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');

  const handleSave = () => {
    if (!editTitle.trim()) return;
    editTask(task.id, { title: editTitle.trim(), description: editDesc.trim() });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditing(false);
  };

  const sharedWith = (() => {
    try { return JSON.parse(task.sharedWith || '[]'); } catch { return []; }
  })();

  const isCompleted = task.completed === 1 || task.completed === true;

  return (
    <div className={`task-item${isCompleted ? ' completed' : ''}`}>
      <div className="task-header">

        {/* Checkbox */}
        <div
          className={`task-checkbox${isCompleted ? ' checked' : ''}`}
          onClick={() => toggleComplete(task.id)}
          role="checkbox"
          aria-checked={isCompleted}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleComplete(task.id)}
          title={isCompleted ? 'Mark as pending' : 'Mark as complete'}
        >
          {isCompleted && <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>✓</span>}
        </div>

        <div className="task-body">
          {editing ? (
            <div className="edit-form">
              <input
                className="form-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
              />
              <textarea
                className="form-textarea"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
              />
              <div className="form-actions">
                <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
              </div>
            </div>
          ) : (
            <>
              <div className="task-title">{task.title}</div>
              {task.description && (
                <div className="task-description">{task.description}</div>
              )}
              <div className="task-meta">
                <span className={`task-badge ${isCompleted ? 'badge-completed' : 'badge-pending'}`}>
                  {isCompleted ? '✓ Done' : '● Pending'}
                </span>
                {sharedWith.length > 0 && (
                  <span className="task-badge badge-shared">Shared ({sharedWith.length})</span>
                )}
                {task.createdAt && (
                  <span className="task-date">{formatDate(task.createdAt)}</span>
                )}
              </div>
            </>
          )}

          {task.attachment && !editing && (
            <div className="task-attachment">
              {isImage(task.attachment) ? (
                <img src={`http://localhost:5000/uploads/${task.attachment}`} alt="attachment" />
              ) : (
                <a
                  className="attachment-link"
                  href={`http://localhost:5000/uploads/${task.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📎 View Attachment
                </a>
              )}
            </div>
          )}
        </div>

        {!editing && (
          <div className="task-actions">
            <button
              className="btn btn-sm btn-success"
              onClick={() => toggleComplete(task.id)}
              title={isCompleted ? 'Mark pending' : 'Mark complete'}
            >
              {isCompleted ? '↩ Undo' : '✓ Done'}
            </button>
            <button className="btn-icon" title="Edit" onClick={() => setEditing(true)}>✏️</button>
            <button className="btn-icon" title="Share" onClick={() => shareTask(task.id)}>📤</button>
            <button
              className="btn-icon"
              title="Delete"
              onClick={() => deleteTask(task.id)}
              style={{ color: 'var(--danger)' }}
            >🗑</button>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskList = ({ tasks, deleteTask, toggleComplete, editTask, shareTask, loading }) => {
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <span>Loading tasks...</span>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3>No tasks found</h3>
        <p>Add a new task above to get started.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          deleteTask={deleteTask}
          toggleComplete={toggleComplete}
          editTask={editTask}
          shareTask={shareTask}
        />
      ))}
    </div>
  );
};

export default TaskList;
