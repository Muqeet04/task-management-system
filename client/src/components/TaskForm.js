import React, { useState, useRef, useEffect } from 'react';

const TaskForm = ({ addTask, loading }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [step, setStep] = useState(1); // 1 = title, 2 = details
  const titleRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    if (open && step === 1) setTimeout(() => titleRef.current?.focus(), 50);
    if (open && step === 2) setTimeout(() => descRef.current?.focus(), 50);
  }, [open, step]);

  const handleOpen = () => {
    setOpen(true);
    setStep(1);
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setTitle('');
    setDescription('');
    setAttachment(null);
    const fi = document.getElementById('fab-file-input');
    if (fi) fi.value = '';
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    if (attachment) formData.append('attachment', attachment);
    addTask(formData);
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fab-backdrop" onClick={handleClose} />}

      <div className={`fab-container${open ? ' fab-open' : ''}`}>
        {/* Expanded form */}
        {open && (
          <div className="fab-form-card">
            {/* Step indicator */}
            <div className="fab-steps">
              <div className={`fab-step${step >= 1 ? ' active' : ''}`}>
                <span className="fab-step-dot">1</span>
                <span className="fab-step-label">Title</span>
              </div>
              <div className="fab-step-line" />
              <div className={`fab-step${step >= 2 ? ' active' : ''}`}>
                <span className="fab-step-dot">2</span>
                <span className="fab-step-label">Details</span>
              </div>
            </div>

            {step === 1 && (
              <form onSubmit={handleNext} className="fab-step-body">
                <p className="fab-hint">What do you need to get done?</p>
                <input
                  ref={titleRef}
                  className="fab-big-input"
                  type="text"
                  placeholder="Type your task..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                />
                <div className="fab-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                    Next →
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="fab-step-body">
                <div className="fab-title-preview">
                  <span className="fab-title-preview-label">Task:</span>
                  <span className="fab-title-preview-text">{title}</span>
                  <button
                    type="button"
                    className="fab-edit-title"
                    onClick={() => setStep(1)}
                    title="Edit title"
                  >✏️</button>
                </div>

                <textarea
                  ref={descRef}
                  className="form-textarea"
                  placeholder="Add a description (optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={3}
                />

                <label className={`file-upload-label${attachment ? ' has-file' : ''}`}>
                  <span className="file-upload-icon">{attachment ? '✅' : '📎'}</span>
                  <span className="file-upload-text">
                    {attachment ? attachment.name : 'Attach a file (optional)'}
                  </span>
                  <input
                    id="fab-file-input"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => setAttachment(e.target.files[0] || null)}
                  />
                </label>

                <div className="fab-form-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : '✓ Add Task'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* FAB button */}
        <button
          className={`fab-btn${open ? ' fab-btn-close' : ''}`}
          onClick={open ? handleClose : handleOpen}
          aria-label={open ? 'Close' : 'Add new task'}
          title={open ? 'Close' : 'Add new task'}
        >
          <span className="fab-btn-icon">{open ? '✕' : '+'}</span>
          {!open && <span className="fab-btn-label">New Task</span>}
        </button>
      </div>
    </>
  );
};

export default TaskForm;
