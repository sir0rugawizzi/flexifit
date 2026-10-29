// server/src/routes/subscriptions.js
// Simulated MTN MoMo & Airtel Money subscription payments

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// POST /api/subscriptions/simulate
router.post('/simulate', async (req, res) => {
  try {
    const { provider = 'MTN_MOMO', phone_number, amount_ugx = 90000, plan_name = 'FlexiFit Monthly Unlimited' } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required for Mobile Money simulation.' });
    }

    const txId = `UG-${provider === 'MTN_MOMO' ? 'MTN' : 'AIR'}-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await req.app.locals.db.createSubscription({
      client_id: req.user.id,
      provider,
      phone_number,
      amount_ugx: Number(amount_ugx),
      status: 'APPROVED',
      reference_id: txId,
    });

    const isMTN = provider === 'MTN_MOMO';
    const ussdMessage = isMTN
      ? `Y'ello! Enter MM PIN to approve payment of UGX ${Number(amount_ugx).toLocaleString()} to FlexiFit (Ref: ${txId})`
      : `Enter Airtel Money PIN to pay UGX ${Number(amount_ugx).toLocaleString()} to FlexiFit Ltd:`;

    const smsReceipt = isMTN
      ? `Y'ello! Trans ID ${txId}: Payment of UGX ${Number(amount_ugx).toLocaleString()} to FlexiFit was successful. Fee: UGX 0. New Balance: UGX 185,400.`
      : `Airtel Money: UGX ${Number(amount_ugx).toLocaleString()} paid to FlexiFit. TxId ${txId}. Balance: UGX 92,000.`;

    res.json({
      message: 'Mobile Money simulation approved',
      subscription: result,
      ussd_simulation: {
        provider,
        ussd_code: isMTN ? '*165#' : '*185#',
        prompt_text: ussdMessage,
        sms_receipt: smsReceipt,
        disclaimer: 'SIMULATION ONLY: No real funds were deducted.',
      },
    });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: 'Subscription simulation failed: ' + err.message });
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
