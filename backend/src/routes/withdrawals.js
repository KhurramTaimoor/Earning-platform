import express from 'express';
import { supabase } from '../config/supabase.js';
import { ok, fail, startOfTodayISO, toNumber } from '../utils/api.js';
import { requireAuth } from '../middleware/auth.js';
import { getWalletSummary } from '../utils/wallet.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { amount, method, account_title, account_number } = req.body;
    const numericAmount = toNumber(amount);
    const minWithdrawal = toNumber(process.env.MIN_WITHDRAWAL_AMOUNT || 300);

    if (!numericAmount || numericAmount < minWithdrawal) {
      return fail(res, 400, `Minimum withdrawal amount is ${minWithdrawal}`);
    }
    if (!method || !account_title || !account_number) {
      return fail(res, 400, 'Method, account title, and account number are required');
    }

    const { data: todayWithdrawal, error: todayError } = await supabase
      .from('withdrawals')
      .select('id')
      .eq('user_id', req.user.id)
      .gte('created_at', startOfTodayISO())
      .limit(1);

    if (todayError) throw todayError;
    if ((todayWithdrawal || []).length > 0) {
      return fail(res, 403, 'You can request withdrawal only once per day');
    }

    const wallet = await getWalletSummary(req.user.id);
    if (numericAmount > wallet.availableBalance) {
      return fail(res, 400, 'Insufficient available wallet balance');
    }

    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: req.user.id,
        amount: numericAmount,
        method,
        account_title,
        account_number,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) throw error;
    return ok(res, { withdrawal: data }, 'Withdrawal request submitted');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(res, { withdrawals: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

export default router;
