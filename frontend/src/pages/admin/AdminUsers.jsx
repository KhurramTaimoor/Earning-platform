import React, { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { const res = await api.get('/admin/users'); setUsers(res.data.users); }

  async function toggle(user) {
    try { await api.patch(`/admin/users/${user.id}/status`, { status: user.status === 'active' ? 'blocked' : 'active' }); await load(); }
    catch (err) { setError(errorMessage(err)); }
  }

  return <main className="page"><div className="pageHeader"><div><h1>Users</h1><p>Manage platform users.</p></div></div>{error && <div className="alert error">{error}</div>}
    <section className="card tableCard"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map((u)=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.role}</td><td><span className={`badge ${u.status}`}>{u.status}</span></td><td>{u.role==='user' && <button className="btn small secondary" onClick={()=>toggle(u)}>{u.status==='active'?'Block':'Unblock'}</button>}</td></tr>)}</tbody></table></section>
  </main>;
}
