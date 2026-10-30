// server/src/routes/auth.js - Updated for Trainer Application flow
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// NEW: POST /api/auth/apply-trainer
// Handles trainer applications instead of direct registration
router.post('/apply-trainer', async (req, res) => {
  try {
    const { email, name, phone, certifications, experience } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const existingUser = await req.app.locals.db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const application = await req.app.locals.db.createTrainerApplication({
      email,
      name,
      phone,
      certifications,
      experience,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Application submitted successfully! Our team will review your credentials and contact you soon.'
    });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ error: 'Application failed. ' + err.message });
  }
});

// Updated: POST /api/auth/register
// Now only allows CLIENTS to register directly via invite code
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, inviteCode } = req.body;

    if (role === 'trainer') {
      return res.status(403).json({
        error: 'Trainers cannot register directly. Please use the "Apply to be a Trainer" flow.'
      });
    }

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

    if (!inviteCode) {
      return res.status(400).json({ error: 'An invite code from your trainer is required.' });
    }
    const trainerId = await req.app.locals.db.findTrainerByInviteCode(inviteCode);
    if (!trainerId) {
      return res.status(400).json({ error: 'Invalid trainer invite code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await req.app.locals.db.createUser({
      email,
      password_hash,
      role: 'client',
      name,
      phone,
      trainer_id: trainerId,
    });

    const token = generateToken(user);
    res.status(201).json({ message: 'Account created successfully', token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
});

// (Rest of the routes: login, change-password, me remain the same)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await req.app.locals.db.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const fullUser = await req.app.locals.db.getUserById(user.id);
    res.json({ token: generateToken(fullUser), user: fullUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await req.app.locals.db.getUserById(req.user.id);
    if (!(await bcrypt.compare(oldPassword, user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }
    const hash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await req.app.locals.db.updatePassword(req.user.id, hash);
    res.json({ message: 'Password updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
