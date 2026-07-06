import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getSavedToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('bms_token') ||
    ''
  );
}

async function apiGet(path) {
  const token = getSavedToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

async function apiPost(path, body) {
  const token = getSavedToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function pickData(payload) {
  return payload?.data || payload?.result || payload;
}

function formatPKR(value) {
  const amount = Number(value || 0);
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

function getTaskTitle(task) {
  return task?.title || task?.task_title || '-';
}

function getTaskType(task) {
  const type = task?.task_type || task?.type || '-';

  if (type === 'simple_task') return 'Simple Task';
  if (type === 'ad_watch') return 'Ad Watch';

  return type;
}

function getReward(task) {
  return Number(task?.reward_amount || task?.reward || 0);
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase();

  if (value === 'active') return 'badge approved';
  if (value === 'inactive') return 'badge rejected';

  return 'badge';
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    task_type: 'simple_task',
    reward_amount: '',
    link_url: '',
    description: '',
    proof_required: true,
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadTasks() {
    try {
      setLoading(true);
      setError('');

      const payload = await apiGet('/tasks');
      const data = pickData(payload);

      if (Array.isArray(data)) {
        setTasks(data);
      } else if (Array.isArray(data?.tasks)) {
        setTasks(data.tasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function openCreateModal() {
    setForm({
      title: '',
      task_type: 'simple_task',
      reward_amount: '',
      link_url: '',
      description: '',
      proof_required: true,
      status: 'active',
    });

    setError('');
    setSuccess('');
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
  }

  async function submitTask(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const title = form.title.trim();
      const taskType = form.task_type;
      const rewardAmount = Number(form.reward_amount || 0);
      const description = form.description.trim();
      const linkUrl = form.link_url.trim();

      if (!title) {
        setError('Task title is required.');
        return;
      }

      if (!description) {
        setError('Task description is required.');
        return;
      }

      if (rewardAmount <= 0) {
        setError('Reward amount must be greater than 0.');
        return;
      }

      if (!['simple_task', 'ad_watch'].includes(taskType)) {
        setError('Invalid task type.');
        return;
      }

      await apiPost('/admin/tasks', {
        title,
        description,

        // Database allowed values only:
        // simple_task / ad_watch
        task_type: taskType,

        reward_amount: rewardAmount,
        proof_required: Boolean(form.proof_required),
        link_url: linkUrl,
        status: form.status,
      });

      setSuccess('Task created successfully.');
      setShowCreateModal(false);
      await loadTasks();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page adminCleanPage">
      <div className="pageHeader adminPageHeader">
        <div>
          <h1>Admin Tasks</h1>
          <p>Create ad watching or simple tasks with reward amount.</p>
        </div>

        <button type="button" className="btn" onClick={openCreateModal}>
          + Create Task
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <section className="card tableCard adminListCard">
        <h2>Tasks List</h2>

        {loading ? (
          <p className="muted">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Reward</th>
                <th>Proof Required</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{getTaskTitle(task)}</td>

                  <td>{getTaskType(task)}</td>

                  <td>{formatPKR(getReward(task))}</td>

                  <td>
                    <span
                      className={
                        task.proof_required === false
                          ? 'badge'
                          : 'badge approved'
                      }
                    >
                      {task.proof_required === false ? 'No' : 'Yes'}
                    </span>
                  </td>

                  <td>
                    <span className={getStatusClass(task.status)}>
                      {task.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showCreateModal && (
        <div className="modalBackdrop">
          <form className="card modal adminCreateModal" onSubmit={submitTask}>
            <div className="modalHeader">
              <div>
                <h2>Create Task</h2>
                <p className="muted">Create a new earning task for users.</p>
              </div>

              <button
                type="button"
                className="btn ghost small"
                onClick={closeCreateModal}
              >
                Close
              </button>
            </div>

            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Watch ad and submit proof"
                required
              />
            </label>

            <label>
              Task Type
              <select
                name="task_type"
                value={form.task_type}
                onChange={handleChange}
                required
              >
                <option value="simple_task">Simple Task</option>
                <option value="ad_watch">Ad Watch</option>
              </select>
            </label>

            <label>
              Reward Amount
              <input
                name="reward_amount"
                type="number"
                min="1"
                value={form.reward_amount}
                onChange={handleChange}
                placeholder="20"
                required
              />
            </label>

            <label>
              Task Link
              <input
                name="link_url"
                value={form.link_url}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Explain what user has to do. Example: Open link, watch video, then upload screenshot."
                required
              />
            </label>

            <label className="checkboxLabel">
              <input
                name="proof_required"
                type="checkbox"
                checked={form.proof_required}
                onChange={handleChange}
              />
              Proof Required
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <button className="btn loginSubmitBtn" disabled={saving}>
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}