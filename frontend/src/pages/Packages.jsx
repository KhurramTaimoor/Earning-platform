import React, { useEffect, useMemo, useState } from 'react';

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
  const s = String(status || '').toLowerCase();

  if (['approved', 'paid', 'active', 'completed'].includes(s)) {
    return 'badge approved';
  }

  if (['pending', 'processing'].includes(s)) {
    return 'badge pending';
  }

  if (['rejected', 'failed', 'cancelled'].includes(s)) {
    return 'badge rejected';
  }

  return 'badge';
}

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPackages() {
    try {
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
      setPackages([]);
    }
  }

  async function loadPayments() {
    const payload = await apiGet('/payments/my');
    const data = pickData(payload);

    if (Array.isArray(data)) {
      setPayments(data);
    } else if (Array.isArray(data?.payments)) {
      setPayments(data.payments);
    } else {
      setPayments([]);
    }
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError('');

      await Promise.all([loadPackages(), loadPayments()]);
    } catch (err) {
      setError(err.message || 'Failed to load package history');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const activePayment = useMemo(() => {
    const approvedPayments = payments.filter((item) => {
      const status = String(item.status || '').toLowerCase();

      return ['approved', 'paid', 'active', 'completed'].includes(status);
    });

    if (approvedPayments.length === 0) return null;

    return approvedPayments.sort((a, b) => {
      const dateA = new Date(
        a.approved_at || a.updated_at || a.created_at || 0
      ).getTime();

      const dateB = new Date(
        b.approved_at || b.updated_at || b.created_at || 0
      ).getTime();

      return dateB - dateA;
    })[0];
  }, [payments]);

  const activePackage = useMemo(() => {
    if (!activePayment) return null;

    const paymentPackageId =
      activePayment.package_id ||
      activePayment.packageId ||
      activePayment.package?.id ||
      activePayment.packages?.id;

    const databasePackage = packages.find((pkg) => {
      return String(pkg.id) === String(paymentPackageId);
    });

    return {
      id: databasePackage?.id || paymentPackageId,
      name:
        databasePackage?.name ||
        activePayment.package_name ||
        activePayment.package?.name ||
        activePayment.packages?.name ||
        'Active Package',

      price:
        databasePackage?.price ||
        activePayment.amount ||
        activePayment.price ||
        activePayment.package?.price ||
        activePayment.packages?.price ||
        0,

      daily_limit:
        databasePackage?.daily_limit ||
        databasePackage?.daily_earning_limit ||
        activePayment.daily_limit ||
        activePayment.daily_earning_limit ||
        activePayment.package?.daily_limit ||
        activePayment.packages?.daily_limit ||
        0,

      daily_task_limit:
        databasePackage?.daily_task_limit ||
        activePayment.daily_task_limit ||
        activePayment.package?.daily_task_limit ||
        activePayment.packages?.daily_task_limit ||
        0,

      status: activePayment.status || 'approved',
      payment_method:
        activePayment.payment_method || activePayment.method || '-',
      transaction_id:
        activePayment.transaction_id || activePayment.reference_no || '-',
      approved_at:
        activePayment.approved_at ||
        activePayment.updated_at ||
        activePayment.created_at,
    };
  }, [activePayment, packages]);

  return (
    <main className="page packagesPage">
      <div className="pageHeader">
        <div>
          <h1>Packages</h1>
          <p>Your active package and payment transaction history.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="card">
          <p className="muted">Loading package details...</p>
        </div>
      ) : (
        <>
          <section className="card activePackageBox">
            <span className="sectionTag">Current Active Package</span>

            {activePackage ? (
              <>
                <div className="activePackageTitleRow">
                  <div>
                    <h2>{activePackage.name}</h2>
                    <p className="muted">
                      Your package is active after admin approval.
                    </p>
                  </div>

                  <span className={getStatusClass(activePackage.status)}>
                    {activePackage.status}
                  </span>
                </div>

                <div className="activePackageInfo">
                  <div>
                    <p>Package Price</p>
                    <strong>{formatPKR(activePackage.price)}</strong>
                  </div>

                  <div>
                    <p>Daily Earning Limit</p>
                    <strong>{formatPKR(activePackage.daily_limit)}</strong>
                  </div>

                  <div>
                    <p>Daily Task Limit</p>
                    <strong>{activePackage.daily_task_limit || '-'}</strong>
                  </div>

                  <div>
                    <p>Approved Date</p>
                    <strong className="smallStrong">
                      {formatDate(activePackage.approved_at)}
                    </strong>
                  </div>

                  <div>
                    <p>Payment Method</p>
                    <strong className="smallStrong">
                      {activePackage.payment_method}
                    </strong>
                  </div>

                  <div>
                    <p>Transaction ID</p>
                    <strong className="smallStrong">
                      {activePackage.transaction_id}
                    </strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="noActivePackageBox">
                <h2>No Active Package</h2>
                <p className="muted">
                  You do not have an approved package yet. After admin approves
                  your payment, your active package will show here.
                </p>
              </div>
            )}
          </section>

          <section className="transactionHistorySection">
            <div className="sectionMiniHeader">
              <div>
                <h2>Transaction History</h2>
                <p>Your submitted payment proofs and approval status.</p>
              </div>
            </div>

            <div className="card tableCard">
              {payments.length === 0 ? (
                <p className="muted">No transaction history found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Package</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Transaction ID</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((item) => {
                      const packageName =
                        item.package_name ||
                        item.package?.name ||
                        item.packages?.name ||
                        packages.find(
                          (pkg) => String(pkg.id) === String(item.package_id)
                        )?.name ||
                        '-';

                      return (
                        <tr key={item.id}>
                          <td>{packageName}</td>

                          <td>{formatPKR(item.amount || item.price)}</td>

                          <td>{item.payment_method || item.method || '-'}</td>

                          <td>
                            {item.transaction_id || item.reference_no || '-'}
                          </td>

                          <td>
                            <span className={getStatusClass(item.status)}>
                              {item.status || 'pending'}
                            </span>
                          </td>

                          <td>{formatDate(item.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}