import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Packages from './pages/Packages.jsx';
import Tasks from './pages/Tasks.jsx';
import Wallet from './pages/Wallet.jsx';
import Withdrawals from './pages/Withdrawals.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminTasks from './pages/admin/AdminTasks.jsx';
import AdminSubmissions from './pages/admin/AdminSubmissions.jsx';
import AdminWithdrawals from './pages/admin/AdminWithdrawals.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminPackages from './pages/admin/AdminPackages.jsx';
import AdminPaymentSettings from './pages/admin/AdminPaymentSettings.jsx';
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/withdrawals" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/packages" element={<ProtectedRoute adminOnly><AdminPackages /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/tasks" element={<ProtectedRoute adminOnly><AdminTasks /></ProtectedRoute>} />
        <Route path="/admin/submissions" element={<ProtectedRoute adminOnly><AdminSubmissions /></ProtectedRoute>} />
        <Route path="/admin/withdrawals" element={<ProtectedRoute adminOnly><AdminWithdrawals /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
      </Routes>
    </>
  );
}
