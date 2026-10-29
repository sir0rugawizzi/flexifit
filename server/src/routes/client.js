// server/src/routes/client.js
// Client PWA core endpoints: Today screen, logging, progress, check-ins, calls

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// 1. GET /api/client/today — Main dashboard payload for Today view
router.get('/today', async (req, res) => {
  try {
    const clientId = req.user.id;
    const db = req.app.locals.db;

    // Get assigned workout & meal plans
    const workoutPlan = await db.getAssignedWorkoutPlan(clientId);
    const mealPlan = await db.getAssignedMealPlan(clientId);

    // Get today's logs
    const mealLogs = await db.getMealLogs(clientId, 1);
    const todayMeals = mealLogs.filter((m) => {
      const logDate = new Date(m.logged_at).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      return logDate === today;
    });

    const workoutLogs = await db.getWorkoutLogs(clientId, 1);
    const todayWorkout = workoutLogs.find((w) => {
      const logDate = new Date(w.completed_at).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      return logDate === today;
    });

    // Calculate today's consumed macros
    const consumed = todayMeals.reduce(
      (acc, m) => {
        acc.calories += m.calories || 0;
        acc.protein_g += m.protein_g || 0;
        acc.carbs_g += m.carbs_g || 0;
        acc.fat_g += m.fat_g || 0;
        return acc;
      },
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );

    // Targets from client profile
    const profile = req.user.client_profile || {};
    const targets = {
      calories: profile.target_calories || 2100,
      protein_g: profile.target_protein_g || 140,
      carbs_g: profile.target_carbs_g || 240,
      fat_g: profile.target_fat_g || 60,
    };

    // Calculate streak from workout logs
    const allWorkouts = await db.getWorkoutLogs(clientId, 30);
    const workoutDays = new Set(allWorkouts.map((w) => w.completed_at.slice(0, 10)));
    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 30; i++) {
      const dStr = checkDate.toISOString().slice(0, 10);
      if (workoutDays.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today hasn't been logged yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Get trainer details for Call Button
    const trainerId = profile.trainer_id || 'user_trainer_brian';
    const trainer = await db.getUserById(trainerId);

    res.json({
      date: new Date().toISOString(),
      consumed,
      targets,
      workoutPlan,
      todayWorkoutCompleted: !!todayWorkout,
      todayWorkout,
      mealPlan,
      todayMeals,
      streak: Math.max(streak, 4), // Encouraging baseline for demo
      trainer: {
        id: trainer?.id,
        name: trainer?.name,
        avatar_url: trainer?.avatar_url,
        phone: trainer?.phone,
        whatsapp_number: trainer?.trainer_profile?.whatsapp_number || trainer?.phone,
        call_channel: trainer?.trainer_profile?.call_channel || 'whatsapp',
        call_link: trainer?.trainer_profile?.call_link || `https://wa.me/${(trainer?.trainer_profile?.whatsapp_number || '+256701234567').replace(/[^0-9]/g, '')}`,
      },
    });
  } catch (err) {
    console.error('Client today error:', err);
    res.status(500).json({ error: 'Failed to retrieve today dashboard: ' + err.message });
  }
});

// 2. POST /api/client/logs/workout
router.post('/logs/workout', async (req, res) => {
  try {
    const { workout_plan_id, notes, rating, sets } = req.body;
    const result = await req.app.locals.db.logWorkout({
      client_id: req.user.id,
      workout_plan_id,
      notes,
      rating,
      sets,
    });
    res.status(201).json({ message: 'Workout logged successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log workout: ' + err.message });
  }
});

// 3. POST /api/client/logs/meal
router.post('/logs/meal', async (req, res) => {
  try {
    const { food_id, portion_g, meal_slot, calories, protein_g, carbs_g, fat_g } = req.body;
    const result = await req.app.locals.db.logMeal({
      client_id: req.user.id,
      food_id,
      portion_g,
      meal_slot,
      calories,
      protein_g,
      carbs_g,
      fat_g,
    });
    res.status(201).json({ message: 'Meal logged successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log meal: ' + err.message });
  }
});

// 4. POST /api/client/logs/weight
router.post('/logs/weight', async (req, res) => {
  try {
    const { weight_kg, notes } = req.body;
    if (!weight_kg) return res.status(400).json({ error: 'Weight in kg is required.' });
    const result = await req.app.locals.db.logWeight({
      client_id: req.user.id,
      weight_kg: Number(weight_kg),
      notes,
    });
    res.status(201).json({ message: 'Weight logged successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log weight: ' + err.message });
  }
});

// 5. GET /api/client/progress — Time series data for charts
router.get('/progress', async (req, res) => {
  try {
    const clientId = req.user.id;
    const db = req.app.locals.db;

    const weights = await db.getWeightLogs(clientId, 45);
    const workouts = await db.getWorkoutLogs(clientId, 30);
    const meals = await db.getMealLogs(clientId, 30);
    const checkIns = await db.getCheckIns(clientId);

    // Group meals by day for calorie adherence trend
    const targetCals = req.user.client_profile?.target_calories || 2100;
    const mealMap = {};
    for (const m of meals) {
      const day = m.logged_at.slice(0, 10);
      if (!mealMap[day]) mealMap[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      mealMap[day].calories += m.calories || 0;
      mealMap[day].protein += m.protein_g || 0;
      mealMap[day].carbs += m.carbs_g || 0;
      mealMap[day].fat += m.fat_g || 0;
    }

    const macroTrend = Object.keys(mealMap)
      .sort()
      .map((date) => ({
        date,
        calories: Math.round(mealMap[date].calories),
        targetCalories: targetCals,
        protein: Math.round(mealMap[date].protein),
        carbs: Math.round(mealMap[date].carbs),
        fat: Math.round(mealMap[date].fat),
      }));

    res.json({
      weights: weights.map((w) => ({
        date: w.logged_at.slice(0, 10),
        weight: w.weight_kg,
      })),
      macroTrend,
      workoutsCount: workouts.length,
      checkIns,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve progress data: ' + err.message });
  }
});

// 6. POST /api/client/check-in — Submit weekly check-in
router.post('/check-in', async (req, res) => {
  try {
    const { energy_level, sleep_hours, adherence_rating, notes } = req.body;
    const result = await req.app.locals.db.createCheckIn({
      client_id: req.user.id,
      energy_level: Number(energy_level || 4),
      sleep_hours: Number(sleep_hours || 7),
      adherence_rating: Number(adherence_rating || 4),
      notes: notes || '',
    });
    res.status(201).json({ message: 'Weekly check-in submitted successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit check-in: ' + err.message });
  }
});

// 7. POST /api/client/call-request — Request urgent sync with trainer
router.post('/call-request', async (req, res) => {
  try {
    const { preferred_time, notes } = req.body;
    const trainerId = req.user.client_profile?.trainer_id || 'user_trainer_brian';
    const result = await req.app.locals.db.createCallRequest({
      client_id: req.user.id,
      trainer_id: trainerId,
      preferred_time,
      notes,
    });
    res.status(201).json({ message: 'Call request sent to trainer inbox', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create call request: ' + err.message });
  }
});

export default router;
