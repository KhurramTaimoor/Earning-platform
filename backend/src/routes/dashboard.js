import express from 'express';
import { supabase } from '../config/supabase.js';
import { ok, fail, startOfTodayISO, toNumber } from '../utils/api.js';
import { requireAuth } from '../middleware/auth.js';
import { getWalletSummary } from '../utils/wallet.js';

const router = express.Router();

router.get('/user', requireAuth, async (req, res) => {
  try {
    const wallet = await getWalletSummary(req.user.id);

    const { data: activePackage, error: pkgError } = await supabase
      .from('user_packages')
      .select('*, package:packages(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .order('activated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pkgError) throw pkgError;

    const { data: todayTaskCredits, error: creditError } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('user_id', req.user.id)
      .eq('source', 'task')
      .eq('type', 'credit')
      .gte('created_at', startOfTodayISO());

    if (creditError) throw creditError;

    const todayEarnings = (todayTaskCredits || []).reduce((sum, item) => sum + toNumber(item.amount), 0);
    const dailyLimit = toNumber(activePackage?.package?.daily_earning_limit || 0);

    const { count: pendingPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('status', 'pending');

    const { count: pendingSubmissions } = await supabase
      .from('task_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('status', 'pending');

    return ok(res, {
      wallet,
      activePackage,
      todayEarnings,
      dailyLimit,
      remainingToday: Math.max(0, dailyLimit - todayEarnings),
      pendingPayments: pendingPayments || 0,
      pendingSubmissions: pendingSubmissions || 0
    });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/wallet', requireAuth, async (req, res) => {
  try {
    const wallet = await getWalletSummary(req.user.id);

    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(res, { wallet, transactions });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

export default router;
