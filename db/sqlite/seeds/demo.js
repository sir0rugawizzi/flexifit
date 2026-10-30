// db/sqlite/seeds/demo.js
// Pilot Seed Generator: Coach Brian + 6 Clients with 4 Weeks of realistic history
// Generates secure bcrypt hash dynamically from SEED_PASSWORD env var at runtime.
// No hardcoded passwords or password hashes.

import bcrypt from 'bcrypt';

export async function generatePilotSeed(seedPassword) {
  if (!seedPassword || typeof seedPassword !== 'string' || seedPassword.trim().length < 8) {
    throw new Error('SEED_PASSWORD must be at least 8 characters long to seed accounts.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(seedPassword, salt);

  const now = new Date();
  const daysAgo = (days) => {
    const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return d.toISOString();
  };

  // 1 Trainer
  const trainer = {
    id: 'user_trainer_brian',
    email: 'brian@flexifit.ug',
    password_hash: passwordHash,
    role: 'trainer',
    name: 'Coach Brian Mukasa',
    phone: '+256701234567',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    country_code: 'UG',
    region: 'Kampala / Central',
    is_demo: 0,
    created_at: daysAgo(60),
    profile: {
      invite_code: 'BRIAN256',
      bio: 'Certified strength & conditioning coach with 8 years experience helping busy Kampala professionals get fit without gym burnout. Specialising in high-protein local Ugandan nutrition and home calisthenics.',
      whatsapp_number: '+256701234567',
      call_channel: 'whatsapp',
      call_link: 'https://meet.google.com/flexifit-brian',
      monthly_rate_ugx: 90000,
    },
  };

  // 6 Clients with diverse personas and compliance states
  const clients = [
    {
      id: 'client_akello_grace',
      email: 'akello@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'Grace Akello',
      phone: '+256772111222',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      country_code: 'UG',
      region: 'Kampala / Central',
      is_demo: 0,
      created_at: daysAgo(35),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 1900,
        target_protein_g: 130,
        target_carbs_g: 210,
        target_fat_g: 55,
        current_weight_kg: 74.2,
        target_weight_kg: 66.0,
        goal_type: 'weight_loss',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'missed_checkin', // Last check-in 11 days ago
    },
    {
      id: 'client_kigozi_denis',
      email: 'kigozi@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'Denis Kigozi',
      phone: '+256782333444',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      country_code: 'UG',
      region: 'Kampala / Central',
      is_demo: 0,
      created_at: daysAgo(30),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 2500,
        target_protein_g: 160,
        target_carbs_g: 300,
        target_fat_g: 75,
        current_weight_kg: 88.5,
        target_weight_kg: 82.0,
        goal_type: 'muscle_gain',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'low_macro', // 7-day adherence 45%
    },
    {
      id: 'client_namubiru_faith',
      email: 'faith@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'Faith Namubiru',
      phone: '+256704555666',
      avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      country_code: 'UG',
      region: 'Kampala / Central',
      is_demo: 0,
      created_at: daysAgo(25),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 1800,
        target_protein_g: 120,
        target_carbs_g: 200,
        target_fat_g: 50,
        current_weight_kg: 68.0,
        target_weight_kg: 62.0,
        goal_type: 'weight_loss',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'no_recent_workout', // 5 days since last workout
    },
    {
      id: 'client_ochieng_david',
      email: 'ochieng@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'David Ochieng',
      phone: '+256752777888',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      country_code: 'UG',
      region: 'Kampala / Central',
      is_demo: 0,
      created_at: daysAgo(28),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 2300,
        target_protein_g: 150,
        target_carbs_g: 260,
        target_fat_g: 70,
        current_weight_kg: 79.4,
        target_weight_kg: 75.0,
        goal_type: 'general_fitness',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'borderline', // Weigh-in 6 days ago
    },
    {
      id: 'client_tumusiime_sarah',
      email: 'sarah@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'Sarah Tumusiime',
      phone: '+256779999000',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      country_code: 'UG',
      region: 'Kampala / Central',
      is_demo: 0,
      created_at: daysAgo(40),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 2000,
        target_protein_g: 135,
        target_carbs_g: 225,
        target_fat_g: 60,
        current_weight_kg: 71.0,
        target_weight_kg: 65.0,
        goal_type: 'weight_loss',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'compliant', // Fully compliant
    },
    {
      id: 'client_ssenyonga_ivan',
      email: 'ivan@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'Ivan Ssenyonga',
      phone: '+256712333111',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      country_code: 'UG',
      region: 'Kampala / Central',
      is_demo: 0,
      created_at: daysAgo(45),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 2600,
        target_protein_g: 170,
        target_carbs_g: 310,
        target_fat_g: 80,
        current_weight_kg: 84.0,
        target_weight_kg: 78.0,
        goal_type: 'endurance',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'compliant', // Fully compliant
    },
  ];

  return { trainer, clients, daysAgo };
}

// Backward-compatible alias
export const generateDemoSeed = generatePilotSeed;
