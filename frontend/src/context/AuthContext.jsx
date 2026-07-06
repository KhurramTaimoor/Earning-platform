import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('bms_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('bms_user', JSON.stringify(res.data.user));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function saveSession(userData, token) {
    localStorage.setItem('bms_token', token);
    localStorage.setItem('bms_user', JSON.stringify(userData));
    setUser(userData);
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    saveSession(res.data.user, res.data.token);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    saveSession(res.data.user, res.data.token);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('bms_token');
    localStorage.removeItem('bms_user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
