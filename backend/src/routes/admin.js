import express from 'express';
import { supabase } from '../config/supabase.js';
import { ok, fail, startOfTodayISO, toNumber } from '../utils/api.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getWalletSummary } from '../utils/wallet.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [{ count: totalUsers }, { count: activeUsers }, { count: pendingPayments }, { count: pendingWithdrawals }, { count: pendingSubmissions }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('status', 'active'),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    const { data: approvedPayments, error: payError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'approved');
    if (payError) throw payError;

    const { data: paidWithdrawals, error: wdError } = await supabase
      .from('withdrawals')
      .select('amount')
      .eq('status', 'paid');
    if (wdError) throw wdError;

    const totalInvestment = (approvedPayments || []).reduce((sum, p) => sum + toNumber(p.amount), 0);
    const totalWithdrawals = (paidWithdrawals || []).reduce((sum, w) => sum + toNumber(w.amount), 0);
    const platformGross = totalInvestment - totalWithdrawals;

    return ok(res, {
      stats: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        pendingPayments: pendingPayments || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        pendingSubmissions: pendingSubmissions || 0,
        totalInvestment,
        totalWithdrawals,
        platformGross
      }
    });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(res, { users: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) return fail(res, 400, 'Invalid status');

    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select('id, name, email, phone, role, status, created_at')
      .single();

    if (error) throw error;
    return ok(res, { user: data }, 'User status updated');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/packages', async (req, res) => {
  try {
    const { data, error } = await supabase.from('packages').select('*').order('price', { ascending: true });
    if (error) throw error;
    return ok(res, { packages: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.post('/packages', async (req, res) => {
  try {
    const { name, price, daily_earning_limit, task_limit, description, status } = req.body;
    if (!name || !price) return fail(res, 400, 'Name and price are required');

    const { data, error } = await supabase
      .from('packages')
      .insert({ name, price, daily_earning_limit, task_limit, description, status: status || 'active' })
      .select('*')
      .single();

    if (error) throw error;
    return ok(res, { package: data }, 'Package created');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.patch('/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'price', 'daily_earning_limit', 'task_limit', 'description', 'status'];
    const payload = {};
    for (const key of allowed) if (key in req.body) payload[key] = req.body[key];

    const { data, error } = await supabase
      .from('packages')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return ok(res, { package: data }, 'Package updated');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/payments', async (req, res) => {
  try {
    const status = req.query.status;
    let query = supabase
      .from('payments')
      .select('*, user:profiles(id,name,email,phone), package:packages(*)')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return ok(res, { payments: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.patch('/payments/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    if (!['approved', 'rejected'].includes(status)) return fail(res, 400, 'Invalid status');

    const { data: payment, error: getError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    if (getError || !payment) return fail(res, 404, 'Payment not found');
    if (payment.status !== 'pending') return fail(res, 400, 'Payment already reviewed');

    const { data: updated, error } = await supabase
      .from('payments')
      .update({ status, admin_note, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, user:profiles(id,name,email,phone), package:packages(*)')
      .single();
    if (error) throw error;

    if (status === 'approved') {
      await supabase
        .from('user_packages')
        .update({ status: 'expired' })
        .eq('user_id', payment.user_id)
        .eq('status', 'active');

      const { error: upError } = await supabase.from('user_packages').insert({
        user_id: payment.user_id,
        package_id: payment.package_id,
        payment_id: payment.id,
        status: 'active'
      });
      if (upError) throw upError;
    }

    return ok(res, { payment: updated }, `Payment ${status}`);
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return ok(res, { tasks: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { title, description, task_type, reward_amount, proof_required, link_url, status } = req.body;
    if (!title || !description || !reward_amount) return fail(res, 400, 'Title, description, and reward amount are required');

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, description, task_type, reward_amount, proof_required, link_url, status: status || 'active' })
      .select('*')
      .single();

    if (error) throw error;
    return ok(res, { task: data }, 'Task created');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['title', 'description', 'task_type', 'reward_amount', 'proof_required', 'link_url', 'status'];
    const payload = {};
    for (const key of allowed) if (key in req.body) payload[key] = req.body[key];

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return ok(res, { task: data }, 'Task updated');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/submissions', async (req, res) => {
  try {
    const status = req.query.status;
    let query = supabase
      .from('task_submissions')
      .select('*, user:profiles(id,name,email,phone), task:tasks(*)')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return ok(res, { submissions: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

async function getActivePackage(userId) {
  const { data, error } = await supabase
    .from('user_packages')
    .select('*, package:packages(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('activated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

router.patch('/submissions/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    if (!['approved', 'rejected'].includes(status)) return fail(res, 400, 'Invalid status');

    const { data: submission, error: getError } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('id', id)
      .single();
    if (getError || !submission) return fail(res, 404, 'Submission not found');
    if (submission.status !== 'pending') return fail(res, 400, 'Submission already reviewed');

    if (status === 'approved') {
      const activePackage = await getActivePackage(submission.user_id);
      if (!activePackage) return fail(res, 403, 'User has no active package');

      const { data: todayCredits, error: creditError } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('user_id', submission.user_id)
        .eq('type', 'credit')
        .eq('source', 'task')
        .gte('created_at', startOfTodayISO());
      if (creditError) throw creditError;

      const todayEarned = (todayCredits || []).reduce((sum, t) => sum + toNumber(t.amount), 0);
      const dailyLimit = toNumber(activePackage.package.daily_earning_limit);
      const allowedReward = Math.min(toNumber(submission.reward_amount), Math.max(0, dailyLimit - todayEarned));

      if (allowedReward <= 0) return fail(res, 403, 'User daily earning limit is already reached');

      const { error: walletError } = await supabase.from('wallet_transactions').insert({
        user_id: submission.user_id,
        type: 'credit',
        amount: allowedReward,
        source: 'task',
        reference_id: submission.id,
        description: 'Task reward approved by admin'
      });
      if (walletError) throw walletError;
    }

    const { data: updated, error } = await supabase
      .from('task_submissions')
      .update({ status, admin_note, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, user:profiles(id,name,email,phone), task:tasks(*)')
      .single();
    if (error) throw error;

    return ok(res, { submission: updated }, `Submission ${status}`);
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/withdrawals', async (req, res) => {
  try {
    const status = req.query.status;
    let query = supabase
      .from('withdrawals')
      .select('*, user:profiles(id,name,email,phone)')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return ok(res, { withdrawals: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.patch('/withdrawals/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    if (!['paid', 'rejected'].includes(status)) return fail(res, 400, 'Invalid status');

    const { data: withdrawal, error: getError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', id)
      .single();
    if (getError || !withdrawal) return fail(res, 404, 'Withdrawal not found');
    if (withdrawal.status !== 'pending') return fail(res, 400, 'Withdrawal already reviewed');

    if (status === 'paid') {
      const wallet = await getWalletSummary(withdrawal.user_id);
      if (toNumber(withdrawal.amount) > wallet.balance) return fail(res, 400, 'User wallet balance is insufficient');

      const { error: walletError } = await supabase.from('wallet_transactions').insert({
        user_id: withdrawal.user_id,
        type: 'debit',
        amount: withdrawal.amount,
        source: 'withdrawal',
        reference_id: withdrawal.id,
        description: 'Withdrawal paid by admin'
      });
      if (walletError) throw walletError;
    }

    const { data: updated, error } = await supabase
      .from('withdrawals')
      .update({ status, admin_note, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, user:profiles(id,name,email,phone)')
      .single();
    if (error) throw error;

    return ok(res, { withdrawal: updated }, `Withdrawal ${status}`);
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

export default router;
