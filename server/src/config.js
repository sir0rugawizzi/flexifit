// server/src/config.js
// Loads environment variables and exports a frozen configuration object.

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root (two levels up from server/src/)
dotenv.config({ path: resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// In production, require JWT_SECRET and refuse to start without it
if (isProduction && (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim())) {
  console.error('FATAL: JWT_SECRET environment variable is required in production.');
  process.exit(1);
}

const config = Object.freeze({
  // ── Server ──────────────────────────────────────────────
  PORT: parseInt(process.env.PORT, 10) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'flexifit-dev-secret-change-me',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // ── External services ───────────────────────────────────
  // Google Gemini API (free-tier vision-capable model)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  ORDS_BASE_URL: process.env.ORDS_BASE_URL || '',

  // ── Uploads ─────────────────────────────────────────────
  MAX_UPLOAD_MB: parseInt(process.env.MAX_UPLOAD_MB, 10) || 50,

  // ── Database mode ───────────────────────────────────────
  // When ORDS_BASE_URL is empty/falsy we fall back to local SQLite
  USE_LOCAL_DB: !process.env.ORDS_BASE_URL,

  // ── Seeding (Only seed sample data when explicitly enabled) ─
  SEED_SAMPLE_DATA: process.env.SEED_SAMPLE_DATA === 'true',
  SEED_PASSWORD: process.env.SEED_PASSWORD || '',

  // ── Flag threshold constants ────────────────────────────
  FLAG_NO_WORKOUT_DAYS: 3,
  FLAG_MACRO_ADHERENCE_PCT: 70,
  FLAG_NO_WEIGHT_DAYS: 7,
  FLAG_CHECKIN_MISSED_DAYS: 7,
});

export default config;
