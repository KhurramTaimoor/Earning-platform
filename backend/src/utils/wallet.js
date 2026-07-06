import { supabase } from '../config/supabase.js';
import { toNumber } from './api.js';

export async function getWalletSummary(userId) {
  const { data: txns, error: txnError } = await supabase
    .from('wallet_transactions')
    .select('type, amount')
    .eq('user_id', userId);

  if (txnError) throw txnError;

  const credits = (txns || [])
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + toNumber(t.amount), 0);

  const debits = (txns || [])
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + toNumber(t.amount), 0);

  const { data: pendingWithdrawals, error: pendingError } = await supabase
    .from('withdrawals')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (pendingError) throw pendingError;

  const pending = (pendingWithdrawals || []).reduce((sum, w) => sum + toNumber(w.amount), 0);
  const balance = credits - debits;
  const available = balance - pending;

  return {
    credits,
    debits,
    pendingWithdrawals: pending,
    balance,
    availableBalance: Math.max(0, available)
  };
}
