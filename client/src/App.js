import React, { useEffect, useState } from 'react';
import API from './api';

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    API.get('/tasks')
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task List</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}><strong>{task.title}</strong>: {task.description}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

