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

function formatDate(value) {
  if (!value) return '-';

  return new Date(value).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase();

  if (['approved', 'paid', 'completed'].includes(value)) {
    return 'badge approved';
  }

  if (['pending', 'processing'].includes(value)) {
    return 'badge pending';
  }

  if (['rejected', 'failed', 'cancelled'].includes(value)) {
    return 'badge rejected';
  }

  return 'badge';
}

function getWalletTransactions(wallet) {
  const list =
    wallet?.transactions ||
    wallet?.wallet_transactions ||
    wallet?.walletTransactions ||
    wallet?.history ||
    [];

  return Array.isArray(list) ? list : [];
}

function calculateBalanceFromTransactions(transactions) {
  return transactions.reduce((total, item) => {
    const type = String(
      item?.type || item?.transaction_type || item?.entry_type || ''
    ).toLowerCase();

    const amount = Number(
      item?.amount || item?.value || item?.transaction_amount || 0
    );

    if (type === 'credit' || type === 'reward' || type === 'earning') {
      return total + amount;
    }

    if (type === 'debit' || type === 'withdrawal') {
      return total - amount;
    }

    return total;
  }, 0);
}

export default function Withdrawals() {
  const [wallet, setWallet] = useState({});
  const [withdrawals, setWithdrawals] = useState([]);

  const [form, setForm] = useState({
    amount: '',
    method: 'JazzCash',
    account_title: '',
    account_number: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadWallet() {
    try {
      const payload = await apiGet('/dashboard/wallet');
      const data = pickData(payload);

      setWallet(data || {});
    } catch (err) {
      setWallet({});
    }
  }

  async function loadWithdrawals() {
    try {
      const payload = await apiGet('/withdrawals/my');
      const data = pickData(payload);

      if (Array.isArray(data)) {
        setWithdrawals(data);
      } else if (Array.isArray(data?.withdrawals)) {
        setWithdrawals(data.withdrawals);
      } else {
        setWithdrawals([]);
      }
    } catch (err) {
      setWithdrawals([]);
    }
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError('');

      await Promise.all([loadWallet(), loadWithdrawals()]);
    } catch (err) {
      setError(err.message || 'Failed to load withdrawal data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const walletTransactions = getWalletTransactions(wallet);
  const transactionBasedBalance = calculateBalanceFromTransactions(walletTransactions);

  const availableBalance = Number(
    wallet?.available_balance ||
      wallet?.availableBalance ||
      wallet?.balance ||
      wallet?.wallet_balance ||
      transactionBasedBalance ||
      0
  );

  const withdrawableBalance = Number(
    wallet?.withdrawable_balance ||
      wallet?.withdrawableBalance ||
      availableBalance ||
      0
  );

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submitWithdrawal(e) {
    e.preventDefault();

    try {
      setSubmitLoading(true);
      setError('');
      setSuccess('');

      const amount = Number(form.amount || 0);

      if (amount <= 0) {
        setError('Please enter a valid withdrawal amount.');
        return;
      }

      if (amount > withdrawableBalance) {
        setError('Withdrawal amount cannot be greater than withdrawable balance.');
        return;
      }

      await apiPost('/withdrawals', {
        amount,
        method: form.method,
        payment_method: form.method,
        account_title: form.account_title,
        accountTitle: form.account_title,
        account_number: form.account_number,
        accountNumber: form.account_number,
      });

      setSuccess('Withdrawal request submitted successfully. Admin will review it.');

      setForm({
        amount: '',
        method: 'JazzCash',
        account_title: '',
        account_number: '',
      });

      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <main className="withdrawalsPage">
      <section className="withdrawalShell">
        <div className="withdrawalSide">
          <span className="authBadge">BMS EarnHub Wallet</span>

          <h1>Request Withdrawal</h1>

          <p>
            Submit your withdrawal request with correct account details. Admin
            will review your request and process payment manually.
          </p>

          <div className="withdrawalBalanceBox">
            <span>Withdrawable Balance</span>
            <strong>{formatPKR(withdrawableBalance)}</strong>
          </div>

          <div className="authFeatureList">
            <div>
              <strong>Secure Request</strong>
              <span>Your account details are submitted for admin review</span>
            </div>

            <div>
              <strong>Manual Approval</strong>
              <span>Admin checks the request before payment</span>
            </div>

            <div>
              <strong>Transaction Record</strong>
              <span>Your withdrawal history stays available below</span>
            </div>
          </div>
        </div>

        <form className="withdrawalCard" onSubmit={submitWithdrawal}>
          <div className="authHeader">
            <h2>Withdraw Balance</h2>
            <p>Enter your payment details to submit a withdrawal request.</p>
          </div>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <label>
            Amount
            <input
              name="amount"
              type="number"
              min="1"
              max={withdrawableBalance || undefined}
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              required
            />
          </label>

          <label>
            Method
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              required
            >
              <option value="JazzCash">JazzCash</option>
              <option value="Easypaisa">Easypaisa</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </label>

          <label>
            Account Title
            <input
              name="account_title"
              type="text"
              value={form.account_title}
              onChange={handleChange}
              placeholder="Enter account title"
              required
            />
          </label>

          <label>
            Account Number
            <input
              name="account_number"
              type="text"
              value={form.account_number}
              onChange={handleChange}
              placeholder="03XX XXXXXXX or bank account number"
              required
            />
          </label>

          <button className="btn loginSubmitBtn" disabled={submitLoading}>
            {submitLoading ? 'Submitting...' : 'Submit Withdrawal Request'}
          </button>
        </form>
      </section>

      <section className="withdrawalHistorySection">
        <div className="sectionMiniHeader">
          <div>
            <h2>Withdrawal History</h2>
            <p>Your previous withdrawal requests and current status.</p>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <p className="muted">Loading withdrawals...</p>
          </div>
        ) : (
          <div className="card tableCard withdrawalHistoryCard">
            {withdrawals.length === 0 ? (
              <p className="muted">No withdrawal history found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Account Title</th>
                    <th>Account Number</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {withdrawals.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{formatPKR(item.amount)}</strong>
                      </td>

                      <td>{item.method || item.payment_method || '-'}</td>

                      <td>{item.account_title || item.accountTitle || '-'}</td>

                      <td>{item.account_number || item.accountNumber || '-'}</td>

                      <td>
                        <span className={getStatusClass(item.status)}>
                          {item.status || 'pending'}
                        </span>
                      </td>

                      <td>{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </main>
  );
}