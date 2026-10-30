// server/src/routes/subscriptions.js
// Subscription payment management
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// POST /api/subscriptions/request
// Client notifies the trainer that they have made the payment outside the app
router.post('/request', async (req, res) => {
  try {
    const { provider = 'MTN_MOMO', phone_number, amount_ugx = 90000 } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required for payment verification.' });
    }

    const txId = `REF-UG-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await req.app.locals.db.createSubscription({
      client_id: req.user.id,
      provider,
      phone_number,
      amount_ugx: Number(amount_ugx),
      status: 'PENDING',
      reference_id: txId,
    });

    res.json({
      message: 'Payment request submitted. Your trainer will confirm it shortly.',
      subscription: result,
      reference_id: txId,
    });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: 'Payment request failed: ' + err.message });
  }
});

// POST /api/subscriptions/confirm
// Trainer confirms receipt of payment
router.post('/confirm', async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ error: 'Only trainers can confirm payments.' });
    }
    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required.' });
    }

    await req.app.locals.db.updateSubscriptionStatus(subscriptionId, 'APPROVED');
    res.json({ message: 'Payment confirmed and subscription activated.' });
  } catch (err) {
    console.error('Confirmation error:', err);
    res.status(500).json({ error: 'Confirmation failed: ' + err.message });
  }
});

// GET /api/subscriptions
router.get('/', async (req, res) => {
  try {
    const subscriptions = await req.app.locals.db.getSubscriptions(req.user.id);
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve subscriptions: ' + err.message });
  }
});

export default router;
