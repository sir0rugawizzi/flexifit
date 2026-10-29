// server/src/db/local.js
// SQLite implementation using better-sqlite3 with auto-initialization & full demo seeding

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { DataAdapter } from './adapter.js';
import { SEED_FOODS } from '../../../db/sqlite/seeds/foods.js';
import { generateDemoSeed } from '../../../db/sqlite/seeds/demo.js';
import config from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class LocalAdapter extends DataAdapter {
  constructor(dbPath) {
    super();
    this.dbPath = dbPath || resolve(__dirname, '../../flexifit.sqlite');
    this.db = null;
  }

  async initialize() {
    console.log(`LocalAdapter: connecting to SQLite at ${this.dbPath}`);
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    // Run schema
    const schemaPath = resolve(__dirname, '../../../db/sqlite/schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    this.db.exec(schemaSql);

    // Auto-seed if foods empty
    const foodCount = this.db.prepare('SELECT COUNT(*) AS count FROM foods').get().count;
    if (foodCount === 0) {
      console.log('LocalAdapter: seeding 60+ authentic foods...');
      const insertFood = this.db.prepare(`
        INSERT INTO foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor, is_custom)
        VALUES (@id, @name, @local_name, @category, @calories, @protein_g, @carbs_g, @fat_g, @typical_serving_g, @serving_unit, @country_code, @region, @portion_descriptor, 0)
      `);
      const insertMany = this.db.transaction((foods) => {
        for (const food of foods) insertFood.run(food);
      });
      insertMany(SEED_FOODS);
    }

    // Auto-seed demo accounts and 4-week history if empty
    const userCount = this.db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    if (userCount === 0) {
      console.log('LocalAdapter: seeding Coach Brian Mukasa & 6 clients with 4 weeks history...');
      await this.seedDemoStory();
    }

    console.log('LocalAdapter: SQLite ready and verified');
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('LocalAdapter: closed SQLite connection');
    }
  }

  async seedDemoStory() {
    const { trainer, clients, daysAgo } = await generateDemoSeed();

    // Insert Trainer
    this.db.prepare(`
      INSERT INTO users (id, email, password_hash, role, name, phone, avatar_url, country_code, region, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(trainer.id, trainer.email, trainer.password_hash, trainer.role, trainer.name, trainer.phone, trainer.avatar_url, trainer.country_code, trainer.region, trainer.is_demo, trainer.created_at);

    this.db.prepare(`
      INSERT INTO trainer_profiles (user_id, bio, whatsapp_number, call_channel, call_link, monthly_rate_ugx)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(trainer.id, trainer.profile.bio, trainer.profile.whatsapp_number, trainer.profile.call_channel, trainer.profile.call_link, trainer.profile.monthly_rate_ugx);

    // Default workout plan
    const planId = 'plan_ug_calisthenics';
    this.db.prepare(`
      INSERT INTO workout_plans (id, trainer_id, name, description, days_per_week, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(planId, trainer.id, 'Kampala Executive Home Fitness', '4-day bodyweight home workout targeting metabolic burn and posture for desk workers.', 4, daysAgo(40));

    const exercises = [
      { name: 'Bodyweight Squats', group: 'Legs', sets: 4, reps: 15, rest: 60, home: 1, order: 1 },
      { name: 'Push-ups', group: 'Chest & Core', sets: 3, reps: 12, rest: 60, home: 1, order: 2 },
      { name: 'Plank Hold', group: 'Core', sets: 3, reps: 45, rest: 45, home: 1, order: 3 },
      { name: 'Walking Lunges', group: 'Legs', sets: 3, reps: 12, rest: 60, home: 1, order: 4 },
    ];
    for (const ex of exercises) {
      this.db.prepare(`
        INSERT INTO workout_plan_exercises (id, plan_id, day_of_week, exercise_name, muscle_group, target_sets, target_reps, rest_seconds, is_home_friendly, order_index)
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), planId, ex.name, ex.group, ex.sets, ex.reps, ex.rest, ex.home, ex.order);
    }

    // Default Ugandan High-Protein Meal Plan
    const mealPlanId = 'mealplan_highprotein_ug';
    this.db.prepare(`
      INSERT INTO meal_plans (id, trainer_id, name, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(mealPlanId, trainer.id, 'Kampala Clean Protein & Local Carbs', 'Balanced local meal plan pairing steamed matooke, tilapia, and beans.', daysAgo(40));

    const mealItems = [
      { slot: 'breakfast', food_id: 'food_katogo_matooke_beans', portion: 300 },
      { slot: 'lunch', food_id: 'food_matooke', portion: 200 },
      { slot: 'lunch', food_id: 'food_tilapia_boiled', portion: 180 },
      { slot: 'lunch', food_id: 'food_sukuma', portion: 100 },
      { slot: 'snack', food_id: 'food_gnut_raw', portion: 35 },
      { slot: 'dinner', food_id: 'food_beans_stewed', portion: 160 },
      { slot: 'dinner', food_id: 'food_dodo', portion: 100 },
      { slot: 'dinner', food_id: 'food_sweet_potato', portion: 150 },
    ];
    for (const item of mealItems) {
      this.db.prepare(`
        INSERT INTO meal_plan_items (id, meal_plan_id, day_of_week, meal_slot, food_id, portion_g)
        VALUES (?, ?, 1, ?, ?, ?)
      `).run(uuidv4(), mealPlanId, item.slot, item.food_id, item.portion);
    }

    // Insert Clients & History
    for (const client of clients) {
      this.db.prepare(`
        INSERT INTO users (id, email, password_hash, role, name, phone, avatar_url, country_code, region, is_demo, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(client.id, client.email, client.password_hash, client.role, client.name, client.phone, client.avatar_url, client.country_code, client.region, client.is_demo, client.created_at);

      this.db.prepare(`
        INSERT INTO client_profiles (user_id, trainer_id, target_calories, target_protein_g, target_carbs_g, target_fat_g, current_weight_kg, target_weight_kg, goal_type, country_code, region, preferred_portion_unit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        client.id,
        client.profile.trainer_id,
        client.profile.target_calories,
        client.profile.target_protein_g,
        client.profile.target_carbs_g,
        client.profile.target_fat_g,
        client.profile.current_weight_kg,
        client.profile.target_weight_kg,
        client.profile.goal_type,
        client.profile.country_code,
        client.profile.region,
        client.profile.preferred_portion_unit
      );

      // Assign plans
      this.db.prepare(`
        INSERT INTO assigned_workout_plans (id, client_id, plan_id, start_date, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(uuidv4(), client.id, planId, daysAgo(28));

      this.db.prepare(`
        INSERT INTO assigned_meal_plans (id, client_id, plan_id, start_date, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(uuidv4(), client.id, mealPlanId, daysAgo(28));

      // 4 Weeks of Weight Logs
      let runningWeight = client.profile.current_weight_kg + 2.5;
      const weightSkipDays = client.flag_scenario === 'borderline' ? 6 : 2;
      for (let day = 28; day >= 0; day -= weightSkipDays) {
        runningWeight -= 0.15;
        this.db.prepare(`
          INSERT INTO weight_logs (id, client_id, weight_kg, logged_at, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(uuidv4(), client.id, parseFloat(runningWeight.toFixed(1)), daysAgo(day), day === 0 ? 'Feeling lighter today!' : null);
      }

      // 4 Weeks of Workouts
      const workoutMaxRecent = client.flag_scenario === 'no_recent_workout' ? 5 : (client.flag_scenario === 'missed_checkin' ? 2 : 1);
      for (let day = 27; day >= workoutMaxRecent; day -= 2) {
        const wLogId = uuidv4();
        this.db.prepare(`
          INSERT INTO workout_logs (id, client_id, workout_plan_id, completed_at, notes, rating)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(wLogId, client.id, planId, daysAgo(day), 'Great morning workout at home', 4);

        this.db.prepare(`
          INSERT INTO workout_log_sets (id, workout_log_id, exercise_name, set_number, reps_completed, weight_kg)
          VALUES (?, ?, 'Bodyweight Squats', 1, 15, 0)
        `).run(uuidv4(), wLogId);
      }

      // 4 Weeks of Meals
      const macroMultiplier = client.flag_scenario === 'low_macro' ? 0.45 : 0.95;
      for (let day = 27; day >= 0; day -= 1) {
        const cals = Math.round(client.profile.target_calories * (macroMultiplier + (Math.random() * 0.1 - 0.05)));
        const protein = Math.round(client.profile.target_protein_g * (macroMultiplier + (Math.random() * 0.1 - 0.05)));
        const carbs = Math.round(client.profile.target_carbs_g * 1.1);
        const fat = Math.round(client.profile.target_fat_g * 0.9);

        this.db.prepare(`
          INSERT INTO meal_logs (id, client_id, logged_at, meal_slot, food_id, portion_g, calories, protein_g, carbs_g, fat_g)
          VALUES (?, ?, ?, 'lunch', 'food_matooke', 200, ?, ?, ?, ?)
        `).run(uuidv4(), client.id, daysAgo(day), cals, protein, carbs, fat);
      }

      // Check-ins
      const checkinMinDays = client.flag_scenario === 'missed_checkin' ? 11 : 2;
      for (let w = 4; w >= 1; w--) {
        const cDay = (w - 1) * 7 + checkinMinDays;
        if (cDay <= 30) {
          this.db.prepare(`
            INSERT INTO check_ins (id, client_id, submitted_at, energy_level, sleep_hours, adherence_rating, notes, trainer_feedback)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            uuidv4(),
            client.id,
            daysAgo(cDay),
            4,
            7.5,
            client.flag_scenario === 'low_macro' ? 2 : 4,
            `Week ${5 - w} check-in: Feeling good overall, adapting to the home routine.`,
            'Great consistency! Keep up the good work on hydration.'
          );
        }
      }

      // Messages between Trainer & Client
      this.db.prepare(`
        INSERT INTO messages (id, sender_id, receiver_id, content, sent_at, is_read)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(uuidv4(), trainer.id, client.id, `Welcome to FlexiFit, ${client.name.split(' ')[0]}! I have created your customized plan with local Kampala staples. Let's crush week 1!`, daysAgo(28));

      this.db.prepare(`
        INSERT INTO messages (id, sender_id, receiver_id, content, sent_at, is_read)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(uuidv4(), client.id, trainer.id, `Thanks Coach Brian! Excited to start. The matooke and tilapia lunch plan looks delicious.`, daysAgo(27));

      // Sample Form Check submission with AI structured evaluation
      this.db.prepare(`
        INSERT INTO form_checks (id, client_id, exercise_name, video_path, ai_score, ai_feedback_json, trainer_feedback, created_at)
        VALUES (?, ?, 'Bodyweight Squats', '/uploads/demo-squat.mp4', 8.2, ?, ?, ?)
      `).run(
        uuidv4(),
        client.id,
        JSON.stringify({
          overall_score: 8.2,
          what_looks_good: [
            'Good torso angle maintaining neutral spine',
            'Full depth achieved below 90 degrees at the knee',
            'Solid foot placement flat on the ground',
          ],
          fix_these: [
            'Slight knee valgus (inward cave) on ascending drive',
            'Push knees outward in line with your second toe',
          ],
          safety_note: 'Ensure core stays braced throughout the transition.',
          suggested_cue: 'Screw your feet into the floor and drive knees outwards as you stand.',
        }),
        'Agreed with the AI cue on knee tracking. Excellent hip mobility otherwise!',
        daysAgo(5)
      );

      // Subscription record (MTN / Airtel Simulation)
      this.db.prepare(`
        INSERT INTO subscriptions (id, client_id, provider, phone_number, amount_ugx, status, reference_id, created_at)
        VALUES (?, ?, ?, ?, 90000, 'APPROVED', ?, ?)
      `).run(uuidv4(), client.id, client.id.includes('akello') ? 'AIRTEL_MONEY' : 'MTN_MOMO', client.phone, `TX-UG-${Math.floor(100000 + Math.random() * 900000)}`, daysAgo(25));
    }
  }

  // ── Users & Auth ──────────────────────────────────────────
  async createUser(data) {
    const id = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO users (id, email, password_hash, role, name, phone, avatar_url, country_code, region, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.email, data.password_hash, data.role, data.name, data.phone || null, data.avatar_url || null, data.country_code || 'UG', data.region || 'Kampala / Central', data.is_demo ? 1 : 0);

    if (data.role === 'trainer') {
      this.db.prepare(`
        INSERT INTO trainer_profiles (user_id, bio, whatsapp_number, call_channel, call_link, monthly_rate_ugx)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, data.bio || '', data.phone || '', 'whatsapp', 'https://meet.google.com/flexifit', 90000);
    } else {
      this.db.prepare(`
        INSERT INTO client_profiles (user_id, trainer_id, target_calories, target_protein_g, target_carbs_g, target_fat_g, current_weight_kg, target_weight_kg, goal_type, country_code, region, preferred_portion_unit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.trainer_id || 'user_trainer_brian',
        data.target_calories || 2100,
        data.target_protein_g || 140,
        data.target_carbs_g || 240,
        data.target_fat_g || 60,
        data.current_weight_kg || 75.0,
        data.target_weight_kg || 70.0,
        data.goal_type || 'weight_loss',
        data.country_code || 'UG',
        data.region || 'Kampala / Central',
        data.preferred_portion_unit || 'local_visual'
      );
    }

    return this.getUserById(id);
  }

  async getUserByEmail(email) {
    return this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) || null;
  }

  async getUserById(id) {
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return null;

    if (user.role === 'trainer') {
      user.trainer_profile = this.db.prepare('SELECT * FROM trainer_profiles WHERE user_id = ?').get(id) || {};
    } else {
      user.client_profile = this.db.prepare('SELECT * FROM client_profiles WHERE user_id = ?').get(id) || {};
    }
    return user;
  }

  async updateUser(id, data) {
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
      if (['name', 'phone', 'avatar_url', 'country_code', 'region'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length > 0) {
      values.push(id);
      this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }
    return this.getUserById(id);
  }

  // ── Trainer Methods ───────────────────────────────────────
  async getTrainerProfile(userId) {
    return this.db.prepare('SELECT * FROM trainer_profiles WHERE user_id = ?').get(userId);
  }

  async updateTrainerProfile(userId, data) {
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
      if (['bio', 'whatsapp_number', 'call_channel', 'call_link', 'monthly_rate_ugx'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (fields.length > 0) {
      values.push(userId);
      this.db.prepare(`UPDATE trainer_profiles SET ${fields.join(', ')} WHERE user_id = ?`).run(...values);
    }
    return this.getTrainerProfile(userId);
  }

  async getTrainerClients(trainerId) {
    return this.getClientComplianceFlags(trainerId);
  }

  async getClientDetail(clientId) {
    const user = await this.getUserById(clientId);
    if (!user) return null;

    const weights = this.db.prepare('SELECT * FROM weight_logs WHERE client_id = ? ORDER BY logged_at ASC').all(clientId);
    const workouts = this.db.prepare('SELECT * FROM workout_logs WHERE client_id = ? ORDER BY completed_at DESC LIMIT 10').all(clientId);
    const checkIns = this.db.prepare('SELECT * FROM check_ins WHERE client_id = ? ORDER BY submitted_at DESC LIMIT 6').all(clientId);
    const formChecks = this.db.prepare('SELECT * FROM form_checks WHERE client_id = ? ORDER BY created_at DESC LIMIT 5').all(clientId);
    const assignedWorkout = await this.getAssignedWorkoutPlan(clientId);
    const assignedMeal = await this.getAssignedMealPlan(clientId);
    const adherence7d = await this.getClientMacroAdherence(clientId, 7);

    return {
      ...user,
      weights,
      recent_workouts: workouts,
      check_ins: checkIns,
      form_checks: formChecks,
      assigned_workout: assignedWorkout,
      assigned_meal: assignedMeal,
      macro_adherence_7d: adherence7d,
    };
  }

  // ── Foods ─────────────────────────────────────────────────
  async getFoods(search = '', category = '', country = '') {
    let sql = 'SELECT * FROM foods WHERE 1=1';
    const params = [];
    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(local_name) LIKE ? OR LOWER(portion_descriptor) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (country) {
      sql += ' AND (country_code = ? OR country_code = "UG")';
      params.push(country);
    }
    sql += ' ORDER BY is_custom DESC, name ASC';
    return this.db.prepare(sql).all(...params);
  }

  async getFoodById(id) {
    return this.db.prepare('SELECT * FROM foods WHERE id = ?').get(id);
  }

  async createFood(data) {
    const id = data.id || `food_${uuidv4().slice(0, 8)}`;
    this.db.prepare(`
      INSERT INTO foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor, is_custom, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      data.name,
      data.local_name || null,
      data.category,
      data.calories,
      data.protein_g,
      data.carbs_g,
      data.fat_g,
      data.typical_serving_g || 100,
      data.serving_unit || 'g',
      data.country_code || 'UG',
      data.region || 'Kampala / Central',
      data.portion_descriptor || `${data.typical_serving_g || 100}g portion`,
      data.created_by || null
    );
    return this.getFoodById(id);
  }

  // ── Workout Plans ─────────────────────────────────────────
  async getWorkoutPlans(trainerId) {
    const plans = this.db.prepare('SELECT * FROM workout_plans WHERE trainer_id = ? ORDER BY created_at DESC').all(trainerId);
    for (const p of plans) {
      p.exercises = this.db.prepare('SELECT * FROM workout_plan_exercises WHERE plan_id = ? ORDER BY day_of_week ASC, order_index ASC').all(p.id);
    }
    return plans;
  }

  async getWorkoutPlanById(id) {
    const plan = this.db.prepare('SELECT * FROM workout_plans WHERE id = ?').get(id);
    if (!plan) return null;
    plan.exercises = this.db.prepare('SELECT * FROM workout_plan_exercises WHERE plan_id = ? ORDER BY day_of_week ASC, order_index ASC').all(id);
    return plan;
  }

  async createWorkoutPlan(data) {
    const planId = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO workout_plans (id, trainer_id, name, description, days_per_week)
      VALUES (?, ?, ?, ?, ?)
    `).run(planId, data.trainer_id, data.name, data.description || '', data.days_per_week || 4);

    if (Array.isArray(data.exercises)) {
      for (const ex of data.exercises) {
        this.db.prepare(`
          INSERT INTO workout_plan_exercises (id, plan_id, day_of_week, exercise_name, muscle_group, target_sets, target_reps, rest_seconds, demo_video_url, is_home_friendly, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), planId, ex.day_of_week || 1, ex.exercise_name, ex.muscle_group || 'Full Body', ex.target_sets || 3, ex.target_reps || 12, ex.rest_seconds || 60, ex.demo_video_url || null, ex.is_home_friendly ?? 1, ex.order_index || 0);
      }
    }
    return this.getWorkoutPlanById(planId);
  }

  async assignWorkoutPlan(clientId, planId) {
    this.db.prepare('UPDATE assigned_workout_plans SET is_active = 0 WHERE client_id = ?').run(clientId);
    const id = uuidv4();
    this.db.prepare(`
      INSERT INTO assigned_workout_plans (id, client_id, plan_id, start_date, is_active)
      VALUES (?, ?, ?, datetime('now'), 1)
    `).run(id, clientId, planId);
    return { success: true, id, clientId, planId };
  }

  async getAssignedWorkoutPlan(clientId) {
    const assigned = this.db.prepare(`
      SELECT awp.*, wp.name, wp.description, wp.days_per_week
      FROM assigned_workout_plans awp
      JOIN workout_plans wp ON awp.plan_id = wp.id
      WHERE awp.client_id = ? AND awp.is_active = 1
      ORDER BY awp.start_date DESC LIMIT 1
    `).get(clientId);

    if (!assigned) return null;
    assigned.exercises = this.db.prepare('SELECT * FROM workout_plan_exercises WHERE plan_id = ? ORDER BY day_of_week ASC, order_index ASC').all(assigned.plan_id);
    return assigned;
  }

  // ── Meal Plans ────────────────────────────────────────────
  async getMealPlans(trainerId) {
    const plans = this.db.prepare('SELECT * FROM meal_plans WHERE trainer_id = ? ORDER BY created_at DESC').all(trainerId);
    for (const p of plans) {
      p.items = this.db.prepare(`
        SELECT mpi.*, f.name AS food_name, f.local_name, f.calories, f.protein_g, f.carbs_g, f.fat_g, f.portion_descriptor
        FROM meal_plan_items mpi
        JOIN foods f ON mpi.food_id = f.id
        WHERE mpi.meal_plan_id = ?
        ORDER BY mpi.day_of_week ASC, mpi.meal_slot ASC
      `).all(p.id);
    }
    return plans;
  }

  async getMealPlanById(id) {
    const plan = this.db.prepare('SELECT * FROM meal_plans WHERE id = ?').get(id);
    if (!plan) return null;
    plan.items = this.db.prepare(`
      SELECT mpi.*, f.name AS food_name, f.local_name, f.calories, f.protein_g, f.carbs_g, f.fat_g, f.portion_descriptor
      FROM meal_plan_items mpi
      JOIN foods f ON mpi.food_id = f.id
      WHERE mpi.meal_plan_id = ?
      ORDER BY mpi.day_of_week ASC, mpi.meal_slot ASC
    `).all(id);
    return plan;
  }

  async createMealPlan(data) {
    const planId = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO meal_plans (id, trainer_id, name, description)
      VALUES (?, ?, ?, ?)
    `).run(planId, data.trainer_id, data.name, data.description || '');

    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        this.db.prepare(`
          INSERT INTO meal_plan_items (id, meal_plan_id, day_of_week, meal_slot, food_id, portion_g)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), planId, item.day_of_week || 1, item.meal_slot || 'lunch', item.food_id, item.portion_g);
      }
    }
    return this.getMealPlanById(planId);
  }

  async assignMealPlan(clientId, planId) {
    this.db.prepare('UPDATE assigned_meal_plans SET is_active = 0 WHERE client_id = ?').run(clientId);
    const id = uuidv4();
    this.db.prepare(`
      INSERT INTO assigned_meal_plans (id, client_id, plan_id, start_date, is_active)
      VALUES (?, ?, ?, datetime('now'), 1)
    `).run(id, clientId, planId);
    return { success: true, id, clientId, planId };
  }

  async getAssignedMealPlan(clientId) {
    const assigned = this.db.prepare(`
      SELECT amp.*, mp.name, mp.description
      FROM assigned_meal_plans amp
      JOIN meal_plans mp ON amp.plan_id = mp.id
      WHERE amp.client_id = ? AND amp.is_active = 1
      ORDER BY amp.start_date DESC LIMIT 1
    `).get(clientId);

    if (!assigned) return null;
    assigned.items = this.db.prepare(`
      SELECT mpi.*, f.name AS food_name, f.local_name, f.calories, f.protein_g, f.carbs_g, f.fat_g, f.portion_descriptor
      FROM meal_plan_items mpi
      JOIN foods f ON mpi.food_id = f.id
      WHERE mpi.meal_plan_id = ?
      ORDER BY mpi.day_of_week ASC, mpi.meal_slot ASC
    `).all(assigned.plan_id);
    return assigned;
  }

  // ── Logging ───────────────────────────────────────────────
  async logWorkout(data) {
    const id = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO workout_logs (id, client_id, workout_plan_id, completed_at, notes, rating)
      VALUES (?, ?, ?, datetime('now'), ?, ?)
    `).run(id, data.client_id, data.workout_plan_id || null, data.notes || '', data.rating || 5);

    if (Array.isArray(data.sets)) {
      for (const s of data.sets) {
        this.db.prepare(`
          INSERT INTO workout_log_sets (id, workout_log_id, exercise_name, set_number, reps_completed, weight_kg)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), id, s.exercise_name, s.set_number || 1, s.reps_completed || 10, s.weight_kg || 0);
      }
    }
    return { success: true, id };
  }

  async logMeal(data) {
    const id = data.id || uuidv4();
    let { calories, protein_g, carbs_g, fat_g, portion_g } = data;
    portion_g = portion_g || 100;

    if (data.food_id && (!calories || !protein_g)) {
      const food = await this.getFoodById(data.food_id);
      if (food) {
        const ratio = portion_g / 100;
        calories = Math.round(food.calories * ratio);
        protein_g = parseFloat((food.protein_g * ratio).toFixed(1));
        carbs_g = parseFloat((food.carbs_g * ratio).toFixed(1));
        fat_g = parseFloat((food.fat_g * ratio).toFixed(1));
      }
    }

    this.db.prepare(`
      INSERT INTO meal_logs (id, client_id, logged_at, meal_slot, food_id, portion_g, calories, protein_g, carbs_g, fat_g)
      VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.client_id, data.meal_slot || 'lunch', data.food_id || null, portion_g, calories || 0, protein_g || 0, carbs_g || 0, fat_g || 0);

    return { success: true, id };
  }

  async logWeight(data) {
    const id = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO weight_logs (id, client_id, weight_kg, logged_at, notes)
      VALUES (?, ?, ?, datetime('now'), ?)
    `).run(id, data.client_id, data.weight_kg, data.notes || '');

    this.db.prepare('UPDATE client_profiles SET current_weight_kg = ? WHERE user_id = ?').run(data.weight_kg, data.client_id);

    return { success: true, id, weight_kg: data.weight_kg };
  }

  async getWorkoutLogs(clientId, days = 30) {
    return this.db.prepare(`
      SELECT * FROM workout_logs
      WHERE client_id = ? AND completed_at >= datetime('now', '-' || ? || ' days')
      ORDER BY completed_at DESC
    `).all(clientId, days);
  }

  async getMealLogs(clientId, days = 7) {
    return this.db.prepare(`
      SELECT ml.*, f.name AS food_name, f.local_name, f.portion_descriptor
      FROM meal_logs ml
      LEFT JOIN foods f ON ml.food_id = f.id
      WHERE ml.client_id = ? AND ml.logged_at >= datetime('now', '-' || ? || ' days')
      ORDER BY ml.logged_at DESC
    `).all(clientId, days);
  }

  async getWeightLogs(clientId, days = 60) {
    return this.db.prepare(`
      SELECT * FROM weight_logs
      WHERE client_id = ? AND logged_at >= datetime('now', '-' || ? || ' days')
      ORDER BY logged_at ASC
    `).all(clientId, days);
  }

  // ── Check-ins ─────────────────────────────────────────────
  async createCheckIn(data) {
    const id = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO check_ins (id, client_id, submitted_at, energy_level, sleep_hours, adherence_rating, notes, trainer_feedback)
      VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?)
    `).run(id, data.client_id, data.energy_level || 4, data.sleep_hours || 7, data.adherence_rating || 4, data.notes || '', data.trainer_feedback || null);
    return { success: true, id };
  }

  async getCheckIns(clientId) {
    return this.db.prepare('SELECT * FROM check_ins WHERE client_id = ? ORDER BY submitted_at DESC').all(clientId);
  }

  // ── Messages ──────────────────────────────────────────────
  async getMessages(userId1, userId2) {
    return this.db.prepare(`
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY sent_at ASC
    `).all(userId1, userId2, userId2, userId1);
  }

  async createMessage(data) {
    const id = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO messages (id, sender_id, receiver_id, content, sent_at, is_read)
      VALUES (?, ?, ?, ?, datetime('now'), 0)
    `).run(id, data.sender_id, data.receiver_id, data.content);
    return { success: true, id, sent_at: new Date().toISOString() };
  }

  // ── Form Checks & AI ──────────────────────────────────────
  async createFormCheck(data) {
    const id = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO form_checks (id, client_id, exercise_name, video_path, ai_score, ai_feedback_json, trainer_feedback, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.client_id, data.exercise_name, data.video_path || null, data.ai_score || 8.0, typeof data.ai_feedback_json === 'object' ? JSON.stringify(data.ai_feedback_json) : data.ai_feedback_json, data.trainer_feedback || null);
    return { success: true, id };
  }

  async getFormChecks(clientId) {
    return this.db.prepare('SELECT * FROM form_checks WHERE client_id = ? ORDER BY created_at DESC').all(clientId);
  }

  async updateFormCheckTrainerFeedback(id, feedback) {
    this.db.prepare('UPDATE form_checks SET trainer_feedback = ? WHERE id = ?').run(feedback, id);
    return { success: true, id };
  }

  // ── Pose Sessions ─────────────────────────────────────────
  async createPoseSession(data) {
    const id = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO pose_sessions (id, client_id, exercise_name, rep_count, duration_seconds, avg_form_score, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, data.client_id, data.exercise_name, data.rep_count, data.duration_seconds, data.avg_form_score);
    return { success: true, id };
  }

  // ── Subscriptions & Call Requests ─────────────────────────
  async createSubscription(data) {
    const id = data.id || uuidv4();
    const reference = data.reference_id || `TX-MOMO-${Math.floor(100000 + Math.random() * 900000)}`;
    this.db.prepare(`
      INSERT INTO subscriptions (id, client_id, provider, phone_number, amount_ugx, status, reference_id, created_at)
      VALUES (?, ?, ?, ?, ?, 'APPROVED', ?, datetime('now'))
    `).run(id, data.client_id, data.provider || 'MTN_MOMO', data.phone_number, data.amount_ugx || 90000, reference);
    return { success: true, id, reference_id: reference, status: 'APPROVED' };
  }

  async getSubscriptions(clientId) {
    return this.db.prepare('SELECT * FROM subscriptions WHERE client_id = ? ORDER BY created_at DESC').all(clientId);
  }

  async createCallRequest(data) {
    const id = data.id || uuidv4();
    this.db.prepare(`
      INSERT INTO call_requests (id, client_id, trainer_id, preferred_time, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).run(id, data.client_id, data.trainer_id, data.preferred_time || 'Next 30 mins', data.notes || '');
    return { success: true, id };
  }

  async getCallRequests(trainerId) {
    return this.db.prepare(`
      SELECT cr.*, u.name AS client_name, u.phone AS client_phone, u.avatar_url
      FROM call_requests cr
      JOIN users u ON cr.client_id = u.id
      WHERE cr.trainer_id = ? AND cr.status = 'pending'
      ORDER BY cr.created_at DESC
    `).all(trainerId);
  }

  // ── Analytics & Automated Flags ───────────────────────────
  async getClientMacroAdherence(clientId, days = 7) {
    const profile = this.db.prepare('SELECT target_calories FROM client_profiles WHERE user_id = ?').get(clientId);
    if (!profile || !profile.target_calories) return 80;

    const rows = this.db.prepare(`
      SELECT date(logged_at) AS day, SUM(calories) AS day_cals
      FROM meal_logs
      WHERE client_id = ? AND logged_at >= datetime('now', '-' || ? || ' days')
      GROUP BY date(logged_at)
    `).all(clientId, days);

    if (rows.length === 0) return 0;

    const adherences = rows.map((r) => {
      const diff = Math.abs(r.day_cals - profile.target_calories);
      return Math.max(0, 1 - diff / profile.target_calories);
    });

    const avg = adherences.reduce((a, b) => a + b, 0) / adherences.length;
    return Math.round(avg * 100);
  }

  async getClientComplianceFlags(trainerId) {
    const clients = this.db.prepare(`
      SELECT u.id, u.name, u.phone, u.avatar_url, u.country_code, u.region,
             cp.target_calories, cp.current_weight_kg, cp.target_weight_kg, cp.goal_type
      FROM users u
      JOIN client_profiles cp ON u.id = cp.user_id
      WHERE cp.trainer_id = ? AND u.role = 'client'
      ORDER BY u.name ASC
    `).all(trainerId);

    const results = [];
    for (const c of clients) {
      const lastWorkout = this.db.prepare('SELECT MAX(completed_at) AS last_date FROM workout_logs WHERE client_id = ?').get(c.id);
      const lastWeight = this.db.prepare('SELECT MAX(logged_at) AS last_date FROM weight_logs WHERE client_id = ?').get(c.id);
      const lastCheckIn = this.db.prepare('SELECT MAX(submitted_at) AS last_date FROM check_ins WHERE client_id = ?').get(c.id);
      const macroAdherence = await this.getClientMacroAdherence(c.id, 7);

      const now = Date.now();
      const getDaysAgo = (dateStr) => {
        if (!dateStr) return 999;
        return (now - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
      };

      const workoutDaysAgo = getDaysAgo(lastWorkout?.last_date);
      const weightDaysAgo = getDaysAgo(lastWeight?.last_date);
      const checkInDaysAgo = getDaysAgo(lastCheckIn?.last_date);

      const flagReasons = [];
      if (workoutDaysAgo > config.FLAG_NO_WORKOUT_DAYS) {
        flagReasons.push(`No workout logged in ${Math.floor(workoutDaysAgo)} days (target: ≤${config.FLAG_NO_WORKOUT_DAYS}d)`);
      }
      if (macroAdherence < config.FLAG_MACRO_ADHERENCE_PCT) {
        flagReasons.push(`7-day macro adherence at ${macroAdherence}% (target: ≥${config.FLAG_MACRO_ADHERENCE_PCT}%)`);
      }
      if (weightDaysAgo > config.FLAG_NO_WEIGHT_DAYS) {
        flagReasons.push(`No weight logged in ${Math.floor(weightDaysAgo)} days (target: ≤${config.FLAG_NO_WEIGHT_DAYS}d)`);
      }
      if (checkInDaysAgo > config.FLAG_CHECKIN_MISSED_DAYS) {
        flagReasons.push(`Weekly check-in overdue by ${Math.floor(checkInDaysAgo)} days`);
      }

      let flagStatus = 'on_track';
      if (flagReasons.length >= 2) {
        flagStatus = 'non_compliant';
      } else if (flagReasons.length === 1) {
        flagStatus = 'needs_attention';
      }

      results.push({
        ...c,
        last_workout_at: lastWorkout?.last_date || null,
        last_weight_at: lastWeight?.last_date || null,
        last_checkin_at: lastCheckIn?.last_date || null,
        macro_adherence_7d: macroAdherence,
        flag_status: flagStatus,
        flag_reasons: flagReasons,
      });
    }

    return results;
  }

  async getBusinessStats(trainerId) {
    const clients = this.db.prepare('SELECT COUNT(*) AS count FROM client_profiles WHERE trainer_id = ?').get(trainerId).count;
    const profile = await this.getTrainerProfile(trainerId);
    const rate = profile?.monthly_rate_ugx || 90000;

    const currentMrr = clients * rate;
    const inPersonClients = 8;
    const inPersonRate = 300000;
    const inPersonMrr = inPersonClients * inPersonRate; // 2,400,000 UGX

    const remoteTargetClients = 60;
    const projectedMrr = remoteTargetClients * rate; // 5,400,000 UGX

    return {
      active_clients: clients,
      monthly_rate_ugx: rate,
      current_mrr_ugx: currentMrr,
      in_person_comparison: {
        in_person_clients: inPersonClients,
        in_person_rate_ugx: inPersonRate,
        in_person_mrr_ugx: inPersonMrr,
        remote_target_clients: remoteTargetClients,
        remote_target_rate_ugx: rate,
        projected_remote_mrr_ugx: projectedMrr,
        revenue_multiplier: parseFloat((projectedMrr / inPersonMrr).toFixed(1)),
      },
    };
  }
}
