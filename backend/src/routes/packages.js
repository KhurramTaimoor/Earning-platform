import express from 'express';
import { supabase } from '../config/supabase.js';
import { ok, fail } from '../utils/api.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('status', 'active')
      .order('price', { ascending: true });

    if (error) throw error;
    return ok(res, { packages: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/active-user-package', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_packages')
      .select('*, package:packages(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .order('activated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return ok(res, { activePackage: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

export default router;
