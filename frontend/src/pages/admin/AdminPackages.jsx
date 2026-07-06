import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://earning-platform-cykm.onrender.com/api';

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

function getPackageName(pkg) {
  return pkg?.name || pkg?.package_name || 'Package';
}

function getPackagePrice(pkg) {
  return Number(pkg?.price || pkg?.package_price || 0);
}

function getDailyEarningLimit(pkg) {
  return Number(
    pkg?.daily_earning_limit ||
      pkg?.daily_limit ||
      pkg?.dailyLimit ||
      0
  );
}

function getDailyTaskLimit(pkg) {
  return Number(
    pkg?.daily_task_limit ||
      pkg?.dailyTaskLimit ||
      pkg?.task_limit ||
      0
  );
}

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    daily_earning_limit: '',
    daily_task_limit: '',
    description: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadPackages() {
    try {
      setLoading(true);
      setError('');

      const payload = await apiGet('/packages');
      const data = pickData(payload);

      if (Array.isArray(data)) {
        setPackages(data);
      } else if (Array.isArray(data?.packages)) {
        setPackages(data.packages);
      } else {
        setPackages([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
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
      name: '',
      price: '',
      daily_earning_limit: '',
      daily_task_limit: '',
      description: '',
      is_active: true,
    });

    setError('');
    setSuccess('');
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
  }

  async function submitPackage(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const name = form.name.trim();
      const price = Number(form.price || 0);
      const dailyEarningLimit = Number(form.daily_earning_limit || 0);
      const dailyTaskLimit = Number(form.daily_task_limit || 0);
      const description = form.description.trim();

      if (!name) {
        setError('Package name is required.');
        return;
      }

      if (price <= 0) {
        setError('Price must be greater than 0.');
        return;
      }

      if (dailyEarningLimit <= 0) {
        setError('Daily earning limit must be greater than 0.');
        return;
      }

      await apiPost('/admin/packages', {
        name,
        price,

        // Important: database required column
        daily_earning_limit: dailyEarningLimit,

        // Extra compatibility for frontend/backend old names
        daily_limit: dailyEarningLimit,
        dailyLimit: dailyEarningLimit,

        daily_task_limit: dailyTaskLimit,
        dailyTaskLimit: dailyTaskLimit,

        description,
        is_active: form.is_active,
      });

      setSuccess('Package created successfully.');
      setShowCreateModal(false);
      await loadPackages();
    } catch (err) {
      setError(err.message || 'Failed to create package');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page adminCleanPage">
      <div className="pageHeader adminPageHeader">
        <div>
          <h1>Admin Packages</h1>
          <p>Create and manage package tiers.</p>
        </div>

        <button type="button" className="btn" onClick={openCreateModal}>
          + Create Package
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <section className="card tableCard adminListCard">
        <h2>Packages List</h2>

        {loading ? (
          <p className="muted">Loading packages...</p>
        ) : packages.length === 0 ? (
          <p className="muted">No packages found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Daily Earning Limit</th>
                <th>Daily Task Limit</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td>{getPackageName(pkg)}</td>
                  <td>{formatPKR(getPackagePrice(pkg))}</td>
                  <td>{formatPKR(getDailyEarningLimit(pkg))}</td>
                  <td>{getDailyTaskLimit(pkg)}</td>
                  <td>
                    <span
                      className={
                        pkg.is_active === false
                          ? 'badge rejected'
                          : 'badge approved'
                      }
                    >
                      {pkg.is_active === false ? 'Inactive' : 'Active'}
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
          <form className="card modal adminCreateModal" onSubmit={submitPackage}>
            <div className="modalHeader">
              <div>
                <h2>Create Package</h2>
                <p className="muted">Add a new package tier for users.</p>
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
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Starter"
                required
              />
            </label>

            <label>
              Price
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                placeholder="500"
                required
              />
            </label>

            <label>
              Daily Earning Limit
              <input
                name="daily_earning_limit"
                type="number"
                min="1"
                value={form.daily_earning_limit}
                onChange={handleChange}
                placeholder="150"
                required
              />
            </label>

            <label>
              Daily Task Limit
              <input
                name="daily_task_limit"
                type="number"
                min="0"
                value={form.daily_task_limit}
                onChange={handleChange}
                placeholder="5"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Basic earning package with approved tasks."
              />
            </label>

            <label className="checkboxLabel">
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
              />
              Active Package
            </label>

            <button className="btn loginSubmitBtn" disabled={saving}>
              {saving ? 'Creating...' : 'Create Package'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

