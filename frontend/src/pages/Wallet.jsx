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

function getTypeClass(type) {
  const value = String(type || '').toLowerCase();

  if (value === 'credit' || value === 'reward' || value === 'earning') {
    return 'badge credit';
  }

  if (value === 'debit' || value === 'withdrawal') {
    return 'badge debit';
  }

  return 'badge';
}

export default function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadWalletTransactions() {
    try {
      setLoading(true);
      setError('');

      const payload = await apiGet('/dashboard/wallet');
      const data = pickData(payload);

      const transactionList =
        data?.transactions ||
        data?.wallet_transactions ||
        data?.walletTransactions ||
        data?.history ||
        [];

      if (Array.isArray(transactionList)) {
        setTransactions(transactionList);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load wallet transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWalletTransactions();
  }, []);

  return (
    <main className="page walletPage">
      <div className="pageHeader">
        <div>
          <h1>Wallet Transactions</h1>
          <p>View your wallet credits, debits, rewards, and withdrawal records.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="card">
          <p className="muted">Loading wallet transactions...</p>
        </div>
      ) : (
        <section className="card tableCard walletTransactionsCard">
          {transactions.length === 0 ? (
            <p className="muted">No wallet transactions found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((item) => {
                  const type =
                    item.type ||
                    item.transaction_type ||
                    item.entry_type ||
                    '-';

                  const amount =
                    item.amount ||
                    item.value ||
                    item.transaction_amount ||
                    0;

                  const source =
                    item.source ||
                    item.reference_type ||
                    item.module ||
                    '-';

                  const description =
                    item.description ||
                    item.note ||
                    item.remarks ||
                    item.reason ||
                    '-';

                  const date =
                    item.created_at ||
                    item.date ||
                    item.transaction_date ||
                    item.updated_at;

                  return (
                    <tr key={item.id || `${type}-${amount}-${date}`}>
                      <td>
                        <span className={getTypeClass(type)}>{type}</span>
                      </td>

                      <td>
                        <strong>{formatPKR(amount)}</strong>
                      </td>

                      <td>{source}</td>

                      <td>{description}</td>

                      <td>{formatDate(date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  );
}

