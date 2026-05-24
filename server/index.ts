import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initFirebaseAdmin, getAdminDb } from './services/firebaseAdmin.js';
import { setSchedulerDb, startScheduler } from './services/scheduler.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import bookingRoutes from './routes/bookings.js';
import notificationRoutes from './routes/notifications.js';

const PORT = process.env.PORT ?? 3001;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);

// Make db accessible to routes
app.set('db', null); // set after init

// ─── 404 + error handler ──────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Startup ──────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  initFirebaseAdmin();

  try {
    const db = getAdminDb();
    app.set('db', db);
    setSchedulerDb(db);
    startScheduler();
    console.log('[Server] Firebase Admin ready');
  } catch (err: any) {
    console.warn('[Server] Firebase Admin not available, running in fallback mode:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  });
}

start();
