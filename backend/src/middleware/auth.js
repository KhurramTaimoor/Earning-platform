import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { fail } from '../utils/api.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return fail(res, 401, 'Authentication token required');

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, status, created_at')
      .eq('id', payload.id)
      .single();

    if (error || !user) return fail(res, 401, 'Invalid session');
    if (user.status === 'blocked') return fail(res, 403, 'Your account is blocked');

    req.user = user;
    next();
  } catch (error) {
    return fail(res, 401, 'Invalid or expired token');
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return fail(res, 403, 'Admin access required');
  }
  next();
}
