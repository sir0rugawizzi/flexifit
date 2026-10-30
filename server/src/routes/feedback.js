// server/src/routes/feedback.js
// Route for handling client feedback submissions
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/feedback/submit
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'A rating between 1 and 5 is required.' });
    }

    // For the pilot, we'll log feedback to the server console.
    // In a full production app, this would be saved to a 'feedback' table in the DB.
    console.log('--- 🌟 NEW FEEDBACK RECEIVED ---');
    console.log(`User ID: ${userId}`);
    console.log(`Rating: ${rating}/5`);
    console.log(`Comment: ${comment || 'No comment provided'}`);
    console.log('-------------------------------');

    res.json({ message: 'Thank you for your feedback! It helps us improve FlexiFit.' });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

export default router;
