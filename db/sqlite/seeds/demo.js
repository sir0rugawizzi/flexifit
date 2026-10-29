// Demo Seed Data: Coach Brian + 6 Clients with 4 Weeks of History
// Password for all seeded demo accounts is "password123"
// Standard precomputed bcrypt hash for "password123" ($2a$10$wT4M46k4L0sY9nZ8bI/Yv.Yf79tO5M0q9f649C9L.Ww85xN8gT0.W or standard 10-round hash)
export const DEMO_PASSWORD_HASH = '$2b$10$3euPcmQ1doWy0W2m0c6/4.uVq/51Z2Mgl9VvE.yK4U6Uo.tTj2p5S';

export function generateDemoSeed() {
  const passwordHash = DEMO_PASSWORD_HASH;

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
    is_demo: 1,
    created_at: daysAgo(60),
    profile: {
      bio: 'Certified strength & conditioning coach with 8 years experience helping busy Kampala professionals get fit without gym burnout. Specialising in high-protein local Ugandan nutrition and home calisthenics.',
      whatsapp_number: '+256701234567',
      call_channel: 'whatsapp',
      call_link: 'https://meet.google.com/flexifit-demo',
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
      is_demo: 1,
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
      is_demo: 1,
      created_at: daysAgo(40),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 2400,
        target_protein_g: 160,
        target_carbs_g: 280,
        target_fat_g: 70,
        current_weight_kg: 82.5,
        target_weight_kg: 76.0,
        goal_type: 'muscle_gain',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'low_macro', // 7-day macro adherence ~52% (too much chapati/mandazi)
    },
    {
      id: 'client_namubiru_faith',
      email: 'faith@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'Faith Namubiru',
      phone: '+256752555666',
      avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      country_code: 'UG',
      region: 'Kampala / Central',
      is_demo: 1,
      created_at: daysAgo(30),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 1800,
        target_protein_g: 120,
        target_carbs_g: 200,
        target_fat_g: 50,
        current_weight_kg: 69.8,
        target_weight_kg: 64.0,
        goal_type: 'weight_loss',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'no_recent_workout', // Last workout 5 days ago
    },
    {
      id: 'client_ochieng_david',
      email: 'ochieng@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'David Ochieng',
      phone: '+256702777888',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      country_code: 'UG',
      region: 'Northern / Gulu',
      is_demo: 1,
      created_at: daysAgo(45),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 2300,
        target_protein_g: 150,
        target_carbs_g: 270,
        target_fat_g: 65,
        current_weight_kg: 78.4,
        target_weight_kg: 74.0,
        goal_type: 'general_fitness',
        country_code: 'UG',
        region: 'Northern / Gulu',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'borderline', // Last weight 6 days ago, macro ~73%
    },
    {
      id: 'client_tumusiime_ronald',
      email: 'ronald@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'Ronald Tumusiime',
      phone: '+256774999000',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      country_code: 'UG',
      region: 'Western / Mbarara',
      is_demo: 1,
      created_at: daysAgo(50),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 2500,
        target_protein_g: 170,
        target_carbs_g: 300,
        target_fat_g: 70,
        current_weight_kg: 79.1,
        target_weight_kg: 82.0,
        goal_type: 'muscle_gain',
        country_code: 'UG',
        region: 'Western / Mbarara',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'on_track', // High adherence, consistent workouts
    },
    {
      id: 'client_nalwanga_brenda',
      email: 'brenda@flexifit.ug',
      password_hash: passwordHash,
      role: 'client',
      name: 'Brenda Nalwanga',
      phone: '+256784111333',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      country_code: 'UG',
      region: 'Kampala / Central',
      is_demo: 1,
      created_at: daysAgo(55),
      profile: {
        trainer_id: 'user_trainer_brian',
        target_calories: 1750,
        target_protein_g: 125,
        target_carbs_g: 180,
        target_fat_g: 48,
        current_weight_kg: 63.4,
        target_weight_kg: 60.0,
        goal_type: 'weight_loss',
        country_code: 'UG',
        region: 'Kampala / Central',
        preferred_portion_unit: 'local_visual',
      },
      flag_scenario: 'on_track', // Perfect adherence
    },
  ];

  return { trainer, clients, daysAgo };
}
