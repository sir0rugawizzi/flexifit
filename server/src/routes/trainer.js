// server/src/routes/trainer.js
// Trainer SaaS dashboard endpoints

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('trainer'));

// 1. GET /api/trainer/clients — Client list with compliance flags and summary metrics
router.get('/clients', async (req, res) => {
  try {
    const clients = await req.app.locals.db.getTrainerClients(req.user.id);
    const summary = {
      total: clients.length,
      on_track: clients.filter((c) => c.flag_status === 'on_track').length,
      needs_attention: clients.filter((c) => c.flag_status === 'needs_attention').length,
      non_compliant: clients.filter((c) => c.flag_status === 'non_compliant').length,
    };
    res.json({ summary, clients });
  } catch (err) {
    console.error('Get trainer clients error:', err);
    res.status(500).json({ error: 'Failed to retrieve clients: ' + err.message });
  }
});

// 2. GET /api/trainer/clients/:id — Full client dossier
router.get('/clients/:id', async (req, res) => {
  try {
    const client = await req.app.locals.db.getClientDetail(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found.' });
    res.json({ client });
  } catch (err) {
    console.error('Get client detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve client detail: ' + err.message });
  }
});

// 3. GET /api/trainer/business-stats — Active clients, current MRR, 8 vs 60 scaling story
router.get('/business-stats', async (req, res) => {
  try {
    const stats = await req.app.locals.db.getBusinessStats(req.user.id);
    res.json({ stats });
  } catch (err) {
    console.error('Business stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve business stats: ' + err.message });
  }
});

// 4. PUT /api/trainer/profile — Update WhatsApp number, Google Meet / Zoom link
router.put('/profile', async (req, res) => {
  try {
    const { bio, whatsapp_number, call_channel, call_link, monthly_rate_ugx } = req.body;
    const updated = await req.app.locals.db.updateTrainerProfile(req.user.id, {
      bio,
      whatsapp_number,
      call_channel,
      call_link,
      monthly_rate_ugx,
    });
    res.json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

// 5. GET /api/trainer/call-requests — Call requests from clients
router.get('/call-requests', async (req, res) => {
  try {
    const requests = await req.app.locals.db.getCallRequests(req.user.id);
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get call requests: ' + err.message });
  }
});

export default router;
