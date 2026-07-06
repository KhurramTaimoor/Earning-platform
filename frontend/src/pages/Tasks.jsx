import React, { useEffect, useState } from 'react';
import { api, errorMessage } from '../api/client.js';

export default function Tasks() {
  const [data, setData] = useState({ tasks: [] });
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ proof_text: '', proof: null });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const [taskRes, subRes] = await Promise.all([api.get('/tasks'), api.get('/tasks/my-submissions')]);
    setData(taskRes.data);
    setSubmissions(subRes.data.submissions);
  }

  async function submitTask(e) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const fd = new FormData();
      fd.append('proof_text', form.proof_text);
      if (form.proof) fd.append('proof', form.proof);
      const res = await api.post(`/tasks/${selected.id}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg(res.data.message);
      setSelected(null);
      setForm({ proof_text: '', proof: null });
      await load();
    } catch (err) { setError(errorMessage(err)); }
  }

  return (
    <main className="page">
      <div className="pageHeader"><div><h1>Tasks</h1><p>Complete ads/simple tasks and submit proof for reward approval.</p></div></div>
      {msg && <div className="alert success">{msg}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="card summaryBar">
        <span>Daily Limit: PKR {data.dailyLimit || 0}</span>
        <span>Approved Today: PKR {data.todayApproved || 0}</span>
        <span>Remaining Today: PKR {data.remainingToday || 0}</span>
      </div>

      {!data.activePackage && <div className="alert warning">Activate a package first before submitting tasks.</div>}

      <div className="packageGrid">
        {data.tasks.map((task) => (
          <div className="card packageCard" key={task.id}>
            <span className="badge active">{task.task_type}</span>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            {task.link_url && <a href={task.link_url} target="_blank" rel="noreferrer">Open Task Link</a>}
            <div className="price smallPrice">Reward: PKR {task.reward_amount}</div>
            <button className="btn" disabled={!data.activePackage} onClick={() => setSelected(task)}>Submit Proof</button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modalBackdrop" onClick={() => setSelected(null)}>
          <form className="modal card" onClick={(e) => e.stopPropagation()} onSubmit={submitTask}>
            <h2>Submit: {selected.title}</h2>
            <label>Proof Text / Notes<textarea value={form.proof_text} onChange={(e) => setForm({ ...form, proof_text: e.target.value })} /></label>
            <label>Proof Screenshot/PDF<input type="file" accept="image/*,application/pdf" onChange={(e) => setForm({ ...form, proof: e.target.files[0] })} /></label>
            <div className="actions"><button className="btn">Submit Task</button><button type="button" className="btn ghost" onClick={() => setSelected(null)}>Cancel</button></div>
          </form>
        </div>
      )}

      <section className="card tableCard">
        <h3>My Task Submissions</h3>
        <table><thead><tr><th>Task</th><th>Reward</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>{submissions.map((s) => <tr key={s.id}><td>{s.task?.title}</td><td>PKR {s.reward_amount}</td><td><span className={`badge ${s.status}`}>{s.status}</span></td><td>{new Date(s.created_at).toLocaleString()}</td></tr>)}</tbody>
        </table>
      </section>
    </main>
  );
}


