// server/src/index.js
// FlexiFit Express entry point.

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

import config from './config.js';
import { createAdapter } from './db/adapter.js';

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Global middleware ─────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Database adapter ──────────────────────────────────────
const adapter = await createAdapter();
await adapter.initialize();
app.locals.db = adapter;

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: config.USE_LOCAL_DB ? 'local' : 'oracle',
    timestamp: new Date().toISOString(),
  });
});

// ── Route mounting (placeholder) ──────────────────────────
// Phase 2: auth routes
// Phase 3: trainer routes
// Phase 4: client routes
// Phase 5: messaging routes
// Phase 6: AI routes
// Phase 7: analytics routes

// ── Serve built client in production ──────────────────────
const clientDist = path.resolve(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Catch-all: serve index.html for client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── Start server ──────────────────────────────────────────
const server = app.listen(config.PORT, () => {
  console.log(
    `FlexiFit server running on port ${config.PORT} [${config.USE_LOCAL_DB ? 'local SQLite' : 'Oracle ORDS'}]`
  );
});

// ── Graceful shutdown ─────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received – shutting down…`);
  await adapter.close();
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;
