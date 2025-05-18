import React from 'react';

const TaskList = ({ tasks, deleteTask, toggleComplete, editTask, shareTask }) => {
  const isImage = (filename) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  return (
    <div>
      {tasks.map((task) => (
        <div className="task-item" key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>

          {task.attachment && (
            <div style={{ marginTop: '10px' }}>
              {isImage(task.attachment) ? (
                <img
                  src={`http://localhost:5000/uploads/${task.attachment}`}
                  alt="attachment"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                />
              ) : (
                <a
                  href={`http://localhost:5000/uploads/${task.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📎 View Attachment
                </a>
              )}
            </div>
          )}

          <div className="task-buttons" style={{ marginTop: '10px' }}>
            <button onClick={() => toggleComplete(task.id)}>
              {task.completed ? '✅ Undo' : '✔ Complete'}
            </button>
            <button onClick={() => deleteTask(task.id)}>🗑 Delete</button>
            <button onClick={() => shareTask(task.id)}>📤 Share</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;

