import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { ok, fail } from '../utils/api.js';
import { requireAuth } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return fail(res, 400, 'Name, email, and password are required');
    }
    if (String(password).length < 6) {
      return fail(res, 400, 'Password must be at least 6 characters');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordHash = hashPassword(password);

    const { data, error } = await supabase
      .from('profiles')
      .insert({ name, email: normalizedEmail, phone, password_hash: passwordHash, role: 'user' })
      .select('id, name, email, phone, role, status, created_at')
      .single();

    if (error) {
      if (error.code === '23505') return fail(res, 409, 'Email already exists');
      throw error;
    }

    const token = signToken(data);
    return ok(res, { user: data, token }, 'Account created');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, 400, 'Email and password are required');

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error || !user) return fail(res, 401, 'Invalid email or password');
    if (user.status === 'blocked') return fail(res, 403, 'Your account is blocked');

    const match = verifyPassword(password, user.password_hash);
    if (!match) return fail(res, 401, 'Invalid email or password');

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    };

    const token = signToken(user);
    return ok(res, { user: safeUser, token }, 'Logged in');
  } catch (error) {
    return fail(res, 500, error.message);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  return ok(res, { user: req.user });
});

export default router;
