import express from 'express';
import { supabase } from '../config/supabase.js';
import { ok, fail } from '../utils/api.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import { uploadFile } from '../utils/upload.js';

const router = express.Router();

router.post('/', requireAuth, upload.single('screenshot'), async (req, res) => {
  try {
    const { package_id, payment_method, transaction_id } = req.body;

    if (!package_id || !payment_method) {
      return fail(res, 400, 'Package and payment method are required');
    }

    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', package_id)
      .eq('status', 'active')
      .single();

    if (pkgError || !pkg) return fail(res, 404, 'Package not found');

    const screenshotUrl = await uploadFile(req.file, 'payment-proofs');

    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: req.user.id,
        package_id,
        amount: pkg.price,
        payment_method,
        transaction_id,
        screenshot_url: screenshotUrl,
        status: 'pending'
      })
      .select('*, package:packages(*)')
      .single();

    if (error) throw error;
    return ok(res, { payment: data }, 'Payment proof submitted for admin approval');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, package:packages(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(res, { payments: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

export default router;
