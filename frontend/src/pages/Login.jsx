import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api/client.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(form.email.trim(), form.password);

      if (loggedInUser?.role === 'admin') {
        navigate('/admin/payments');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage loginPage">
      <section className="authShell">
        <div className="authSide">
          <span className="authBadge">BMS EarnHub</span>

          <h1>Welcome back</h1>

          <p>
            Login to manage your tasks, wallet, package activation, and
            withdrawal requests.
          </p>

          <div className="authFeatureList">
            <div>
              <strong>Secure Login</strong>
              <span>Protected user and admin dashboard access</span>
            </div>

            <div>
              <strong>Wallet Access</strong>
              <span>Check balance and transaction records</span>
            </div>

            <div>
              <strong>Task Earnings</strong>
              <span>Complete approved tasks and track rewards</span>
            </div>
          </div>
        </div>

        <form className="authCard loginCard" onSubmit={submit}>
          <div className="authHeader">
            <h2>Login</h2>
            <p>Enter your account details to continue.</p>
          </div>

          {error && <div className="alert error">{error}</div>}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <button className="btn loginSubmitBtn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="authBottomText">
            No account? <Link to="/register">Create account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

