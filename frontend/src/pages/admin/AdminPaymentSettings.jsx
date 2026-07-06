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

async function apiPut(path, body) {
  const token = getSavedToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
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

export default function AdminPaymentSettings() {
  const [form, setForm] = useState({
    account_title: '',
    easypaisa_number: '',
    jazzcash_number: '',
    bank_name: '',
    bank_account_number: '',
    iban: '',
    note: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadSettings() {
    try {
      setLoading(true);
      setError('');

      const payload = await apiGet('/payment-settings');
      const data = pickData(payload);

      setForm({
        account_title: data?.account_title || '',
        easypaisa_number: data?.easypaisa_number || '',
        jazzcash_number: data?.jazzcash_number || '',
        bank_name: data?.bank_name || '',
        bank_account_number: data?.bank_account_number || '',
        iban: data?.iban || '',
        note: data?.note || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await apiPut('/payment-settings', form);

      setSuccess('Payment settings updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update payment settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page adminPaymentSettingsPage">
      <div className="pageHeader">
        <div>
          <h1>Payment Settings</h1>
          <p>
            Add Easypaisa, JazzCash, and bank details. These details will show
            in user package activation modal.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <p className="muted">Loading payment settings...</p>
        </div>
      ) : (
        <form className="card adminPaymentSettingsCard" onSubmit={submit}>
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <div className="gridTwo paymentSettingsGrid">
            <label>
              Account Title
              <input
                name="account_title"
                value={form.account_title}
                onChange={handleChange}
                placeholder="BMS EarnHub Admin"
              />
            </label>

            <label>
              Easypaisa Number
              <input
                name="easypaisa_number"
                value={form.easypaisa_number}
                onChange={handleChange}
                placeholder="03XX XXXXXXX"
              />
            </label>

            <label>
              JazzCash Number
              <input
                name="jazzcash_number"
                value={form.jazzcash_number}
                onChange={handleChange}
                placeholder="03XX XXXXXXX"
              />
            </label>

            <label>
              Bank Name
              <input
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                placeholder="Bank name"
              />
            </label>

            <label>
              Bank Account Number
              <input
                name="bank_account_number"
                value={form.bank_account_number}
                onChange={handleChange}
                placeholder="Bank account number"
              />
            </label>

            <label>
              IBAN
              <input
                name="iban"
                value={form.iban}
                onChange={handleChange}
                placeholder="PK00 XXXX XXXX XXXX"
              />
            </label>
          </div>

          <label>
            Note
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Payment send karne ke baad screenshot upload karein."
            />
          </label>

          <button className="btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Payment Settings'}
          </button>
        </form>
      )}
    </main>
  );
}

