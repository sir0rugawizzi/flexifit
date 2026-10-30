// server/src/routes/admin.js
// Admin-only routes for platform management
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Middleware to ensure only a super-admin can access these routes
const requireAdmin = (req, res, next) => {
  // For the pilot, we can check if the email is your specific admin email
  // In a full version, we'd have an 'is_admin' column in the users table
  if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
    return next();
  }
  res.status(403).json({ error: 'Access denied. Admin privileges required.' });
};

// GET /api/admin/trainer-applications
router.get('/trainer-applications', requireAuth, requireAdmin, async (req, res) => {
  try {
    const applications = await req.app.locals.db.getTrainerApplications();
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications: ' + err.message });
  }
});

// PATCH /api/admin/approve-trainer/:id
router.patch('/approve-trainer/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const appId = req.params.id;
    const application = await req.app.locals.db.getApplicationById(appId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application is already processed.' });
    }

    // 1. Create the User account
    const salt = await bcrypt.genSalt(10);
    const tempPassword = `Welcome${Math.floor(1000 + Math.random() * 9000)}`;
    const password_hash = await bcrypt.hash(tempPassword, salt);

    const user = await req.app.locals.db.createUser({
      email: application.email,
      password_hash,
      role: 'trainer',
      name: application.name,
      phone: application.phone,
    });

    // 2. Create Trainer Profile
    await req.app.locals.db.createTrainerProfile({
      user_id: user.id,
      bio: `Approved Trainer - ${application.certifications}`,
      monthly_rate_ugx: 90000,
    });

    // 3. Mark application as approved
    await req.app.locals.db.updateApplicationStatus(appId, 'approved');

    res.json({
      message: 'Trainer approved and account created!',
      user: { email: user.email, tempPassword },
      note: 'In production, the temp password should be sent via email.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed: ' + err.message });
  }
});

export default router;
