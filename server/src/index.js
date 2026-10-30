// server/src/index.js
// FlexiFit Express server entry point

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import rateLimit from 'express-rate-limit';

import config from './config.js';
import { createAdapter } from './db/adapter.js';

import authRouter from './routes/auth.js';
import trainerRouter from './routes/trainer.js';
import clientRouter from './routes/client.js';
import foodsRouter from './routes/foods.js';
import plansRouter from './routes/plans.js';
import messagesRouter from './routes/messages.js';
import subscriptionsRouter from './routes/subscriptions.js';
import formCheckRouter from './routes/formCheck.js';
import feedbackRouter from './routes/feedback.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Global middleware ─────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ── System Health check (unthrottled for cloud monitoring) ──
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Ensure uploads folder exists and serve statically
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Rate limiting for auth & AI endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// ── Database adapter ──────────────────────────────────────
const adapter = await createAdapter();
await adapter.initialize();
app.locals.db = adapter;

// ── Detailed API Health check ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: config.USE_LOCAL_DB ? 'local' : 'oracle',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/trainer', trainerRouter);
app.use('/api/client', clientRouter);
app.use('/api/foods', foodsRouter);
app.use('/api/plans', plansRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/form-checks', formCheckRouter);

// ── Serve built client in production (with SPA fallback) ──
const clientDist = path.resolve(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: any non-API route returns index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/healthz') {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── Start server ──────────────────────────────────────────
const HOST = '0.0.0.0';
const server = app.listen(config.PORT, HOST, () => {
  console.log(
    `FlexiFit server running on http://${HOST}:${config.PORT} [${config.USE_LOCAL_DB ? 'local SQLite' : 'Oracle ORDS'}]`
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
