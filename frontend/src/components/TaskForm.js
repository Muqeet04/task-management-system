import React, { useState } from 'react';

const TaskForm = ({ addTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('attachment', attachment);

    addTask(formData);

    setTitle('');
    setDescription('');
    setAttachment(null);
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Task Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="file" onChange={(e) => setAttachment(e.target.files[0])} />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;

