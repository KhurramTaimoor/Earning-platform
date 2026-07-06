import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);
  const isAdmin = user?.role === 'admin';

  function handleLogout() {
    logout();
    closeMenu();
  }

  return (
    <header className="topbar">
      <Link
        to={isAdmin ? '/admin/payments' : user ? '/dashboard' : '/'}
        className="brand"
        onClick={closeMenu}
      >
        <span className="brandMark">BMS</span>

        <div>
          <strong>EarnHub</strong>
          <small>Pakistan Task Earning Platform</small>
        </div>
      </Link>

      <button
        className="menuBtn"
        type="button"
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`nav ${open ? 'showNav' : ''}`}>
        {!user && (
          <>
            <NavLink to="/" onClick={closeMenu}>
              Home
            </NavLink>

            <div className="navAuth">
              <NavLink to="/login" onClick={closeMenu}>
                Login
              </NavLink>

              <Link to="/register" className="navRegister" onClick={closeMenu}>
                Register
              </Link>
            </div>
          </>
        )}

        {user && !isAdmin && (
          <>
            <NavLink to="/dashboard" onClick={closeMenu}>
              Dashboard
            </NavLink>

            <NavLink to="/packages" onClick={closeMenu}>
              Packages
            </NavLink>

            <NavLink to="/tasks" onClick={closeMenu}>
              Tasks
            </NavLink>

            <NavLink to="/wallet" onClick={closeMenu}>
              Wallet
            </NavLink>

            <NavLink to="/withdrawals" onClick={closeMenu}>
              Withdrawals
            </NavLink>

            <button className="logoutBtn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {user && isAdmin && (
          <>
            <NavLink to="/admin/packages" onClick={closeMenu}>
              Manage Packages
            </NavLink>

            <NavLink to="/admin/payments" onClick={closeMenu}>
              Payments
            </NavLink>

            <NavLink to="/admin/tasks" onClick={closeMenu}>
              Manage Tasks
            </NavLink>

            <NavLink to="/admin/submissions" onClick={closeMenu}>
              Submissions
            </NavLink>

            <NavLink to="/admin/withdrawals" onClick={closeMenu}>
              Withdrawals
            </NavLink>

            <NavLink to="/admin/users" onClick={closeMenu}>
              Users
            </NavLink>

            <NavLink to="/admin/payment-settings" onClick={closeMenu}>
              Payment Settings
            </NavLink>

            <button className="logoutBtn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}