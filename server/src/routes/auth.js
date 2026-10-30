// server/src/routes/auth.js
// Authentication and Registration
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 1. POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, bio, goal_type, country_code, region, inviteCode } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await req.app.locals.db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    let trainerId = null;
    if (role === 'client') {
      if (!inviteCode) {
        return res.status(400).json({ error: 'An invite code from your trainer is required to register as a client.' });
      }
      trainerId = await req.app.locals.db.findTrainerByInviteCode(inviteCode);
      if (!trainerId) {
        return res.status(400).json({ error: 'Invalid trainer invite code.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await req.app.locals.db.createUser({
      email,
      password_hash,
      role: role === 'trainer' ? 'trainer' : 'client',
      name,
      phone,
      bio,
      goal_type: goal_type || 'weight_loss',
      country_code: country_code || 'UG',
      region: region || 'Kampala / Central',
      trainer_id: trainerId,
    });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        country_code: user.country_code,
        region: user.region,
        trainer_profile: user.trainer_profile,
        client_profile: user.client_profile,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
});

// 2. POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await req.app.locals.db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const fullUser = await req.app.locals.db.getUserById(user.id);
    const token = generateToken(fullUser);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        country_code: fullUser.country_code,
        region: fullUser.region,
        trainer_profile: fullUser.trainer_profile,
        client_profile: fullUser.client_profile,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. ' + err.message });
  }
});

// 3. POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Both old and new passwords are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const user = await req.app.locals.db.getUserById(req.user.id);
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await req.app.locals.db.updatePassword(req.user.id, newHash);

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Password update failed. ' + err.message });
  }
});

// 4. GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      phone: req.user.phone,
      country_code: req.user.country_code,
      region: req.user.region,
      trainer_profile: req.user.trainer_profile,
      client_profile: req.user.client_profile,
    },
  });
});

export default router;
