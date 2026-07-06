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

async function apiPostForm(path, formData) {
  const token = getSavedToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
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

function showValue(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return 'Null';
  }

  return value;
}

function getPackageName(pkg) {
  return pkg?.name || pkg?.package_name || 'Package';
}

function getPackagePrice(pkg) {
  return Number(pkg?.price || pkg?.package_price || 0);
}

function getPackageDailyLimit(pkg) {
  return Number(
    pkg?.daily_earning_limit ||
      pkg?.daily_limit ||
      pkg?.dailyLimit ||
      0
  );
}

function isApprovedPayment(payment) {
  const status = String(payment?.status || '').toLowerCase();

  return ['approved', 'paid', 'active', 'completed'].includes(status);
}

function getPaymentAmount(payment) {
  return Number(
    payment?.amount ||
      payment?.price ||
      payment?.package_price ||
      payment?.package?.price ||
      payment?.packages?.price ||
      0
  );
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

export default function Dashboard() {
  const [wallet, setWallet] = useState({});
  const [packages, setPackages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({});

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [proofFile, setProofFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [packageLoading, setPackageLoading] = useState(true);
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
    } finally {
      setPackageLoading(false);
    }
  }

  async function loadPayments() {
    try {
      const payload = await apiGet('/payments/my');
      const data = pickData(payload);

      if (Array.isArray(data)) {
        setPayments(data);
      } else if (Array.isArray(data?.payments)) {
        setPayments(data.payments);
      } else {
        setPayments([]);
      }
    } catch (err) {
      setPayments([]);
    }
  }

  async function loadPaymentSettings() {
    try {
      const payload = await apiGet('/payment-settings');
      const data = pickData(payload);
      setPaymentSettings(data || {});
    } catch (err) {
      setPaymentSettings({});
    }
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError('');

      await Promise.all([
        loadWallet(),
        loadPackages(),
        loadPayments(),
        loadPaymentSettings(),
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const investedAmount = payments
    .filter(isApprovedPayment)
    .reduce((total, payment) => total + getPaymentAmount(payment), 0);

  const walletTransactions = getWalletTransactions(wallet);
  const transactionBasedBalance = calculateBalanceFromTransactions(walletTransactions);

  const availableBalance = Number(
    wallet?.available_balance ||
      wallet?.availableBalance ||
      wallet?.withdrawable_balance ||
      wallet?.withdrawableBalance ||
      wallet?.balance ||
      wallet?.wallet_balance ||
      transactionBasedBalance ||
      0
  );

  const withdrawableBalance = availableBalance;

  function openActivateModal(pkg) {
    setSelectedPackage(pkg);
    setPaymentMethod('Easypaisa');
    setTransactionId('');
    setProofFile(null);
    setError('');
    setSuccess('');
  }

  function closeActivateModal() {
    setSelectedPackage(null);
    setTransactionId('');
    setProofFile(null);
  }

  async function submitPaymentProof(e) {
    e.preventDefault();

    if (!selectedPackage) return;

    if (!proofFile) {
      setError('Please upload payment proof screenshot.');
      return;
    }

    try {
      setSubmitLoading(true);
      setError('');
      setSuccess('');

      const packagePrice = getPackagePrice(selectedPackage);

      const formData = new FormData();

      formData.append('package_id', selectedPackage.id);
      formData.append('amount', packagePrice);
      formData.append('payment_method', paymentMethod);
      formData.append('transaction_id', transactionId);

      /*
        Backend Multer screenshot field expect kar raha hai.
        Is liye file sirf screenshot ke naam se send hogi.
      */
      formData.append('screenshot', proofFile);

      await apiPostForm('/payments', formData);

      setSuccess(
        'Payment proof submitted successfully. Please wait for admin approval.'
      );

      closeActivateModal();
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to submit payment proof');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <main className="page dashboardPage">
      <div className="pageHeader dashboardHeader">
        <div>
          <h1>User Dashboard</h1>
          <p>Track your invested amount, task earnings, and withdrawable balance.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {loading ? (
        <div className="card">
          <p className="muted">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <section className="statsGrid dashboardStatsOneLine">
            <div className="statCard">
              <p>Invested Amount</p>
              <h3>{formatPKR(investedAmount)}</h3>
            </div>

            <div className="statCard">
              <p>Available Balance</p>
              <h3>{formatPKR(availableBalance)}</h3>
            </div>

            <div className="statCard">
              <p>Withdrawable Balance</p>
              <h3>{formatPKR(withdrawableBalance)}</h3>
            </div>
          </section>

          <section className="dashboardPackages">
            <div className="sectionMiniHeader">
              <div>
                <h2>Available Packages</h2>
                <p>
                  Select a package, deposit payment, upload screenshot, and wait
                  for admin approval.
                </p>
              </div>
            </div>

            {packageLoading ? (
              <div className="card">
                <p className="muted">Loading packages...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="card">
                <p className="muted">No packages found in database.</p>
              </div>
            ) : (
              <div className="packageGrid dashboardPackageGrid">
                {packages.map((pkg) => {
                  const packageName = getPackageName(pkg);
                  const price = getPackagePrice(pkg);
                  const dailyLimit = getPackageDailyLimit(pkg);

                  return (
                    <div
                      className="card packageCard dashboardPackageCard"
                      key={pkg.id}
                    >
                      <span className="badge active">{packageName}</span>

                      <h3>{packageName}</h3>

                      <div className="price">{formatPKR(price)}</div>

                      <p className="muted">
                        Daily earning limit:{' '}
                        <strong>{formatPKR(dailyLimit)}</strong>
                      </p>

                      <p className="muted">
                        {pkg.description ||
                          'Task access with admin approval system.'}
                      </p>

                      <button
                        type="button"
                        className="btn packageActivateBtn"
                        onClick={() => openActivateModal(pkg)}
                      >
                        Activate Package
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {selectedPackage && (
        <div className="modalBackdrop">
          <form
            className="card modal activatePackageModal"
            onSubmit={submitPaymentProof}
          >
            <div className="modalHeader">
              <div>
                <h2>Activate {getPackageName(selectedPackage)}</h2>
                <p className="muted">
                  Deposit payment and upload proof screenshot for admin approval.
                </p>
              </div>

              <button
                type="button"
                className="btn ghost small"
                onClick={closeActivateModal}
              >
                Close
              </button>
            </div>

            <div className="depositDetailsBox">
              <span className="sectionTag">Deposit Details</span>

              <div className="depositGrid">
                <div>
                  <p>Package Amount</p>
                  <strong>{formatPKR(getPackagePrice(selectedPackage))}</strong>
                </div>

                <div>
                  <p>Account Title</p>
                  <strong>{showValue(paymentSettings.account_title)}</strong>
                </div>

                <div>
                  <p>Easypaisa Number</p>
                  <strong>{showValue(paymentSettings.easypaisa_number)}</strong>
                </div>

                <div>
                  <p>JazzCash Number</p>
                  <strong>{showValue(paymentSettings.jazzcash_number)}</strong>
                </div>

                <div>
                  <p>Bank Name</p>
                  <strong>{showValue(paymentSettings.bank_name)}</strong>
                </div>

                <div>
                  <p>Bank Account Number</p>
                  <strong>
                    {showValue(paymentSettings.bank_account_number)}
                  </strong>
                </div>

                <div>
                  <p>IBAN</p>
                  <strong>{showValue(paymentSettings.iban)}</strong>
                </div>
              </div>

              <p className="depositNote">{showValue(paymentSettings.note)}</p>
            </div>

            <label>
              Payment Method
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="Easypaisa">Easypaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </label>

            <label>
              Transaction ID
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction / reference ID"
                required
              />
            </label>

            <label>
              Upload Payment Screenshot
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                required
              />
            </label>

            {proofFile && (
              <div className="selectedFileBox">
                Selected file: <strong>{proofFile.name}</strong>
              </div>
            )}

            <button className="btn loginSubmitBtn" disabled={submitLoading}>
              {submitLoading ? 'Submitting...' : 'Submit Payment Proof'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

