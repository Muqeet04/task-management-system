import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TaskList = () => {
  // State to hold the tasks from the API
  const [tasks, setTasks] = useState([]);

  // Fetch tasks when the component is mounted
  useEffect(() => {
    // Make an HTTP GET request to your backend API to fetch tasks
    axios.get('http://localhost:3000/tasks')
      .then(response => {
        // Update the tasks state with the fetched data
        setTasks(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the tasks!', error);
      });
  }, []);  // Empty array means it runs only once when the component is mounted

  return (
    <div>
      <h1>Task List</h1>
      <ul>
        {/* Map through the tasks and display them */}
        {tasks.map(task => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;

