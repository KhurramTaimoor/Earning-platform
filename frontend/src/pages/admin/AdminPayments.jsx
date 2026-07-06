import React, { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client.js';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await api.get('/admin/payments');
    setPayments(res.data.payments);
  }

  async function review(id, status) {
    setMsg(''); setError('');
    try {
      const res = await api.patch(`/admin/payments/${id}/review`, { status });
      setMsg(res.data.message);
      await load();
    } catch (err) { setError(errorMessage(err)); }
  }

  return (
    <main className="page">
      <div className="pageHeader"><div><h1>Admin Payments</h1><p>Approve package payments and activate user tiers.</p></div></div>
      {msg && <div className="alert success">{msg}</div>}{error && <div className="alert error">{error}</div>}
      <section className="card tableCard"><table><thead><tr><th>User</th><th>Package</th><th>Amount</th><th>Method</th><th>Proof</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {payments.map((p) => <tr key={p.id}><td>{p.user?.name}<br/><small>{p.user?.email}</small></td><td>{p.package?.name}</td><td>PKR {p.amount}</td><td>{p.payment_method}<br/><small>{p.transaction_id}</small></td><td>{p.screenshot_url ? <a href={p.screenshot_url} target="_blank" rel="noreferrer">View</a> : 'N/A'}</td><td><span className={`badge ${p.status}`}>{p.status}</span></td><td>{p.status === 'pending' ? <div className="actions"><button className="btn small" onClick={() => review(p.id, 'approved')}>Approve</button><button className="btn danger small" onClick={() => review(p.id, 'rejected')}>Reject</button></div> : '-'}</td></tr>)}
      </tbody></table></section>
    </main>
  );
}
