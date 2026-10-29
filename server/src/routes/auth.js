// server/src/routes/auth.js
// Authentication, Registration, and Instant Demo Mode Login

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
      is_demo: user.is_demo || 0,
    },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 1. POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, bio, goal_type, country_code, region } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await req.app.locals.db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
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
        is_demo: fullUser.is_demo,
        trainer_profile: fullUser.trainer_profile,
        client_profile: fullUser.client_profile,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. ' + err.message });
  }
});

// 3. POST /api/auth/demo-login
// Fast 1-click login as seeded accounts for class walkthroughs
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'trainer', clientId } = req.body;

    let targetEmail;
    if (role === 'trainer') {
      targetEmail = 'brian@flexifit.ug';
    } else {
      targetEmail = clientId ? undefined : 'akello@flexifit.ug';
    }

    let user;
    if (clientId) {
      user = await req.app.locals.db.getUserById(clientId);
    } else {
      user = await req.app.locals.db.getUserByEmail(targetEmail);
    }

    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Ensure demo seeds are loaded.' });
    }

    const fullUser = await req.app.locals.db.getUserById(user.id);
    const token = generateToken(fullUser);

    res.json({
      message: `Demo logged in as ${fullUser.role}: ${fullUser.name}`,
      token,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        country_code: fullUser.country_code,
        region: fullUser.region,
        is_demo: 1,
        trainer_profile: fullUser.trainer_profile,
        client_profile: fullUser.client_profile,
      },
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Demo login failed: ' + err.message });
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
      is_demo: req.user.is_demo,
      trainer_profile: req.user.trainer_profile,
      client_profile: req.user.client_profile,
    },
  });
});

export default router;
