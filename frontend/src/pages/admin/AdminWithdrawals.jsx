import React, { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client.js';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { const res = await api.get('/admin/withdrawals'); setWithdrawals(res.data.withdrawals); }

  async function review(id, status) {
    setMsg(''); setError('');
    try { const res = await api.patch(`/admin/withdrawals/${id}/review`, { status }); setMsg(res.data.message); await load(); }
    catch (err) { setError(errorMessage(err)); }
  }

  return <main className="page"><div className="pageHeader"><div><h1>Admin Withdrawals</h1><p>Pay or reject withdrawal requests.</p></div></div>{msg && <div className="alert success">{msg}</div>}{error && <div className="alert error">{error}</div>}
    <section className="card tableCard"><table><thead><tr><th>User</th><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Action</th></tr></thead><tbody>{withdrawals.map((w)=><tr key={w.id}><td>{w.user?.name}<br/><small>{w.user?.email}</small></td><td>PKR {w.amount}</td><td>{w.method}</td><td>{w.account_title}<br/><small>{w.account_number}</small></td><td><span className={`badge ${w.status}`}>{w.status}</span></td><td>{w.status==='pending'?<div className="actions"><button className="btn small" onClick={()=>review(w.id,'paid')}>Mark Paid</button><button className="btn danger small" onClick={()=>review(w.id,'rejected')}>Reject</button></div>:'-'}</td></tr>)}</tbody></table></section>
  </main>;
}


