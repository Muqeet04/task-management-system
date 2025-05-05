import React, { useState } from 'react';

const TaskList = ({ tasks, deleteTask, toggleComplete, editTask }) => {
  const [editId, setEditId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const startEdit = (task) => {
    setEditId(task.id);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editTask(editId, {
      title: editedTitle,
      description: editedDescription,
    });
    setEditId(null);
    setEditedTitle('');
    setEditedDescription('');
  };

  return (
    <ul>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            marginBottom: '10px',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {editId === task.id ? (
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                required
              />
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                required
              />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditId(null)}>
                Cancel
              </button>
            </form>
          ) : (
            <>
              <strong>{task.title}</strong>: {task.description}
              <div>
                <button onClick={() => toggleComplete(task.id)}>
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
                <button onClick={() => startEdit(task)}>Edit</button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default TaskList;

