// server/src/routes/messages.js
// Direct asynchronous messaging between client and trainer

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/messages/:otherUserId
router.get('/:otherUserId', async (req, res) => {
  try {
    const messages = await req.app.locals.db.getMessages(req.user.id, req.params.otherUserId);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve messages: ' + err.message });
  }
});

// POST /api/messages
router.post('/', async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) {
      return res.status(400).json({ error: 'Receiver ID and message content are required.' });
    }

    const result = await req.app.locals.db.createMessage({
      sender_id: req.user.id,
      receiver_id,
      content,
    });

    res.status(201).json({ message: 'Message sent', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message: ' + err.message });
  }
});

export default router;
