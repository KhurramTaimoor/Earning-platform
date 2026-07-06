import React, { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client.js';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { const res = await api.get('/admin/submissions'); setSubmissions(res.data.submissions); }

  async function review(id, status) {
    setMsg(''); setError('');
    try { const res = await api.patch(`/admin/submissions/${id}/review`, { status }); setMsg(res.data.message); await load(); }
    catch (err) { setError(errorMessage(err)); }
  }

  return <main className="page"><div className="pageHeader"><div><h1>Task Submissions</h1><p>Approve valid task proofs to credit user wallet.</p></div></div>{msg && <div className="alert success">{msg}</div>}{error && <div className="alert error">{error}</div>}
    <section className="card tableCard"><table><thead><tr><th>User</th><th>Task</th><th>Proof</th><th>Reward</th><th>Status</th><th>Action</th></tr></thead><tbody>{submissions.map((s)=><tr key={s.id}><td>{s.user?.name}<br/><small>{s.user?.email}</small></td><td>{s.task?.title}</td><td>{s.proof_url ? <a href={s.proof_url} target="_blank" rel="noreferrer">View</a> : s.proof_text || 'N/A'}</td><td>PKR {s.reward_amount}</td><td><span className={`badge ${s.status}`}>{s.status}</span></td><td>{s.status==='pending'?<div className="actions"><button className="btn small" onClick={()=>review(s.id,'approved')}>Approve</button><button className="btn danger small" onClick={()=>review(s.id,'rejected')}>Reject</button></div>:'-'}</td></tr>)}</tbody></table></section>
  </main>;
}


