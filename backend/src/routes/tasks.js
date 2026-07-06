import express from 'express';
import { supabase } from '../config/supabase.js';
import { ok, fail, startOfTodayISO, toNumber } from '../utils/api.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import { uploadFile } from '../utils/upload.js';

const router = express.Router();

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

async function getTodayApprovedEarnings(userId) {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'credit')
    .eq('source', 'task')
    .gte('created_at', startOfTodayISO());
  if (error) throw error;
  return (data || []).reduce((sum, t) => sum + toNumber(t.amount), 0);
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const activePackage = await getActivePackage(req.user.id);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const todayApproved = await getTodayApprovedEarnings(req.user.id);
    const dailyLimit = activePackage?.package?.daily_earning_limit || 0;

    return ok(res, {
      activePackage,
      dailyLimit,
      todayApproved,
      remainingToday: Math.max(0, toNumber(dailyLimit) - todayApproved),
      tasks
    });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.post('/:taskId/submit', requireAuth, upload.single('proof'), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { proof_text } = req.body;

    const activePackage = await getActivePackage(req.user.id);
    if (!activePackage) return fail(res, 403, 'Please activate a package before submitting tasks');

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('status', 'active')
      .single();

    if (taskError || !task) return fail(res, 404, 'Task not found');

    const { data: todaySubmissions, error: subError } = await supabase
      .from('task_submissions')
      .select('id')
      .eq('user_id', req.user.id)
      .gte('created_at', startOfTodayISO());

    if (subError) throw subError;

    const taskLimit = toNumber(activePackage.package.task_limit);
    if ((todaySubmissions || []).length >= taskLimit) {
      return fail(res, 403, 'Your daily task submission limit has been reached');
    }

    const todayApproved = await getTodayApprovedEarnings(req.user.id);
    const dailyLimit = toNumber(activePackage.package.daily_earning_limit);
    const remaining = Math.max(0, dailyLimit - todayApproved);
    const reward = Math.min(toNumber(task.reward_amount), remaining);

    if (reward <= 0) return fail(res, 403, 'Your daily earning limit has been reached');

    const proofUrl = await uploadFile(req.file, 'task-proofs');

    const { data, error } = await supabase
      .from('task_submissions')
      .insert({
        user_id: req.user.id,
        task_id: task.id,
        proof_text,
        proof_url: proofUrl,
        reward_amount: reward,
        status: 'pending'
      })
      .select('*, task:tasks(*)')
      .single();

    if (error) throw error;
    return ok(res, { submission: data }, 'Task submitted for admin approval');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/my-submissions', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('task_submissions')
      .select('*, task:tasks(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ok(res, { submissions: data });
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

export default router;
