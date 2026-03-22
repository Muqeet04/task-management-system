import React, { useState } from 'react';

const ShareModal = ({ task, onShare, onClose }) => {
  const existing = (() => {
    try { return JSON.parse(task.sharedWith || '[]'); } catch { return []; }
  })();

  const [input, setInput] = useState('');
  const [users, setUsers] = useState(existing);

  const addUser = () => {
    const u = input.trim().toLowerCase();
    if (!u || users.includes(u)) return;
    setUsers([...users, u]);
    setInput('');
  };

  const removeUser = (u) => setUsers(users.filter((x) => x !== u));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addUser(); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Share Task</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          "{task.title}"
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            className="form-input"
            placeholder="Enter username"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="btn btn-primary" onClick={addUser} disabled={!input.trim()}>
            Add
          </button>
        </div>

        {users.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {users.map((u) => (
              <span
                key={u}
                className="task-badge badge-shared"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => removeUser(u)}
                title="Click to remove"
              >
                {u} ✕
              </span>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onShare(users)}>
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
