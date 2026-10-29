// server/src/routes/plans.js
// Workout and Meal Plan management & client assignment

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// ── Workout Plans ───────────────────────────────────────────
router.get('/workouts', async (req, res) => {
  try {
    const trainerId = req.user.role === 'trainer' ? req.user.id : (req.user.client_profile?.trainer_id || 'user_trainer_brian');
    const plans = await req.app.locals.db.getWorkoutPlans(trainerId);
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get workout plans: ' + err.message });
  }
});

router.post('/workouts', requireRole('trainer'), async (req, res) => {
  try {
    const { name, description, days_per_week, exercises } = req.body;
    if (!name) return res.status(400).json({ error: 'Plan name is required.' });

    const plan = await req.app.locals.db.createWorkoutPlan({
      trainer_id: req.user.id,
      name,
      description,
      days_per_week: days_per_week || 4,
      exercises: exercises || [],
    });

    res.status(201).json({ message: 'Workout plan created', plan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workout plan: ' + err.message });
  }
});

router.post('/workouts/assign', requireRole('trainer'), async (req, res) => {
  try {
    const { client_id, plan_id } = req.body;
    if (!client_id || !plan_id) {
      return res.status(400).json({ error: 'Client ID and Plan ID are required.' });
    }
    const result = await req.app.locals.db.assignWorkoutPlan(client_id, plan_id);
    res.json({ message: 'Workout plan assigned', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign workout plan: ' + err.message });
  }
});

// ── Meal Plans ──────────────────────────────────────────────
router.get('/meals', async (req, res) => {
  try {
    const trainerId = req.user.role === 'trainer' ? req.user.id : (req.user.client_profile?.trainer_id || 'user_trainer_brian');
    const plans = await req.app.locals.db.getMealPlans(trainerId);
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get meal plans: ' + err.message });
  }
});

router.post('/meals', requireRole('trainer'), async (req, res) => {
  try {
    const { name, description, items } = req.body;
    if (!name) return res.status(400).json({ error: 'Plan name is required.' });

    const plan = await req.app.locals.db.createMealPlan({
      trainer_id: req.user.id,
      name,
      description,
      items: items || [],
    });

    res.status(201).json({ message: 'Meal plan created', plan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create meal plan: ' + err.message });
  }
});

router.post('/meals/assign', requireRole('trainer'), async (req, res) => {
  try {
    const { client_id, plan_id } = req.body;
    if (!client_id || !plan_id) {
      return res.status(400).json({ error: 'Client ID and Plan ID are required.' });
    }
    const result = await req.app.locals.db.assignMealPlan(client_id, plan_id);
    res.json({ message: 'Meal plan assigned', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign meal plan: ' + err.message });
  }
});

export default router;
