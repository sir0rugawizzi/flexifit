-- =====================================================================
-- FlexiFit Oracle APEX / ORDS Schema (01_schema.sql)
-- Run in APEX SQL Workshop > SQL Scripts
-- Target: apex.oracle.com (Free Autonomous DB)
-- =====================================================================

-- 1. USERS
CREATE TABLE flexi_users (
  id              VARCHAR2(64) PRIMARY KEY,
  email           VARCHAR2(255) NOT NULL UNIQUE,
  password_hash   VARCHAR2(255) NOT NULL,
  role            VARCHAR2(20) NOT NULL CHECK (role IN ('trainer', 'client')),
  name            VARCHAR2(150) NOT NULL,
  phone           VARCHAR2(50),
  avatar_url      VARCHAR2(500),
  country_code    VARCHAR2(10) DEFAULT 'UG',
  region          VARCHAR2(100) DEFAULT 'Kampala / Central',
  is_demo         NUMBER(1) DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

-- 2. TRAINER PROFILES
CREATE TABLE flexi_trainer_profiles (
  user_id          VARCHAR2(64) PRIMARY KEY REFERENCES flexi_users(id) ON DELETE CASCADE,
  bio              VARCHAR2(2000),
  whatsapp_number  VARCHAR2(50),
  call_channel     VARCHAR2(20) DEFAULT 'whatsapp' CHECK (call_channel IN ('whatsapp', 'meet', 'zoom')),
  call_link        VARCHAR2(500),
  monthly_rate_ugx NUMBER(10) DEFAULT 90000,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

-- 3. CLIENT PROFILES
CREATE TABLE flexi_client_profiles (
  user_id               VARCHAR2(64) PRIMARY KEY REFERENCES flexi_users(id) ON DELETE CASCADE,
  trainer_id            VARCHAR2(64) REFERENCES flexi_users(id),
  target_calories       NUMBER(5) DEFAULT 2200,
  target_protein_g      NUMBER(5) DEFAULT 140,
  target_carbs_g        NUMBER(5) DEFAULT 250,
  target_fat_g          NUMBER(5) DEFAULT 65,
  current_weight_kg     NUMBER(5,2) DEFAULT 75.00,
  target_weight_kg      NUMBER(5,2) DEFAULT 70.00,
  goal_type             VARCHAR2(30) DEFAULT 'weight_loss' CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'general_fitness', 'endurance')),
  country_code          VARCHAR2(10) DEFAULT 'UG',
  region                VARCHAR2(100) DEFAULT 'Kampala / Central',
  preferred_portion_unit VARCHAR2(30) DEFAULT 'local_visual',
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

-- 4. FOODS
CREATE TABLE flexi_foods (
  id                 VARCHAR2(64) PRIMARY KEY,
  name               VARCHAR2(150) NOT NULL,
  local_name         VARCHAR2(150),
  category           VARCHAR2(50) NOT NULL CHECK (category IN ('carbohydrates', 'proteins', 'vegetables', 'fruits', 'fats_oils', 'mixed_dishes', 'snacks_beverages')),
  calories           NUMBER(7,2) NOT NULL,
  protein_g          NUMBER(7,2) NOT NULL,
  carbs_g            NUMBER(7,2) NOT NULL,
  fat_g              NUMBER(7,2) NOT NULL,
  typical_serving_g  NUMBER(7,2) NOT NULL,
  serving_unit       VARCHAR2(20) DEFAULT 'g',
  country_code       VARCHAR2(10) DEFAULT 'UG',
  region             VARCHAR2(100) DEFAULT 'East Africa',
  portion_descriptor VARCHAR2(255),
  is_custom          NUMBER(1) DEFAULT 0 CHECK (is_custom IN (0, 1)),
  created_by         VARCHAR2(64) REFERENCES flexi_users(id),
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

-- 5. WORKOUT PLANS
CREATE TABLE flexi_workout_plans (
  id             VARCHAR2(64) PRIMARY KEY,
  trainer_id     VARCHAR2(64) REFERENCES flexi_users(id),
  name           VARCHAR2(150) NOT NULL,
  description    VARCHAR2(2000),
  days_per_week  NUMBER(2) DEFAULT 4,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

CREATE TABLE flexi_workout_plan_exercises (
  id               VARCHAR2(64) PRIMARY KEY,
  plan_id          VARCHAR2(64) REFERENCES flexi_workout_plans(id) ON DELETE CASCADE,
  day_of_week      NUMBER(1) NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  exercise_name    VARCHAR2(150) NOT NULL,
  muscle_group     VARCHAR2(50),
  target_sets      NUMBER(3) DEFAULT 3,
  target_reps      NUMBER(4) DEFAULT 12,
  rest_seconds     NUMBER(4) DEFAULT 60,
  demo_video_url   VARCHAR2(500),
  is_home_friendly NUMBER(1) DEFAULT 1 CHECK (is_home_friendly IN (0, 1)),
  order_index      NUMBER(3) DEFAULT 0
);

CREATE TABLE flexi_assigned_workout_plans (
  id          VARCHAR2(64) PRIMARY KEY,
  client_id   VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  plan_id     VARCHAR2(64) REFERENCES flexi_workout_plans(id) ON DELETE CASCADE,
  start_date  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
  is_active   NUMBER(1) DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- 6. MEAL PLANS
CREATE TABLE flexi_meal_plans (
  id          VARCHAR2(64) PRIMARY KEY,
  trainer_id  VARCHAR2(64) REFERENCES flexi_users(id),
  name        VARCHAR2(150) NOT NULL,
  description VARCHAR2(2000),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

CREATE TABLE flexi_meal_plan_items (
  id           VARCHAR2(64) PRIMARY KEY,
  meal_plan_id VARCHAR2(64) REFERENCES flexi_meal_plans(id) ON DELETE CASCADE,
  day_of_week  NUMBER(1) NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_slot    VARCHAR2(20) NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id      VARCHAR2(64) REFERENCES flexi_foods(id),
  portion_g    NUMBER(7,2) NOT NULL
);

CREATE TABLE flexi_assigned_meal_plans (
  id          VARCHAR2(64) PRIMARY KEY,
  client_id   VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  plan_id     VARCHAR2(64) REFERENCES flexi_meal_plans(id) ON DELETE CASCADE,
  start_date  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
  is_active   NUMBER(1) DEFAULT 1 CHECK (is_active IN (0, 1))
);

-- 7. TRACKING & LOGS
CREATE TABLE flexi_workout_logs (
  id              VARCHAR2(64) PRIMARY KEY,
  client_id       VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  workout_plan_id VARCHAR2(64) REFERENCES flexi_workout_plans(id),
  completed_at    TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
  notes           VARCHAR2(1000),
  rating          NUMBER(1) CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE flexi_workout_log_sets (
  id              VARCHAR2(64) PRIMARY KEY,
  workout_log_id  VARCHAR2(64) REFERENCES flexi_workout_logs(id) ON DELETE CASCADE,
  exercise_name   VARCHAR2(150) NOT NULL,
  set_number      NUMBER(3) NOT NULL,
  reps_completed  NUMBER(4) NOT NULL,
  weight_kg       NUMBER(6,2) DEFAULT 0
);

CREATE TABLE flexi_meal_logs (
  id          VARCHAR2(64) PRIMARY KEY,
  client_id   VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  logged_at   TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
  meal_slot   VARCHAR2(20) NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id     VARCHAR2(64) REFERENCES flexi_foods(id),
  portion_g   NUMBER(7,2) NOT NULL,
  calories    NUMBER(7,2) NOT NULL,
  protein_g   NUMBER(7,2) NOT NULL,
  carbs_g     NUMBER(7,2) NOT NULL,
  fat_g       NUMBER(7,2) NOT NULL
);

CREATE TABLE flexi_weight_logs (
  id         VARCHAR2(64) PRIMARY KEY,
  client_id  VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  weight_kg  NUMBER(5,2) NOT NULL,
  logged_at  TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
  notes      VARCHAR2(500)
);

CREATE TABLE flexi_check_ins (
  id               VARCHAR2(64) PRIMARY KEY,
  client_id        VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  submitted_at     TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
  energy_level     NUMBER(1) CHECK (energy_level BETWEEN 1 AND 5),
  sleep_hours      NUMBER(4,1),
  adherence_rating NUMBER(1) CHECK (adherence_rating BETWEEN 1 AND 5),
  notes            VARCHAR2(2000),
  trainer_feedback VARCHAR2(2000)
);

CREATE TABLE flexi_messages (
  id          VARCHAR2(64) PRIMARY KEY,
  sender_id   VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  receiver_id VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  content     VARCHAR2(2000) NOT NULL,
  sent_at     TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
  is_read     NUMBER(1) DEFAULT 0 CHECK (is_read IN (0, 1))
);

CREATE TABLE flexi_call_requests (
  id             VARCHAR2(64) PRIMARY KEY,
  client_id      VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  trainer_id     VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  preferred_time VARCHAR2(100),
  notes          VARCHAR2(1000),
  status         VARCHAR2(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

CREATE TABLE flexi_subscriptions (
  id           VARCHAR2(64) PRIMARY KEY,
  client_id    VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  provider     VARCHAR2(30) NOT NULL CHECK (provider IN ('MTN_MOMO', 'AIRTEL_MONEY')),
  phone_number VARCHAR2(50) NOT NULL,
  amount_ugx   NUMBER(10) NOT NULL,
  status       VARCHAR2(20) DEFAULT 'APPROVED',
  reference_id VARCHAR2(100) NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

CREATE TABLE flexi_form_checks (
  id               VARCHAR2(64) PRIMARY KEY,
  client_id        VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  exercise_name    VARCHAR2(150) NOT NULL,
  video_path       VARCHAR2(500),
  ai_score         NUMBER(4,1),
  ai_feedback_json CLOB,
  trainer_feedback VARCHAR2(2000),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

CREATE TABLE flexi_pose_sessions (
  id               VARCHAR2(64) PRIMARY KEY,
  client_id        VARCHAR2(64) REFERENCES flexi_users(id) ON DELETE CASCADE,
  exercise_name    VARCHAR2(150) NOT NULL,
  rep_count        NUMBER(5) NOT NULL,
  duration_seconds NUMBER(6) NOT NULL,
  avg_form_score   NUMBER(4,1) NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP
);

-- =====================================================================
-- COMPLIANCE FLAGS VIEW
-- Evaluates 4 venture proposal non-compliance criteria:
-- 1. No workout logged in last 3 days
-- 2. 7-day macro adherence < 70%
-- 3. No weight logged in last 7 days
-- 4. Weekly check-in missed (> 7 days)
-- =====================================================================
CREATE OR REPLACE VIEW flexi_client_flags_v AS
WITH client_stats AS (
  SELECT
    u.id AS client_id,
    u.name AS client_name,
    cp.trainer_id,
    (SELECT MAX(completed_at) FROM flexi_workout_logs wl WHERE wl.client_id = u.id) AS last_workout_at,
    (SELECT MAX(logged_at) FROM flexi_weight_logs wgl WHERE wgl.client_id = u.id) AS last_weight_at,
    (SELECT MAX(submitted_at) FROM flexi_check_ins ci WHERE ci.client_id = u.id) AS last_checkin_at,
    (
      SELECT NVL(AVG(
        CASE
          WHEN cp.target_calories > 0 AND daily_cals > 0 THEN
            LEAST(1.0, GREATEST(0.0, 1.0 - ABS(daily_cals - cp.target_calories) / cp.target_calories))
          ELSE 0.5
        END
      ) * 100, 50)
      FROM (
        SELECT TRUNC(logged_at) AS log_day, SUM(calories) AS daily_cals
        FROM flexi_meal_logs
        WHERE client_id = u.id AND logged_at >= SYSTIMESTAMP - INTERVAL '7' DAY
        GROUP BY TRUNC(logged_at)
      )
    ) AS macro_adherence_7d
  FROM flexi_users u
  JOIN flexi_client_profiles cp ON u.id = cp.user_id
  WHERE u.role = 'client'
)
SELECT
  client_id,
  client_name,
  trainer_id,
  last_workout_at,
  last_weight_at,
  last_checkin_at,
  macro_adherence_7d,
  CASE
    WHEN last_workout_at IS NULL OR last_workout_at < SYSTIMESTAMP - INTERVAL '3' DAY THEN 1
    ELSE 0
  END AS flag_no_workout_3d,
  CASE
    WHEN macro_adherence_7d < 70 THEN 1
    ELSE 0
  END AS flag_low_macro_7d,
  CASE
    WHEN last_weight_at IS NULL OR last_weight_at < SYSTIMESTAMP - INTERVAL '7' DAY THEN 1
    ELSE 0
  END AS flag_no_weight_7d,
  CASE
    WHEN last_checkin_at IS NULL OR last_checkin_at < SYSTIMESTAMP - INTERVAL '7' DAY THEN 1
    ELSE 0
  END AS flag_missed_checkin_7d,
  CASE
    WHEN (
      (CASE WHEN last_workout_at IS NULL OR last_workout_at < SYSTIMESTAMP - INTERVAL '3' DAY THEN 1 ELSE 0 END) +
      (CASE WHEN macro_adherence_7d < 70 THEN 1 ELSE 0 END) +
      (CASE WHEN last_weight_at IS NULL OR last_weight_at < SYSTIMESTAMP - INTERVAL '7' DAY THEN 1 ELSE 0 END) +
      (CASE WHEN last_checkin_at IS NULL OR last_checkin_at < SYSTIMESTAMP - INTERVAL '7' DAY THEN 1 ELSE 0 END)
    ) >= 2 THEN 'non_compliant'
    WHEN (
      (CASE WHEN last_workout_at IS NULL OR last_workout_at < SYSTIMESTAMP - INTERVAL '3' DAY THEN 1 ELSE 0 END) +
      (CASE WHEN macro_adherence_7d < 70 THEN 1 ELSE 0 END) +
      (CASE WHEN last_weight_at IS NULL OR last_weight_at < SYSTIMESTAMP - INTERVAL '7' DAY THEN 1 ELSE 0 END) +
      (CASE WHEN last_checkin_at IS NULL OR last_checkin_at < SYSTIMESTAMP - INTERVAL '7' DAY THEN 1 ELSE 0 END)
    ) = 1 THEN 'needs_attention'
    ELSE 'on_track'
  END AS flag_status
FROM client_stats;
