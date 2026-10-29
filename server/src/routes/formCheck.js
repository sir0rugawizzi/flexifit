// server/src/routes/formCheck.js
// Form-check video upload, Google Gemini AI vision analysis, and live pose session persistence

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { analyzeExerciseFrames } from '../services/geminiAi.js';

const router = Router();
router.use(requireAuth);

// 1. POST /api/form-checks/upload
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { exercise_name = 'Bodyweight Squats', frames } = req.body;
    let framesArray = [];

    if (frames) {
      try {
        framesArray = typeof frames === 'string' ? JSON.parse(frames) : frames;
      } catch (e) {
        framesArray = [frames];
      }
    }

    const videoPath = req.file ? `/uploads/${req.file.filename}` : '/uploads/demo-squat.mp4';

    // Call Gemini AI analysis (with bulletproof sample fallback)
    const aiResult = await analyzeExerciseFrames(exercise_name, framesArray);

    // Save record to DB
    const dbResult = await req.app.locals.db.createFormCheck({
      client_id: req.user.id,
      exercise_name,
      video_path: videoPath,
      ai_score: aiResult.overall_score || 8.0,
      ai_feedback_json: aiResult,
    });

    res.status(201).json({
      message: 'Form check analyzed and submitted',
      form_check_id: dbResult.id,
      ai_feedback: aiResult,
      video_url: videoPath,
      disclaimer: 'AI guidance is not medical advice. Stop immediately if you feel pain.',
    });
  } catch (err) {
    console.error('Form check upload error:', err);
    res.status(500).json({ error: 'Failed to process form check: ' + err.message });
  }
});

// 2. GET /api/form-checks/:clientId
router.get('/:clientId', async (req, res) => {
  try {
    const checks = await req.app.locals.db.getFormChecks(req.params.clientId);
    res.json({ form_checks: checks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve form checks: ' + err.message });
  }
});

// 3. PUT /api/form-checks/:id/feedback
router.put('/:id/feedback', async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!feedback) return res.status(400).json({ error: 'Feedback text is required.' });
    await req.app.locals.db.updateFormCheckTrainerFeedback(req.params.id, feedback);
    res.json({ message: 'Trainer feedback saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save trainer feedback: ' + err.message });
  }
});

// 4. POST /api/pose/sessions (Live on-device pose session summary)
router.post('/pose-session', async (req, res) => {
  try {
    const { exercise_name, rep_count, duration_seconds, avg_form_score } = req.body;
    if (!exercise_name || rep_count == null) {
      return res.status(400).json({ error: 'Exercise name and rep count are required.' });
    }

    const result = await req.app.locals.db.createPoseSession({
      client_id: req.user.id,
      exercise_name,
      rep_count: Number(rep_count),
      duration_seconds: Number(duration_seconds || 60),
      avg_form_score: Number(avg_form_score || 8.0),
    });

    res.status(201).json({ message: 'Pose tracking session saved', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save pose session: ' + err.message });
  }
});

export default router;
