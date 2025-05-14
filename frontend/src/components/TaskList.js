import React, { useState } from 'react';

const TaskList = ({ tasks, deleteTask, toggleComplete, editTask, shareTask }) => {
  const [editId, setEditId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const startEditing = (task) => {
    setEditId(task.id);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
  };

  const saveEdit = (id) => {
    if (editedTitle.trim() === '' || editedDescription.trim() === '') return;
    editTask(id, { title: editedTitle, description: editedDescription });
    setEditId(null);
  };

  return (
    <div>
      {Array.isArray(tasks) && tasks.length === 0 && <p>No tasks yet.</p>}

      {Array.isArray(tasks) &&
        tasks.map((task) => (
          <div
            className={`task-item ${task.completed ? 'completed' : ''}`}
            key={task.id}
          >
            {editId === task.id ? (
              <>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <input
                  type="text"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />
                <button onClick={() => saveEdit(task.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>
                  <small>
                    Shared with:{' '}
                    {task.sharedWith && task.sharedWith.length > 0
                      ? JSON.parse(task.sharedWith).join(', ')
                      : '—'}
                  </small>
                </p>
                <div className="task-buttons">
                  <button onClick={() => toggleComplete(task.id)}>
                    {task.completed ? 'Undo' : 'Complete'}
                  </button>
                  <button onClick={() => startEditing(task)}>Edit</button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                  <button onClick={() => shareTask(task.id)}>Share</button>
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  );
};

export default TaskList;

