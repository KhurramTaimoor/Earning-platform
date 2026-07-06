import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const rawUser =
      localStorage.getItem('bms_user') ||
      localStorage.getItem('user') ||
      localStorage.getItem('authUser');

    return rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    return null;
  }
}

function getStoredToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('bms_token') ||
    ''
  );
}

function saveAuth(user, token) {
  if (user) {
    localStorage.setItem('bms_user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
  }

  if (token) {
    localStorage.setItem('bms_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
  }
}

function clearAuth() {
  localStorage.removeItem('bms_user');
  localStorage.removeItem('user');
  localStorage.removeItem('authUser');

  localStorage.removeItem('bms_token');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('accessToken');
}

function pickUser(payload) {
  return (
    payload?.user ||
    payload?.profile ||
    payload?.data?.user ||
    payload?.data?.profile ||
    payload?.data?.data?.user ||
    payload?.result?.user ||
    payload?.result?.profile ||
    null
  );
}

function pickToken(payload) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.access_token ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.data?.access_token ||
    payload?.result?.token ||
    payload?.result?.accessToken ||
    ''
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = getStoredUser();
    const savedToken = getStoredToken();

    if (savedUser) setUser(savedUser);
    if (savedToken) setToken(savedToken);
  }, []);

  async function login(email, password) {
    setLoading(true);

    try {
      const payload = await api.post('/auth/login', {
        email,
        password,
      });

      const loggedInUser = pickUser(payload);
      const authToken = pickToken(payload);

      if (!loggedInUser) {
        console.log('Login API response:', payload);
        throw new Error('Login response user not found. Check backend login response.');
      }

      setUser(loggedInUser);
      setToken(authToken || '');

      saveAuth(loggedInUser, authToken);

      return loggedInUser;
    } finally {
      setLoading(false);
    }
  }

  async function register(formData) {
    setLoading(true);

    try {
      const payload = await api.post('/auth/register', formData);

      const registeredUser = pickUser(payload);
      const authToken = pickToken(payload);

      if (registeredUser) {
        setUser(registeredUser);
        setToken(authToken || '');
        saveAuth(registeredUser, authToken);
      }

      return payload;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken('');
    clearAuth();
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem('bms_user', JSON.stringify(nextUser));
    localStorage.setItem('user', JSON.stringify(nextUser));
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
