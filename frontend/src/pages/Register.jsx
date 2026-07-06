import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api/client.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage loginPage">
      <section className="authShell signupShell">
        <div className="authSide signupSide">
          <span className="authBadge">Join BMS EarnHub</span>

          <h1>Create your account</h1>

          <p>
            Register your account, activate a package, complete approved tasks,
            and manage your wallet from one secure dashboard.
          </p>

          <div className="authFeatureList">
            <div>
              <strong>Package Activation</strong>
              <span>Choose a tier and unlock daily task opportunities</span>
            </div>

            <div>
              <strong>Task Earnings</strong>
              <span>Complete ads and simple tasks after approval</span>
            </div>

            <div>
              <strong>Daily Withdrawals</strong>
              <span>Request withdrawal once per day from your wallet</span>
            </div>
          </div>
        </div>

        <form className="authCard loginCard signupCard" onSubmit={submit}>
          <div className="authHeader">
            <h2>Register</h2>
            <p>Create your BMS EarnHub account to continue.</p>
          </div>

          {error && <div className="alert error">{error}</div>}

          <label>
            Full Name
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </label>

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
            Phone Number
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="03XX XXXXXXX"
              autoComplete="tel"
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
              placeholder="Create a strong password"
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>

          <button className="btn loginSubmitBtn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="authBottomText">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

