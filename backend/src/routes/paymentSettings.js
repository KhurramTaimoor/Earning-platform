import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { ok, fail } from '../utils/api.js';

const router = Router();

function emptyToNull(value) {
  if (value === undefined || value === null) return null;

  const cleanValue = String(value).trim();

  if (!cleanValue) return null;

  return cleanValue;
}

async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : '';

    if (!token) {
      return fail(res, 401, 'Unauthorized');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user_id || decoded.sub;

    if (!userId) {
      return fail(res, 401, 'Invalid token');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return fail(res, 400, error.message);
    }

    if (!profile || profile.role !== 'admin') {
      return fail(res, 403, 'Admin access required');
    }

    req.user = profile;
    return next();
  } catch (err) {
    return fail(res, 401, 'Unauthorized');
  }
}

/*
  Public route:
  User dashboard/modal is route se payment details read karega.
*/
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select(
        'account_title, easypaisa_number, jazzcash_number, bank_name, bank_account_number, iban, note'
      )
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      return fail(res, 400, error.message);
    }

    return ok(res, {
      account_title: data?.account_title || null,
      easypaisa_number: data?.easypaisa_number || null,
      jazzcash_number: data?.jazzcash_number || null,
      bank_name: data?.bank_name || null,
      bank_account_number: data?.bank_account_number || null,
      iban: data?.iban || null,
      note: data?.note || null,
    });
  } catch (err) {
    return fail(res, 500, err.message || 'Failed to load payment settings');
  }
});

/*
  Admin route:
  Admin apni payment details update karega.
*/
router.put('/', requireAdmin, async (req, res) => {
  try {
    const payload = {
      id: 1,
      account_title: emptyToNull(req.body.account_title),
      easypaisa_number: emptyToNull(req.body.easypaisa_number),
      jazzcash_number: emptyToNull(req.body.jazzcash_number),
      bank_name: emptyToNull(req.body.bank_name),
      bank_account_number: emptyToNull(req.body.bank_account_number),
      iban: emptyToNull(req.body.iban),
      note: emptyToNull(req.body.note),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('payment_settings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return fail(res, 400, error.message);
    }

    return ok(res, data, 'Payment settings updated successfully');
  } catch (err) {
    return fail(res, 500, err.message || 'Failed to update payment settings');
  }
});

export default router;