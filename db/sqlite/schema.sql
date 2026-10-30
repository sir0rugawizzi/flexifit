-- FlexiFit SQLite Schema
-- Symmetrical with Oracle DDL in /db/oracle/01_schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('trainer', 'client')),
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  country_code TEXT DEFAULT 'UG',
  region TEXT DEFAULT 'Kampala / Central',
  is_demo INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trainer_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE,
  bio TEXT,
  whatsapp_number TEXT,
  call_channel TEXT DEFAULT 'whatsapp' CHECK(call_channel IN ('whatsapp', 'meet', 'zoom')),
  call_link TEXT,
  monthly_rate_ugx INTEGER DEFAULT 90000,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS client_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  trainer_id TEXT REFERENCES users(id),
  target_calories INTEGER DEFAULT 2200,
  target_protein_g INTEGER DEFAULT 140,
  target_carbs_g INTEGER DEFAULT 250,
  target_fat_g INTEGER DEFAULT 65,
  current_weight_kg REAL DEFAULT 75.0,
  target_weight_kg REAL DEFAULT 70.0,
  goal_type TEXT DEFAULT 'weight_loss' CHECK(goal_type IN ('weight_loss', 'muscle_gain', 'general_fitness', 'endurance')),
  country_code TEXT DEFAULT 'UG',
  region TEXT DEFAULT 'Kampala / Central',
  preferred_portion_unit TEXT DEFAULT 'local_visual',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  local_name TEXT,
  category TEXT NOT NULL CHECK(category IN ('carbohydrates', 'proteins', 'vegetables', 'fruits', 'fats_oils', 'mixed_dishes', 'snacks_beverages')),
  calories REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL,
  typical_serving_g REAL NOT NULL,
  serving_unit TEXT DEFAULT 'g',
  country_code TEXT DEFAULT 'UG',
  region TEXT DEFAULT 'East Africa',
  portion_descriptor TEXT,
  is_custom INTEGER DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id TEXT PRIMARY KEY,
  trainer_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  days_per_week INTEGER DEFAULT 4,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workout_plan_exercises (
  id TEXT PRIMARY KEY,
  plan_id TEXT REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 7),
  exercise_name TEXT NOT NULL,
  muscle_group TEXT,
  target_sets INTEGER DEFAULT 3,
  target_reps INTEGER DEFAULT 12,
  rest_seconds INTEGER DEFAULT 60,
  demo_video_url TEXT,
  is_home_friendly INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assigned_workout_plans (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES workout_plans(id) ON DELETE CASCADE,
  start_date TEXT DEFAULT (datetime('now')),
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id TEXT PRIMARY KEY,
  trainer_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meal_plan_items (
  id TEXT PRIMARY KEY,
  meal_plan_id TEXT REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 7),
  meal_slot TEXT NOT NULL CHECK(meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id TEXT REFERENCES foods(id),
  portion_g REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS assigned_meal_plans (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES meal_plans(id) ON DELETE CASCADE,
  start_date TEXT DEFAULT (datetime('now')),
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS workout_logs (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  workout_plan_id TEXT REFERENCES workout_plans(id),
  completed_at TEXT DEFAULT (datetime('now')),
  notes TEXT,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS workout_log_sets (
  id TEXT PRIMARY KEY,
  workout_log_id TEXT REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps_completed INTEGER NOT NULL,
  weight_kg REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meal_logs (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  logged_at TEXT DEFAULT (datetime('now')),
  meal_slot TEXT NOT NULL CHECK(meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id TEXT REFERENCES foods(id),
  portion_g REAL NOT NULL,
  calories REAL NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  weight_kg REAL NOT NULL,
  logged_at TEXT DEFAULT (datetime('now')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  submitted_at TEXT DEFAULT (datetime('now')),
  energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
  sleep_hours REAL,
  adherence_rating INTEGER CHECK(adherence_rating BETWEEN 1 AND 5),
  notes TEXT,
  trainer_feedback TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TEXT DEFAULT (datetime('now')),
  is_read INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS call_requests (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  trainer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  preferred_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  trainer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK(provider IN ('MTN_MOMO', 'AIRTEL_MONEY')),
  phone_number TEXT NOT NULL,
  amount_ugx INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'cancelled', 'rejected')),
  reference_id TEXT NOT NULL UNIQUE,
  paid_at TEXT,
  confirmed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS form_checks (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  video_path TEXT,
  ai_score REAL,
  ai_feedback_json TEXT,
  trainer_feedback TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pose_sessions (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  rep_count INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  avg_form_score REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_client_profiles_trainer ON client_profiles(trainer_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_client ON workout_logs(client_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_meal_logs_client ON meal_logs(client_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_weight_logs_client ON weight_logs(client_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_check_ins_client ON check_ins(client_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(sender_id, receiver_id, sent_at);
