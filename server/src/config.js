// server/src/config.js
// Loads environment variables and exports a frozen configuration object.

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root (two levels up from server/src/)
dotenv.config({ path: resolve(__dirname, '../../.env') });

const config = Object.freeze({
  // ── Server ──────────────────────────────────────────────
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'flexifit-dev-secret-change-me',

  // ── External services ───────────────────────────────────
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  ORDS_BASE_URL: process.env.ORDS_BASE_URL || '',

  // ── Uploads ─────────────────────────────────────────────
  MAX_UPLOAD_MB: parseInt(process.env.MAX_UPLOAD_MB, 10) || 50,

  // ── Database mode ───────────────────────────────────────
  // When ORDS_BASE_URL is empty/falsy we fall back to local SQLite
  USE_LOCAL_DB: !process.env.ORDS_BASE_URL,

  // ── Flag threshold constants ────────────────────────────
  FLAG_NO_WORKOUT_DAYS: 3,
  FLAG_MACRO_ADHERENCE_PCT: 70,
  FLAG_NO_WEIGHT_DAYS: 7,
  FLAG_CHECKIN_MISSED_DAYS: 7,
});

export default config;
