-- =====================================================================
-- FlexiFit Oracle Demo Story Seed (03_seed_demo.sql)
-- Coach Brian Mukasa + 6 Clients with 4 weeks of history & flag scenarios
-- =====================================================================

-- 1. TRAINER: Coach Brian Mukasa
INSERT INTO flexi_users (id, email, password_hash, role, name, phone, avatar_url, country_code, region, is_demo, created_at)
VALUES (
  'user_trainer_brian',
  'brian@flexifit.ug',
  '$2b$10$epR4Qv/mKqD1E.2a0V4f4O15bY4jA9KzF3k8k3X9gT7p0u9J9O0S6',
  'trainer',
  'Coach Brian Mukasa',
  '+256701234567',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'UG',
  'Kampala / Central',
  1,
  SYSTIMESTAMP - INTERVAL '60' DAY
);

INSERT INTO flexi_trainer_profiles (user_id, bio, whatsapp_number, call_channel, call_link, monthly_rate_ugx)
VALUES (
  'user_trainer_brian',
  'Certified strength & conditioning coach with 8 years experience helping busy Kampala professionals get fit without gym burnout. Specialising in high-protein local Ugandan nutrition and home calisthenics.',
  '+256701234567',
  'whatsapp',
  'https://meet.google.com/flexifit-demo',
  90000
);

-- 2. CLIENT 1: Grace Akello (Flagged: Missed weekly check-in)
INSERT INTO flexi_users (id, email, password_hash, role, name, phone, country_code, region, is_demo, created_at)
VALUES ('client_akello_grace', 'akello@flexifit.ug', '$2b$10$epR4Qv/mKqD1E.2a0V4f4O15bY4jA9KzF3k8k3X9gT7p0u9J9O0S6', 'client', 'Grace Akello', '+256772111222', 'UG', 'Kampala / Central', 1, SYSTIMESTAMP - INTERVAL '35' DAY);

INSERT INTO flexi_client_profiles (user_id, trainer_id, target_calories, target_protein_g, target_carbs_g, target_fat_g, current_weight_kg, target_weight_kg, goal_type)
VALUES ('client_akello_grace', 'user_trainer_brian', 1900, 130, 210, 55, 74.2, 66.0, 'weight_loss');

-- 3. CLIENT 2: Denis Kigozi (Flagged: Low 7-day macro adherence)
INSERT INTO flexi_users (id, email, password_hash, role, name, phone, country_code, region, is_demo, created_at)
VALUES ('client_kigozi_denis', 'kigozi@flexifit.ug', '$2b$10$epR4Qv/mKqD1E.2a0V4f4O15bY4jA9KzF3k8k3X9gT7p0u9J9O0S6', 'client', 'Denis Kigozi', '+256782333444', 'UG', 'Kampala / Central', 1, SYSTIMESTAMP - INTERVAL '40' DAY);

INSERT INTO flexi_client_profiles (user_id, trainer_id, target_calories, target_protein_g, target_carbs_g, target_fat_g, current_weight_kg, target_weight_kg, goal_type)
VALUES ('client_kigozi_denis', 'user_trainer_brian', 2400, 160, 280, 70, 82.5, 76.0, 'muscle_gain');

-- 4. CLIENT 3: Faith Namubiru (Flagged: No workout in last 4 days)
INSERT INTO flexi_users (id, email, password_hash, role, name, phone, country_code, region, is_demo, created_at)
VALUES ('client_namubiru_faith', 'faith@flexifit.ug', '$2b$10$epR4Qv/mKqD1E.2a0V4f4O15bY4jA9KzF3k8k3X9gT7p0u9J9O0S6', 'client', 'Faith Namubiru', '+256752555666', 'UG', 'Kampala / Central', 1, SYSTIMESTAMP - INTERVAL '30' DAY);

INSERT INTO flexi_client_profiles (user_id, trainer_id, target_calories, target_protein_g, target_carbs_g, target_fat_g, current_weight_kg, target_weight_kg, goal_type)
VALUES ('client_namubiru_faith', 'user_trainer_brian', 1800, 120, 200, 50, 69.8, 64.0, 'weight_loss');

-- 5. CLIENT 4: David Ochieng (Borderline: No weight in 6 days)
INSERT INTO flexi_users (id, email, password_hash, role, name, phone, country_code, region, is_demo, created_at)
VALUES ('client_ochieng_david', 'ochieng@flexifit.ug', '$2b$10$epR4Qv/mKqD1E.2a0V4f4O15bY4jA9KzF3k8k3X9gT7p0u9J9O0S6', 'client', 'David Ochieng', '+256702777888', 'UG', 'Northern / Gulu', 1, SYSTIMESTAMP - INTERVAL '45' DAY);

INSERT INTO flexi_client_profiles (user_id, trainer_id, target_calories, target_protein_g, target_carbs_g, target_fat_g, current_weight_kg, target_weight_kg, goal_type)
VALUES ('client_ochieng_david', 'user_trainer_brian', 2300, 150, 270, 65, 78.4, 74.0, 'general_fitness');

-- 6. CLIENT 5: Ronald Tumusiime (On track)
INSERT INTO flexi_users (id, email, password_hash, role, name, phone, country_code, region, is_demo, created_at)
VALUES ('client_tumusiime_ronald', 'ronald@flexifit.ug', '$2b$10$epR4Qv/mKqD1E.2a0V4f4O15bY4jA9KzF3k8k3X9gT7p0u9J9O0S6', 'client', 'Ronald Tumusiime', '+256774999000', 'UG', 'Western / Mbarara', 1, SYSTIMESTAMP - INTERVAL '50' DAY);

INSERT INTO flexi_client_profiles (user_id, trainer_id, target_calories, target_protein_g, target_carbs_g, target_fat_g, current_weight_kg, target_weight_kg, goal_type)
VALUES ('client_tumusiime_ronald', 'user_trainer_brian', 2500, 170, 300, 70, 79.1, 82.0, 'muscle_gain');

-- 7. CLIENT 6: Brenda Nalwanga (On track)
INSERT INTO flexi_users (id, email, password_hash, role, name, phone, country_code, region, is_demo, created_at)
VALUES ('client_nalwanga_brenda', 'brenda@flexifit.ug', '$2b$10$epR4Qv/mKqD1E.2a0V4f4O15bY4jA9KzF3k8k3X9gT7p0u9J9O0S6', 'client', 'Brenda Nalwanga', '+256784111333', 'UG', 'Kampala / Central', 1, SYSTIMESTAMP - INTERVAL '55' DAY);

INSERT INTO flexi_client_profiles (user_id, trainer_id, target_calories, target_protein_g, target_carbs_g, target_fat_g, current_weight_kg, target_weight_kg, goal_type)
VALUES ('client_nalwanga_brenda', 'user_trainer_brian', 1750, 125, 180, 48, 63.4, 60.0, 'weight_loss');

-- WORKOUT PLAN
INSERT INTO flexi_workout_plans (id, trainer_id, name, description, days_per_week)
VALUES ('plan_home_hiit', 'user_trainer_brian', 'Kampala Busy Professional 4-Day Home Plan', 'Zero-equipment full body calisthenics designed for living rooms and verandas.', 4);

INSERT INTO flexi_workout_plan_exercises (id, plan_id, day_of_week, exercise_name, muscle_group, target_sets, target_reps, rest_seconds, is_home_friendly, order_index)
VALUES ('ex_1', 'plan_home_hiit', 1, 'Bodyweight Squats', 'Legs', 4, 15, 60, 1, 1);

INSERT INTO flexi_workout_plan_exercises (id, plan_id, day_of_week, exercise_name, muscle_group, target_sets, target_reps, rest_seconds, is_home_friendly, order_index)
VALUES ('ex_2', 'plan_home_hiit', 1, 'Push-ups', 'Chest & Triceps', 3, 12, 60, 1, 2);

INSERT INTO flexi_workout_plan_exercises (id, plan_id, day_of_week, exercise_name, muscle_group, target_sets, target_reps, rest_seconds, is_home_friendly, order_index)
VALUES ('ex_3', 'plan_home_hiit', 1, 'Plank Hold', 'Core', 3, 45, 45, 1, 3);

-- ASSIGN PLANS TO CLIENTS
INSERT INTO flexi_assigned_workout_plans (id, client_id, plan_id, start_date, is_active)
SELECT 'awp_' || id, id, 'plan_home_hiit', SYSTIMESTAMP - INTERVAL '28' DAY, 1
FROM flexi_users WHERE role = 'client';

-- MOCK SUBSCRIPTIONS
INSERT INTO flexi_subscriptions (id, client_id, provider, phone_number, amount_ugx, status, reference_id, created_at)
VALUES ('sub_1', 'client_tumusiime_ronald', 'MTN_MOMO', '+256774999000', 90000, 'APPROVED', 'MOMO-DEMO-94821', SYSTIMESTAMP - INTERVAL '15' DAY);

INSERT INTO flexi_subscriptions (id, client_id, provider, phone_number, amount_ugx, status, reference_id, created_at)
VALUES ('sub_2', 'client_nalwanga_brenda', 'AIRTEL_MONEY', '+256784111333', 90000, 'APPROVED', 'AIRTEL-DEMO-38291', SYSTIMESTAMP - INTERVAL '20' DAY);

COMMIT;
